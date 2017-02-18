import { Readable, ReadableOptions } from 'stream';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import { homedir } from 'os';
import { ReadLine, createInterface } from 'readline';

export function starSystemDistance (a: EDPosition, b: EDPosition): number {
	return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
}

export type EDPosition = [number, number, number];

export const locations = {
	Sol: <EDPosition>[0, 0, 0],
	Core: <EDPosition>[25.21875, -20.90625, 25899.96875],
}

export interface RawLog {
	timestamp: string;
	event: string;
}

export interface IEventBase {
	timestamp: Date;
	readonly event: string;
}

export type Allegiance = 'None' | 'Independant' | 'Empire' | 'Alliance' | 'Federation';
export type FactionState = 'None' | 'Retreat' | 'Lockdown' | 'CivilUnrest' | 'CivilWar' | 'Boom' | 'Expansion' | 'Bust' | 'Famine' | 'Election' | 'Investment' | 'Outbreak'| 'War';
export type Economy = '$economy_None;'
export type Securty = '$SYSTEM_SECURITY_low;' | '$SYSTEM_SECURITY_medium;' | '$SYSTEM_SECURITY_high;';

export interface IBaseLocation extends IEventBase {
	StarSystem: string;
	SystemAllegiance?: Allegiance;
	SystemEconomy: Economy;
	SystemFaction: string;
	FactionState: FactionState;
	StarPos: EDPosition;

	SystemEconomy_Localised?: string;
	SystemGovernment_Localised: string;
	SystemSecurity_Localised: string;
}

export interface IFSDJump extends IBaseLocation {
	JumpDist: number;
	FuelUsed: number;
	FuelLevel: number;
	Powers: string[]; // TODO: enum
	PowerplayState: string; // TODO: enum
}

export interface IReceivedText extends IEventBase {
	Channel: 'local' | 'npc' | 'direct' | 'player';
	// If Channel is player, this will be prefixed with a `&`
	From?: string;
	Message: string;
	// May be null for station transmissions
	From_Localised?: string;
	// Only set when channel is npc.
	Message_Localised?: string;
}

export interface ISendText extends IEventBase {
	Message: string;
	To: 'local' | string;
}

export class EDEvent {
	public timestamp: Date;
	public readonly event: string;
	constructor (rawLog: RawLog) {
		Object.assign(this, rawLog);
		this.timestamp = new Date(this.timestamp);
	}
}

export interface IBounty extends IEventBase {
	Target: string;
	VictimFaction: string;
	TotalReward: number;
}

export interface IFuelScoop extends IEventBase {
	Scooped: number;
	Total: number;
}

export interface ILaunchSRV extends IEventBase {
	Loadout: 'starter';
	PlayerController: boolean;
}

export interface ILoadGame extends IEventBase {
	Commander: string;
	Ship: string;
	ShipID: number;
	GameMode: 'Solo' | 'Group' | 'Open';
	Credits: number;
	Loan: 0;
}

export interface IRankProgress extends IEventBase {
	Combat: number;
	Trade: number;
	Explorer: number;
	Empire: number;
	Federation: number;
	CQC: number;
}

export interface ISupercruiseExit extends IEventBase {
    StarSystem: string;
    Body: string;
    BodyType: 'Star' | 'Planet';
}

export interface ISupercruiseEntry extends IEventBase {
    StarSystem: string;
}

export interface ICommitCrime extends IEventBase {
    CrimeType: 'assault';
    Faction: string;
    Victim: string;
    Bounty: number;
}

export interface ILogFileSwap {
	file: string;
}

class ContinuesReadStream extends Readable {
	private closed = false;
	private offset = 0;
	private file: number;
	private poll: NodeJS.Timer;
	private buffer: Buffer;
	constructor (private fileName: string, opts?: ReadableOptions) {
		super(opts);
		this.closed = false;
	}

	public seekToEnd () {
		this.offset = fs.statSync(this.fileName).size;
	}

	public close () {
		if (this.closed) {
			throw new Error('Already closed');
		}
		if (!this.file) {
			return;
		}
		fs.closeSync(this.file);
		clearInterval(this.poll);
		this.closed = true;
	}

	protected _read () {
		if (this.file) {
			return;
		}
		this.buffer = Buffer.alloc(0xFFFF);
		this.file = fs.openSync(this.fileName, 'r');
		this.poll = setInterval(() => {
			try {
				const read = fs.readSync(this.file, this.buffer, 0, 0xFFFF, this.offset);
				this.offset += read;
				if(!this.push(this.buffer.toString('utf8', 0, read))) {
					this.close();
				}
			} catch (e) {
				process.nextTick(() => this.emit('error', e));
			}
		}, 100);
	}
}

export class EDLog extends EventEmitter {
	private directory = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous');
	private fileStream: ContinuesReadStream;
	private fileName: string;
	private lineStream: ReadLine;

	public on(event: 'event:FSDJump', cb: (event: IFSDJump) => void): this;
	public on(event: 'event:ReceiveText', cb: (event: IReceivedText) => void): this;
	public on(event: 'event:SendText', cb: (event: ISendText) => void): this;
	public on(event: 'event:Bounty', cb: (event: IBounty) => void): this;
	public on(event: 'event:FuelScoop', cb: (event: IFuelScoop) => void): this;
	public on(event: 'event:LaunchSRV', cb: (event: ILaunchSRV) => void): this;
	public on(event: 'event:LoadGame', cb: (event: ILoadGame) => void): this;
	public on(event: 'event:RankProgress', cb: (event: IRankProgress) => void): this;
	public on(event: 'event:SupercruiseExit', cb: (event: ISupercruiseExit) => void): this;
	public on(event: 'event:SupercruiseEntry', cb: (event: ISupercruiseEntry) => void): this;
	public on(event: 'event:CommitCrime', cb: (event: ICommitCrime) => void): this;
	public on(event: 'event', cb: (event: EDEvent) => void): this;
	public on(event: 'file', cb: (event: ILogFileSwap) => void): this;
	public on(event: 'warn', cb: (event: Error) => void): this;
	public on<T>(event: string, cb: (event: T) => void): this;
	public on(event: string | symbol, cb: (event: any) => void): this {
		return super.on(event, cb);
	}

	public once(event: 'event:FSDJump', cb: (event: IFSDJump) => void): this;
	public once(event: 'event:ReceiveText', cb: (event: IReceivedText) => void): this;
	public once(event: 'event:SendText', cb: (event: ISendText) => void): this;
	public once(event: 'event:Bounty', cb: (event: IBounty) => void): this;
	public once(event: 'event:FuelScoop', cb: (event: IFuelScoop) => void): this;
    public once(event: 'event:LaunchSRV', cb: (event: ILaunchSRV) => void): this;
	public once(event: 'event:LoadGame', cb: (event: ILoadGame) => void): this;
	public once(event: 'event:RankProgress', cb: (event: IRankProgress) => void): this;
	public once(event: 'event:SupercruiseExit', cb: (event: ISupercruiseExit) => void): this;
	public once(event: 'event:SupercruiseEntry', cb: (event: ISupercruiseEntry) => void): this;
	public once(event: 'event:CommitCrime', cb: (event: ICommitCrime) => void): this;
	public once(event: 'event', cb: (event: EDEvent) => void): this;
	public once(event: 'file', cb: (event: ILogFileSwap) => void): this;
	public once(event: 'warn', cb: (event: Error) => void): this;
	public once<T>(event: string, cb: (event: T) => void): this;
	public once(event: string | symbol, cb: (event: any) => void): this {
		return super.once(event, cb);
	}

	public end (): void {
		delete this.fileName;
		if (this.fileStream) {
			this.fileStream.close();
		}
		if (this.lineStream) {
			this.lineStream.close();
		}
	}

	public listenToFile (file: string, skip: boolean = false) {
		file = join(this.directory, file);
		this.end();
		this.emit('file', {
			file,
		});

		this.fileName = file;
		this.fileStream = new ContinuesReadStream(file);
		if (skip) {
			this.fileStream.seekToEnd();
		}
		this.lineStream = createInterface({
			input: this.fileStream,
		});
		this.lineStream.on('line', data => {
			const ev = new EDEvent(JSON.parse(data));
			this.emit('event', ev);
			this.emit(`event:${ev.event}`, ev);
		});
	}

	public start () {
		const fileMatcher = /Journal\.(\d+)\.\d+.log$/;

		fs.watch(this.directory, (eventType, fileName) => {
			if (eventType === 'change') {
				return;
			}
			if (fileName === this.fileName) {
				return;
			}
			if (!fileName.match(fileMatcher)) {
				this.emit('warn', new Error(`Unknown file in log folder ${fileName}`));
				return;
			}
			this.listenToFile(fileName);
		});


		const latestFile = fs.readdirSync(this.directory).sort((a, b) => {
			const aDate = fileMatcher.exec(a);
			const bDate = fileMatcher.exec(b);
			return Number(bDate[1]) - Number(aDate[1]);
		})[0];

		this.listenToFile(latestFile, true);
	}
}

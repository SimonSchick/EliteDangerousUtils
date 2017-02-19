import { ContinuesReadStream } from './ContinousReadStream';
import {
    IFSDJump,
    IReceivedText,
    ISendText,
    IBounty,
    IFuelScoop,
    ILaunchSRV,
    ILoadGame,
    IRankProgress,
    ISupercruiseExit,
    ISupercruiseEntry,
    ICommitCrime,
    IMaterialCollected,
    IMaterialDiscarded,
    ILogFileSwap,
    IMissionAccepted,
    IMissionCompleted
} from './events';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import { homedir } from 'os';
import { ReadLine, createInterface } from 'readline';

export interface RawLog {
    timestamp: string;
    event: string;
}

export class EDEvent implements EDEvent {
    public timestamp: Date;
    public readonly event: string;
    constructor (rawLog: RawLog) {
        Object.assign(this, rawLog);
        this.timestamp = new Date(this.timestamp);
    }
}

export class EDLog extends EventEmitter {
    private directory = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous'); // TODO: OSX Support
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
    public on(event: 'event:IMaterialCollected', cb: (event: IMaterialCollected) => void): this;
    public on(event: 'event:IMaterialDiscarded', cb: (event: IMaterialDiscarded) => void): this;
    public on(event: 'event:MissionAccepted', cb: (event: IMissionAccepted) => void): this;
    public on(event: 'event:MissionCompleted', cb: (event: IMissionCompleted) => void): this;
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
    public once(event: 'event:IMaterialCollected', cb: (event: IMaterialCollected) => void): this;
    public once(event: 'event:IMaterialDiscarded', cb: (event: IMaterialDiscarded) => void): this;
    public once(event: 'event:MissionAccepted', cb: (event: IMissionAccepted) => void): this;
    public once(event: 'event:MissionCompleted', cb: (event: IMissionCompleted) => void): this;
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

    private listenToFile (file: string, skip: boolean = false) {
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

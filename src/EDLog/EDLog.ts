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
    IMissionCompleted,
    IModuleBuy,
    ISellExplorationData,
    IRefuelAll,
    IBuyAmmo,
    IShieldState,
    IDockingRequested,
    IDockingGranted,
    IMarketBuy,
    IMarketSell,
    IDocked,
    IUndocked,
    IUSSDrop,
    ITouchdown,
    ILiftoff,
    IEngineerCraft,
    IEngineerApply,
    IEngineerProgress,
    IHullDamage,
    IInterdicted,
    ILaunchFighter,
    IRepairAll,
    ILocation,
    IFileheader,
    IShipyardSell,
    IShipyardSwap,
    IShipyardTransfer,
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

/**
 * Util wrapper for ED events.
 */
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
    public on(event: 'event:Rank', cb: (event: IRankProgress) => void): this;
    public on(event: 'event:Progress', cb: (event: IRankProgress) => void): this;
    public on(event: 'event:SupercruiseExit', cb: (event: ISupercruiseExit) => void): this;
    public on(event: 'event:SupercruiseEntry', cb: (event: ISupercruiseEntry) => void): this;
    public on(event: 'event:CommitCrime', cb: (event: ICommitCrime) => void): this;
    public on(event: 'event:MaterialCollected', cb: (event: IMaterialCollected) => void): this;
    public on(event: 'event:MaterialDiscarded', cb: (event: IMaterialDiscarded) => void): this;
    public on(event: 'event:MissionAccepted', cb: (event: IMissionAccepted) => void): this;
    public on(event: 'event:MissionCompleted', cb: (event: IMissionCompleted) => void): this;
    public on(event: 'event:ModuleBuy', cb: (event: IModuleBuy) => void): this;
    public on(event: 'event:SellExplorationData', cb: (event: ISellExplorationData) => void): this;
    public on(event: 'event:RefuelAll', cb: (event: IRefuelAll) => void): this;
    public on(event: 'event:BuyAmmo', cb: (event: IBuyAmmo) => void): this;
    public on(event: 'event:ShieldState', cb: (event: IShieldState) => void): this;
    public on(event: 'event:DockingRequested', cb: (event: IDockingRequested) => void): this;
    public on(event: 'event:DockingGranted', cb: (event: IDockingGranted) => void): this;
    public on(event: 'event:MarketBuy', cb: (event: IMarketBuy) => void): this;
    public on(event: 'event:MarketSell', cb: (event: IMarketSell) => void): this;
    public on(event: 'event:Docked', cb: (event: IDocked) => void): this;
    public on(event: 'event:Undocked', cb: (event: IUndocked) => void): this;
    public on(event: 'event:USSDrop', cb: (event: IUSSDrop) => void): this;
    public on(event: 'event:Touchdown', cb: (event: ITouchdown) => void): this;
    public on(event: 'event:Liftoff', cb: (event: ILiftoff) => void): this;
    public on(event: 'event:EngineerCraft', cb: (event: IEngineerCraft) => void): this;
    public on(event: 'event:EngineerApply', cb: (event: IEngineerApply) => void): this;
    public on(event: 'event:EngineerProgress', cb: (event: IEngineerProgress) => void): this;
    public on(event: 'event:HullDamage', cb: (event: IHullDamage) => void): this;
    public on(event: 'event:Interdicted', cb: (event: IInterdicted) => void): this;
    public on(event: 'event:LaunchFighter', cb: (event: ILaunchFighter) => void): this;
    public on(event: 'event:RepairAll', cb: (event: IRepairAll) => void): this;
    public on(event: 'event:Location', cb: (event: ILocation) => void): this;
    public on(event: 'event:Fileheader', cb: (event: IFileheader) => void): this;
    public on(event: 'event:ShipyardSell', cb: (event: IShipyardSell) => void): this;
    public on(event: 'event:ShipyardSwap', cb: (event: IShipyardSwap) => void): this;
    public on(event: 'event:ShipyardTransfer', cb: (event: IShipyardTransfer) => void): this;
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
    public once(event: 'event:Rank', cb: (event: IRankProgress) => void): this;
    public once(event: 'event:Progress', cb: (event: IRankProgress) => void): this;
    public once(event: 'event:SupercruiseExit', cb: (event: ISupercruiseExit) => void): this;
    public once(event: 'event:SupercruiseEntry', cb: (event: ISupercruiseEntry) => void): this;
    public once(event: 'event:CommitCrime', cb: (event: ICommitCrime) => void): this;
    public once(event: 'event:MaterialCollected', cb: (event: IMaterialCollected) => void): this;
    public once(event: 'event:MaterialDiscarded', cb: (event: IMaterialDiscarded) => void): this;
    public once(event: 'event:MissionAccepted', cb: (event: IMissionAccepted) => void): this;
    public once(event: 'event:MissionCompleted', cb: (event: IMissionCompleted) => void): this;
    public once(event: 'event:ModuleBuy', cb: (event: IModuleBuy) => void): this;
    public once(event: 'event:SellExplorationData', cb: (event: ISellExplorationData) => void): this;
    public once(event: 'event:RefuelAll', cb: (event: IRefuelAll) => void): this;
    public once(event: 'event:BuyAmmo', cb: (event: IBuyAmmo) => void): this;
    public once(event: 'event:ShieldState', cb: (event: IShieldState) => void): this;
    public once(event: 'event:DockingRequested', cb: (event: IDockingRequested) => void): this;
    public once(event: 'event:DockingGranted', cb: (event: IDockingGranted) => void): this;
    public once(event: 'event:MarketBuy', cb: (event: IMarketBuy) => void): this;
    public once(event: 'event:MarketSell', cb: (event: IMarketSell) => void): this;
    public once(event: 'event:Docked', cb: (event: IDocked) => void): this;
    public once(event: 'event:Undocked', cb: (event: IUndocked) => void): this;
    public once(event: 'event:USSDrop', cb: (event: IUSSDrop) => void): this;
    public once(event: 'event:Touchdown', cb: (event: ITouchdown) => void): this;
    public once(event: 'event:Liftoff', cb: (event: ILiftoff) => void): this;
    public once(event: 'event:EngineerCraft', cb: (event: IEngineerCraft) => void): this;
    public once(event: 'event:EngineerApply', cb: (event: IEngineerApply) => void): this;
    public once(event: 'event:EngineerProgress', cb: (event: IEngineerProgress) => void): this;
    public once(event: 'event:HullDamage', cb: (event: IHullDamage) => void): this;
    public once(event: 'event:Interdicted', cb: (event: IInterdicted) => void): this;
    public once(event: 'event:LaunchFighter', cb: (event: ILaunchFighter) => void): this;
    public once(event: 'event:RepairAll', cb: (event: IRepairAll) => void): this;
    public once(event: 'event:Location', cb: (event: ILocation) => void): this;
    public once(event: 'event:Fileheader', cb: (event: IFileheader) => void): this;
    public once(event: 'event:ShipyardSell', cb: (event: IShipyardSell) => void): this;
    public once(event: 'event:ShipyardSwap', cb: (event: IShipyardSwap) => void): this;
    public once(event: 'event:ShipyardTransfer', cb: (event: IShipyardTransfer) => void): this;
    public once(event: 'event', cb: (event: EDEvent) => void): this;
    public once(event: 'file', cb: (event: ILogFileSwap) => void): this;
    public once(event: 'warn', cb: (event: Error) => void): this;
    public once<T>(event: string, cb: (event: T) => void): this;
    public once(event: string | symbol, cb: (event: any) => void): this {
        return super.once(event, cb);
    }

    /**
     * Ends the log reader.
     */
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
        this.fileStream.on('error', error => this.emit('warn', error));
        if (skip) {
            this.fileStream.seekToEnd();
        }
        this.lineStream = createInterface({
            input: this.fileStream,
        });
        this.lineStream.on('line', line => {
            const ev = new EDEvent(JSON.parse(line));
            this.emit('event', ev);
            this.emit(`event:${ev.event}`, ev);
        });
    }

    /**
     * Launches the log reader.
     * @param If true the method will return an array of event logs, otherwise empty.
     */
    public start (processBacklog: boolean = false): EDEvent[] {
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


        const files = fs.readdirSync(this.directory)
        .sort((a, b) => {
            const aDate = fileMatcher.exec(a);
            const bDate = fileMatcher.exec(b);
            return Number(aDate[1]) - Number(bDate[1]);
        });

        const bl: EDEvent[] = [];
        if (processBacklog) {
            files.forEach(fileName => {
                fs.readFileSync(join(this.directory, fileName), 'utf8')
                .split('\n')
                .forEach(line => {
                    if (line === '') {
                        return;
                    }
                    bl.push(new EDEvent(JSON.parse(line)));
                });
            });
        }

        this.listenToFile(files[files.length - 1], true);
        return bl;
    }
}

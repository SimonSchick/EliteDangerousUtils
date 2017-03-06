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
    IEscapeInterdiction,
    ILaunchFighter,
    IRepairAll,
    ILocation,
    IFileheader,
    IShipyardSell,
    IShipyardSwap,
    IShipyardTransfer,
    IEjectCargo,
    IHeatWarning,
    IScreenshot,
    IRedeemVoucher,
    IPayLegacyFines,
    IRebootRepair,
    IMaterialDiscovered,
    IDockingCancelled,
    IDockingDenied,
    IDockingTimeout,
    INewCommander,
    IClearSavedGame,
    ISynthesis,
    IDockSRV,
    IDied,
    IResurrect,
    IDatalinkScan,
    IDatalinkVoucher,
    IModuleSell,
    IWingAdd,
    IWingJoin,
    IWingLeave,
    ICrewAssign,
    IModuleSellRemote,
    IDockFighter,
    IVehicleSwitch,
    IRestockVehicle,
    IFetchRemoteModule,
    IPowerplayJoin,
    IPowerplaySalary,
    IFactionKillBond,
    IInterdiction,
    IApproachSettlement,
    IDataScanned,
    IPromotion,
    ICollectCargo,
    IModuleRetrieve,
    IModuleStore,
    IMissionFailed,
    IRepair,
    IPVPKill,
    ICommunityGoalJoin,
    ICommunityGoalReward,
    IPayFines,
    IJetConeBoost,
    IShipyardBuy,
    IShipyardNew,
    IBuyExplorationData,
    ICockpitBreached,

    // Future
    ICargo,
    ILoadout,
    IMaterials,
    ISetUserShipName,
    IStartJump,
    IScanned,
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

export type Events = {
    'event:FSDJump': IFSDJump,
    'event:ReceiveText': IReceivedText,
    'event:SendText': ISendText,
    'event:Bounty': IBounty,
    'event:FuelScoop': IFuelScoop,
    'event:LaunchSRV': ILaunchSRV,
    'event:LoadGame': ILoadGame,
    'event:Rank': IRankProgress,
    'event:Progress': IRankProgress,
    'event:SupercruiseExit': ISupercruiseExit,
    'event:SupercruiseEntry': ISupercruiseEntry,
    'event:CommitCrime': ICommitCrime,
    'event:MaterialCollected': IMaterialCollected,
    'event:MaterialDiscarded': IMaterialDiscarded,
    'event:MissionAccepted': IMissionAccepted,
    'event:MissionCompleted': IMissionCompleted,
    'event:ModuleBuy': IModuleBuy,
    'event:SellExplorationData': ISellExplorationData,
    'event:RefuelAll': IRefuelAll,
    'event:BuyAmmo': IBuyAmmo,
    'event:ShieldState': IShieldState,
    'event:DockingRequested': IDockingRequested,
    'event:DockingGranted': IDockingGranted,
    'event:DockingCancelled': IDockingCancelled,
    'event:DockingDenied': IDockingDenied,
    'event:DockingTimeout': IDockingTimeout,
    'event:MarketBuy': IMarketBuy,
    'event:MarketSell': IMarketSell,
    'event:Docked': IDocked,
    'event:Undocked': IUndocked,
    'event:USSDrop': IUSSDrop,
    'event:Touchdown': ITouchdown,
    'event:Liftoff': ILiftoff,
    'event:EngineerCraft': IEngineerCraft,
    'event:EngineerApply': IEngineerApply,
    'event:EngineerProgress': IEngineerProgress,
    'event:HullDamage': IHullDamage,
    'event:Interdicted': IInterdicted,
    'event:EscapeInterdiction': IEscapeInterdiction,
    'event:LaunchFighter': ILaunchFighter,
    'event:RepairAll': IRepairAll,
    'event:Location': ILocation,
    'event:Fileheader': IFileheader,
    'event:ShipyardSell': IShipyardSell,
    'event:ShipyardSwap': IShipyardSwap,
    'event:ShipyardTransfer': IShipyardTransfer,
    'event:EjectCargo': IEjectCargo,
    'event:HeatWarning': IHeatWarning,
    'event:Screenshot': IScreenshot,
    'event:RedeemVoucher': IRedeemVoucher,
    'event:PayLegacyFines': IPayLegacyFines,
    'event:RebootRepair': IRebootRepair,
    'event:MaterialDiscovered': IMaterialDiscovered,
    'event:NewCommander': INewCommander,
    'event:ClearSavedGame': IClearSavedGame,
    'event:Synthesis': ISynthesis,
    'event:DockSRV': IDockSRV,
    'event:Died': IDied,
    'event:Resurrect': IResurrect,
    'event:DatalinkScan': IDatalinkScan,
    'event:DatalinkVoucher': IDatalinkVoucher,
    'event:ModuleSell': IModuleSell,
    'event:WingAdd': IWingAdd,
    'event:WingJoin': IWingJoin,
    'event:WingLeave': IWingLeave,
    'event:CrewAssign': ICrewAssign,
    'event:ModuleSellRemote': IModuleSellRemote,
    'event:DockFighter': IDockFighter,
    'event:VehicleSwitch': IVehicleSwitch,
    'event:RestockVehicle': IRestockVehicle,
    'event:FetchRemoteModule': IFetchRemoteModule,
    'event:PowerplayJoin': IPowerplayJoin,
    'event:PowerplaySalary': IPowerplaySalary,
    'event:FactionKillBond': IFactionKillBond,
    'event:Interdiction': IInterdiction,
    'event:ApproachSettlement': IApproachSettlement,
    'event:DataScanned': IDataScanned,
    'event:Promotion': IPromotion,
    'event:CollectCargo': ICollectCargo,
    'event:ModuleRetrieve': IModuleRetrieve,
    'event:ModuleStore': IModuleStore,
    'event:MissionFailed': IMissionFailed,
    'event:Repair': IRepair,
    'event:PVPKill': IPVPKill,
    'event:CommunityGoalJoin': ICommunityGoalJoin,
    'event:CommunityGoalReward': ICommunityGoalReward,
    'event:PayFines': IPayFines,
    'event:JetConeBoost': IJetConeBoost,
    'event:ShipyardBuy': IShipyardBuy,
    'event:ShipyardNew': IShipyardNew,
    'event:BuyExplorationData': IBuyExplorationData,
    'event:CockpitBreached': ICockpitBreached,

    // Future
    'event:Cargo': ICargo,
    'event:Loudout': ILoadout,
    'event:Materials': IMaterials,
    'event:SetUserShipName': ISetUserShipName,
    'event:StartJump': IStartJump,
    'event:Scanned': IScanned,

    // Unscoped
    'event': EDEvent,
    'file': ILogFileSwap,
    'warn': Error,
}

export class EDLog extends EventEmitter {
    private directory = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous'); // TODO: OSX Support
    private fileStream: ContinuesReadStream;
    private fileName: string;
    private lineStream: ReadLine;

    public emit<K extends keyof Events>(event: K, value: Events[K]): boolean {
        return super.emit(event, value);
    }

    public on<K extends keyof Events>(event: K, cb: (event: Events[K]) => void): this;
    public on<T>(event: string, cb: (event: T) => void): this;
    public on(event: string | symbol, cb: (event: any) => void): this {
        return super.on(event, cb);
    }

    public once<K extends keyof Events>(event: K, cb: (event: Events[K]) => void): this;
    public once<T>(event: string, cb: (event: T) => void): this;
    public once(event: string | symbol, cb: (event: any) => void): this {
        return super.once(event, cb);
    }

    public listenerCount<K extends keyof Events>(event: K): number {
        return super.listenerCount(event);
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
            this.emit(<keyof Events>`event:${ev.event}`, ev);
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
                return;
            }
            this.listenToFile(fileName);
        });


        const files = fs.readdirSync(this.directory)
        .map(fileName => fileMatcher.exec(fileName))
        .filter(match => !!match)
        .sort((a, b) => Number(a[1]) - Number(b[1]))
        .map(matcher => matcher[0]);

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

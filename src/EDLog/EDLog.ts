import { EDLogReader } from './EDLogReader';
import { ContinuesReadStream } from './ContinousReadStream';
import {
    IApproachSettlement,
    IBounty,
    IBuyAmmo,
    IBuyDrones,
    IBuyExplorationData,
    IBuyTradeData,
    ICapShipBond,
    ICargo,
    IChangeCrewRole,
    IClearSavedGame,
    ICockpitBreached,
    ICollectCargo,
    ICommitCrime,
    ICommunityGoalDiscard,
    ICommunityGoalJoin,
    ICommunityGoalReward,
    ICrewAssign,
    ICrewHire,
    ICrewLaunchFighter,
    ICrewMemberJoins,
    ICrewMemberQuits,
    ICrewMemberRoleChange,
    IDataScanned,
    IDatalinkScan,
    IDatalinkVoucher,
    IDied,
    IDockFighter,
    IDockSRV,
    IDocked,
    IDockingCancelled,
    IDockingDenied,
    IDockingGranted,
    IDockingRequested,
    IDockingTimeout,
    IEjectCargo,
    IEndCrewSession,
    IEngineerApply,
    IEngineerCraft,
    IEngineerProgress,
    IEscapeInterdiction,
    IFSDJump,
    IFactionKillBond,
    IFetchRemoteModule,
    IFileheader,
    IFriends,
    IFuelScoop,
    IHeatDamage,
    IHeatWarning,
    IHullDamage,
    IInterdicted,
    IInterdiction,
    IJetConeBoost,
    IJetConeDamage,
    IJoinACrew,
    IKickCrewMember,
    ILaunchFighter,
    ILaunchSRV,
    ILiftoff,
    ILoadGame,
    ILoadout,
    ILocation,
    ILogFileSwap,
    IMarketBuy,
    IMarketSell,
    IMassModuleStore,
    IMaterialCollected,
    IMaterialDiscarded,
    IMaterialDiscovered,
    IMaterials,
    IMiningRefined,
    IMissionAbandoned,
    IMissionAccepted,
    IMissionCompleted,
    IMissionFailed,
    IModuleBuy,
    IModuleRetrieve,
    IModuleSell,
    IModuleSellRemote,
    IModuleStore,
    IModuleSwap,
    IMusic,
    INewCommander,
    IPVPKill,
    IPassengers,
    IPayFines,
    IPayLegacyFines,
    IPowerplayJoin,
    IPowerplaySalary,
    IPromotion,
    IQuitACrew,
    IRank,
    IRebootRepair,
    IReceiveText,
    IRedeemVoucher,
    IRefuelAll,
    IRepair,
    IRepairAll,
    IRestockVehicle,
    IResurrect,
    IScan,
    IScanned,
    IScreenshot,
    ISelfDestruct,
    ISellDrones,
    ISellExplorationData,
    ISendText,
    ISetUserShipName,
    IShieldState,
    IShipyardBuy,
    IShipyardNew,
    IShipyardSell,
    IShipyardSwap,
    IShipyardTransfer,
    IStartJump,
    ISupercruiseEntry,
    ISupercruiseExit,
    ISynthesis,
    ITouchdown,
    IUSSDrop,
    IUndocked,
    IVehicleSwitch,
    IWingAdd,
    IWingInvite,
    IWingJoin,
    IWingLeave,
    IRefuelPartial,
    IAfmuRepairs,
    IRepairDrone,
    IProgress,
} from './events';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import { ReadLine, createInterface } from 'readline';
import { findLast } from '../util/findLast';

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

export type GameEvents = {
    'event:ApproachSettlement': IApproachSettlement,
    'event:Bounty': IBounty,
    'event:BuyAmmo': IBuyAmmo,
    'event:BuyDrones': IBuyDrones,
    'event:BuyExplorationData': IBuyExplorationData,
    'event:BuyTradeData': IBuyTradeData,
    'event:CapShipBond': ICapShipBond,
    'event:Cargo': ICargo,
    'event:ChangeCrewRole': IChangeCrewRole,
    'event:ClearSavedGame': IClearSavedGame,
    'event:CockpitBreached': ICockpitBreached,
    'event:CollectCargo': ICollectCargo,
    'event:CommitCrime': ICommitCrime,
    'event:CommunityGoalDiscard': ICommunityGoalDiscard,
    'event:CommunityGoalJoin': ICommunityGoalJoin,
    'event:CommunityGoalReward': ICommunityGoalReward,
    'event:CrewAssign': ICrewAssign,
    'event:CrewHire': ICrewHire,
    'event:CrewLaunchFighter': ICrewLaunchFighter,
    'event:CrewMemberJoins': ICrewMemberJoins,
    'event:CrewMemberQuits': ICrewMemberQuits,
    'event:CrewMemberRoleChange': ICrewMemberRoleChange,
    'event:DataScanned': IDataScanned,
    'event:DatalinkScan': IDatalinkScan,
    'event:DatalinkVoucher': IDatalinkVoucher,
    'event:Died': IDied,
    'event:DockFighter': IDockFighter,
    'event:DockSRV': IDockSRV,
    'event:Docked': IDocked,
    'event:DockingCancelled': IDockingCancelled,
    'event:DockingDenied': IDockingDenied,
    'event:DockingGranted': IDockingGranted,
    'event:DockingRequested': IDockingRequested,
    'event:DockingTimeout': IDockingTimeout,
    'event:EjectCargo': IEjectCargo,
    'event:EndCrewSession': IEndCrewSession,
    'event:EngineerApply': IEngineerApply,
    'event:EngineerCraft': IEngineerCraft,
    'event:EngineerProgress': IEngineerProgress,
    'event:EscapeInterdiction': IEscapeInterdiction,
    'event:FSDJump': IFSDJump,
    'event:FactionKillBond': IFactionKillBond,
    'event:FetchRemoteModule': IFetchRemoteModule,
    'event:Fileheader': IFileheader,
    'event:Friends': IFriends,
    'event:FuelScoop': IFuelScoop,
    'event:HeatDamage': IHeatDamage,
    'event:HeatWarning': IHeatWarning,
    'event:HullDamage': IHullDamage,
    'event:Interdicted': IInterdicted,
    'event:Interdiction': IInterdiction,
    'event:JetConeBoost': IJetConeBoost,
    'event:JetConeDamage': IJetConeDamage,
    'event:JoinACrew': IJoinACrew,
    'event:KickCrewMember': IKickCrewMember,
    'event:LaunchFighter': ILaunchFighter,
    'event:LaunchSRV': ILaunchSRV,
    'event:Liftoff': ILiftoff,
    'event:LoadGame': ILoadGame,
    'event:Loadout': ILoadout,
    'event:Location': ILocation,
    'event:MarketBuy': IMarketBuy,
    'event:MarketSell': IMarketSell,
    'event:MassModuleStore': IMassModuleStore,
    'event:MaterialCollected': IMaterialCollected,
    'event:MaterialDiscarded': IMaterialDiscarded,
    'event:MaterialDiscovered': IMaterialDiscovered,
    'event:Materials': IMaterials,
    'event:MiningRefined': IMiningRefined,
    'event:MissionAbandoned': IMissionAbandoned,
    'event:MissionAccepted': IMissionAccepted,
    'event:MissionCompleted': IMissionCompleted,
    'event:MissionFailed': IMissionFailed,
    'event:ModuleBuy': IModuleBuy,
    'event:ModuleRetrieve': IModuleRetrieve,
    'event:ModuleSell': IModuleSell,
    'event:ModuleSellRemote': IModuleSellRemote,
    'event:ModuleStore': IModuleStore,
    'event:ModuleSwap': IModuleSwap,
    'event:Music': IMusic,
    'event:NewCommander': INewCommander,
    'event:PVPKill': IPVPKill,
    'event:Passengers': IPassengers,
    'event:PayFines': IPayFines,
    'event:PayLegacyFines': IPayLegacyFines,
    'event:PowerplayJoin': IPowerplayJoin,
    'event:PowerplaySalary': IPowerplaySalary,
    'event:Progress': IProgress,
    'event:Promotion': IPromotion,
    'event:QuitACrew': IQuitACrew,
    'event:Rank': IRank,
    'event:RebootRepair': IRebootRepair,
    'event:ReceiveText': IReceiveText,
    'event:RedeemVoucher': IRedeemVoucher,
    'event:RefuelAll': IRefuelAll,
    'event:Repair': IRepair,
    'event:RepairAll': IRepairAll,
    'event:RestockVehicle': IRestockVehicle,
    'event:Resurrect': IResurrect,
    'event:Scan': IScan,
    'event:Scanned': IScanned,
    'event:Screenshot': IScreenshot,
    'event:SelfDestruct': ISelfDestruct,
    'event:SellDrones': ISellDrones,
    'event:SellExplorationData': ISellExplorationData,
    'event:SendText': ISendText,
    'event:SetUserShipName': ISetUserShipName,
    'event:ShieldState': IShieldState,
    'event:ShipyardBuy': IShipyardBuy,
    'event:ShipyardNew': IShipyardNew,
    'event:ShipyardSell': IShipyardSell,
    'event:ShipyardSwap': IShipyardSwap,
    'event:ShipyardTransfer': IShipyardTransfer,
    'event:StartJump': IStartJump,
    'event:SupercruiseEntry': ISupercruiseEntry,
    'event:SupercruiseExit': ISupercruiseExit,
    'event:Synthesis': ISynthesis,
    'event:Touchdown': ITouchdown,
    'event:USSDrop': IUSSDrop,
    'event:Undocked': IUndocked,
    'event:VehicleSwitch': IVehicleSwitch,
    'event:WingAdd': IWingAdd,
    'event:WingInvite': IWingInvite,
    'event:WingJoin': IWingJoin,
    'event:WingLeave': IWingLeave,
    'event:RefuelPartial': IRefuelPartial,
    'event:AfmuRepairs': IAfmuRepairs,
    'event:RepairDrone': IRepairDrone,
}

export type Events = {
    // Unscoped
    'event': EDEvent,
    'file': ILogFileSwap,
    'warn': Error,
    'error': Error,
} & GameEvents;

export class EDLog extends EventEmitter {
    private fileStream: ContinuesReadStream;
    private fileName: string;
    private lineStream: ReadLine;
    private backlog: EDEvent[];
    private logReader = new EDLogReader();

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
        delete this.fileName;;
        if (this.fileStream) {
            this.fileStream.close();
        }
        if (this.lineStream) {
            this.lineStream.close();
        }
    }

    private listenToFile (file: string, skip: boolean = false) {
        file = join(this.logReader.getDir(), file);
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
            const ev = new EDEvent(this.logReader.parseJSON(line));
            this.emit('event', ev);
            this.emit(<keyof Events>`event:${ev.event}`, ev);
        });
    }  
        
    /**
     * Launches the log reader.
     * 
     * @param {IBacklogOptions} [backlog={}] Optional configuration settings.
     * @returns {EDEvent[]} The processed backlog events.
     * @memberof EDLog 
     */
    public start(backlog: IBacklogOptions = {}): EDEvent[] {
        fs.watch(this.logReader.getDir(), (eventType: string, fileName: string) => {
            if (eventType === 'change') {
                return;
            }
            if (fileName === this.fileName) {
                return;
            }
            if (!fileName.match(EDLogReader.fileMatcher)) {
                return;
            }
            this.listenToFile(fileName);
        });

        const files = this.logReader.fetchFiles();

        let bl: EDEvent[] = [];
        if (backlog.process) {
            bl = this.logReader.read().map(raw => new EDEvent(raw));
        }

        this.listenToFile(files[files.length - 1], true);
        if (backlog.store) {
            this.backlog = bl;
        }
        return bl;
    }

    public getLastEvent<K extends keyof GameEvents>(event: K): GameEvents[K] | undefined {
        // TODO: This isn't great but works
        if (!this.backlog) {
            throw new Error('No backlog');
        }
        const realEvent = event.replace('event:', '');
        return findLast(this.backlog, ev => ev.event === realEvent);
    }

    public getAll<K extends keyof GameEvents>(event: K): GameEvents[K] {
        // TODO: This isn't great but works
        if (!this.backlog) {
            throw new Error('No backlog');
        }
        const realEvent = event.replace('event:', '');
        return <GameEvents[K]> this.backlog.filter(ev => ev.event === realEvent);
    }
}

export interface IBacklogOptions {
    /**
     * If true the method will return an array of event logs, otherwise empty.
     * 
     * @type {boolean}
     * @memberof IBacklogOptions
     */
    process?: boolean;

    /**
     * If true the method will keep the backlog loaded.
     * 
     * @type {boolean}
     * @memberof IBacklogOptions
     */
    store?: boolean;
}
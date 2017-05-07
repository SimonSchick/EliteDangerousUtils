import { ContinuesReadStream } from './ContinousReadStream';
import {
    IApproachSettlement,
    IBounty,
    IBuyAmmo,
    IBuyDrones,
    IBuyExplorationData,
    IClearSavedGame,
    ICockpitBreached,
    ICollectCargo,
    ICommitCrime,
    ICommunityGoalJoin,
    ICommunityGoalReward,
    ICrewAssign,
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
    IEngineerApply,
    IEngineerCraft,
    IEngineerProgress,
    IEscapeInterdiction,
    IFSDJump,
    IFactionKillBond,
    IFetchRemoteModule,
    IFileheader,
    IFuelScoop,
    IHeatWarning,
    IHullDamage,
    IInterdicted,
    IInterdiction,
    IJetConeBoost,
    ILaunchFighter,
    ILaunchSRV,
    ILiftoff,
    ILoadGame,
    ILocation,
    ILogFileSwap,
    IMarketBuy,
    IMarketSell,
    IMaterialCollected,
    IMaterialDiscarded,
    IMaterialDiscovered,
    IMissionAccepted,
    IMissionCompleted,
    IMissionFailed,
    IModuleBuy,
    IModuleRetrieve,
    IModuleSell,
    IModuleSellRemote,
    IModuleStore,
    IModuleSwap,
    INewCommander,
    IPVPKill,
    IPayFines,
    IPayLegacyFines,
    IPowerplayJoin,
    IPowerplaySalary,
    IPromotion,
    IRankProgress,
    IRebootRepair,
    IReceiveText,
    IRedeemVoucher,
    IRefuelAll,
    IRepair,
    IRepairAll,
    IRestockVehicle,
    IResurrect,
    IScreenshot,
    ISellDrones,
    ISellExplorationData,
    ISendText,
    ISelfDestruct,
    IShieldState,
    IShipyardBuy,
    IShipyardNew,
    IShipyardSell,
    IShipyardSwap,
    IShipyardTransfer,
    ISupercruiseEntry,
    ISupercruiseExit,
    ISynthesis,
    ITouchdown,
    IUSSDrop,
    IUndocked,
    IVehicleSwitch,
    IWingAdd,
    IWingJoin,
    IWingLeave,
    IBuyTradeData,
    ICapShipBond,
    IMiningRefined,
    IScan,
    IJetConeDamage,
    IHeatDamage,
    ICargo,
    ILoadout,
    IMaterials,
    ISetUserShipName,
    IStartJump,
    IScanned,
    ICrewMemberJoins,
    ICrewMemberRoleChange,
    ICrewMemberQuits,
    ICrewLaunchFighter,
    ICrewHire,
    IKickCrewMember,
    ICommunityGoalDiscard,
    IEndCrewSession,
    IJoinACrew,
    IChangeCrewRole,
    IQuitACrew,
} from './events';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { join } from 'path';
import { homedir } from 'os';
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
    'event:ClearSavedGame': IClearSavedGame,
    'event:CockpitBreached': ICockpitBreached,
    'event:CollectCargo': ICollectCargo,
    'event:CommitCrime': ICommitCrime,
    'event:CommunityGoalJoin': ICommunityGoalJoin,
    'event:CommunityGoalReward': ICommunityGoalReward,
    'event:CrewAssign': ICrewAssign,
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
    'event:EngineerApply': IEngineerApply,
    'event:EngineerCraft': IEngineerCraft,
    'event:EngineerProgress': IEngineerProgress,
    'event:EscapeInterdiction': IEscapeInterdiction,
    'event:FSDJump': IFSDJump,
    'event:FactionKillBond': IFactionKillBond,
    'event:FetchRemoteModule': IFetchRemoteModule,
    'event:Fileheader': IFileheader,
    'event:FuelScoop': IFuelScoop,
    'event:HeatWarning': IHeatWarning,
    'event:HeatDamage': IHeatDamage,
    'event:HullDamage': IHullDamage,
    'event:Interdicted': IInterdicted,
    'event:Interdiction': IInterdiction,
    'event:JetConeBoost': IJetConeBoost,
    'event:LaunchFighter': ILaunchFighter,
    'event:LaunchSRV': ILaunchSRV,
    'event:Liftoff': ILiftoff,
    'event:LoadGame': ILoadGame,
    'event:Location': ILocation,
    'event:MarketBuy': IMarketBuy,
    'event:MarketSell': IMarketSell,
    'event:MaterialCollected': IMaterialCollected,
    'event:MaterialDiscarded': IMaterialDiscarded,
    'event:MaterialDiscovered': IMaterialDiscovered,
    'event:MissionAccepted': IMissionAccepted,
    'event:MissionCompleted': IMissionCompleted,
    'event:MissionFailed': IMissionFailed,
    'event:ModuleBuy': IModuleBuy,
    'event:ModuleRetrieve': IModuleRetrieve,
    'event:ModuleSell': IModuleSell,
    'event:ModuleSellRemote': IModuleSellRemote,
    'event:ModuleStore': IModuleStore,
    'event:ModuleSwap': IModuleSwap,
    'event:NewCommander': INewCommander,
    'event:PVPKill': IPVPKill,
    'event:PayFines': IPayFines,
    'event:PayLegacyFines': IPayLegacyFines,
    'event:PowerplayJoin': IPowerplayJoin,
    'event:PowerplaySalary': IPowerplaySalary,
    'event:Progress': IRankProgress,
    'event:Promotion': IPromotion,
    'event:Rank': IRankProgress,
    'event:RebootRepair': IRebootRepair,
    'event:ReceiveText': IReceiveText,
    'event:RedeemVoucher': IRedeemVoucher,
    'event:RefuelAll': IRefuelAll,
    'event:Repair': IRepair,
    'event:RepairAll': IRepairAll,
    'event:RestockVehicle': IRestockVehicle,
    'event:Resurrect': IResurrect,
    'event:Screenshot': IScreenshot,
    'event:SellDrones': ISellDrones,
    'event:SellExplorationData': ISellExplorationData,
    'event:SendText': ISendText,
    'event:SelfDestruct': ISelfDestruct,
    'event:ShieldState': IShieldState,
    'event:ShipyardBuy': IShipyardBuy,
    'event:ShipyardNew': IShipyardNew,
    'event:ShipyardSell': IShipyardSell,
    'event:ShipyardSwap': IShipyardSwap,
    'event:ShipyardTransfer': IShipyardTransfer,
    'event:SupercruiseEntry': ISupercruiseEntry,
    'event:SupercruiseExit': ISupercruiseExit,
    'event:Synthesis': ISynthesis,
    'event:Touchdown': ITouchdown,
    'event:USSDrop': IUSSDrop,
    'event:Undocked': IUndocked,
    'event:VehicleSwitch': IVehicleSwitch,
    'event:WingAdd': IWingAdd,
    'event:WingJoin': IWingJoin,
    'event:WingLeave': IWingLeave,
    'event:BuyTradeData': IBuyTradeData,
    'event:CapShipBond': ICapShipBond,
    'event:MiningRefined': IMiningRefined,
    'event:Scan': IScan,
    'event:JetConeDamage': IJetConeDamage,
    'event:Cargo': ICargo,
    'event:Loadout': ILoadout,
    'event:Materials': IMaterials,
    'event:Scanned': IScanned,
    'event:SetUserShipName': ISetUserShipName,
    'event:StartJump': IStartJump,
    'event:CrewMemberJoins': ICrewMemberJoins,
    'event:CrewMemberRoleChange': ICrewMemberRoleChange,
    'event:CrewMemberQuits': ICrewMemberQuits,
    'event:CrewLaunchFighter': ICrewLaunchFighter,
    'event:CrewHire': ICrewHire,
    'event:KickCrewMember': IKickCrewMember,
    'event:CommunityGoalDiscard': ICommunityGoalDiscard,
    'event:EndCrewSession': IEndCrewSession,
    'event:JoinACrew': IJoinACrew,
    'event:ChangeCrewRole': IChangeCrewRole,
    'event:QuitACrew': IQuitACrew,
}

export type Events = {
    // Unscoped
    'event': EDEvent,
    'file': ILogFileSwap,
    'warn': Error,
    'error': Error,
} & GameEvents;

export class EDLog extends EventEmitter {
    private directory = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous'); // TODO: OSX Support
    private fileStream: ContinuesReadStream;
    private fileName: string;
    private lineStream: ReadLine;
    private backlog: EDEvent[];

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
    public start (backlog: { process: boolean; store: boolean; }): EDEvent[] {
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
        if (backlog.process) {
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
        if (backlog.store) {
            this.backlog = bl;
        }
        return bl;
    }

    public getLastEvent<K extends keyof GameEvents>(event: K): GameEvents[K] {
        // TODO: This isn't great but works
        if (!this.backlog) {
            throw new Error('No backlog');
        }
        const realEvent = event.replace('event:', '');
        return findLast(this.backlog, ev => ev.event === realEvent);
    }
}

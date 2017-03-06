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
    public on(event: 'event:DockingCancelled', cb: (event: IDockingCancelled) => void): this;
    public on(event: 'event:DockingDenied', cb: (event: IDockingDenied) => void): this;
    public on(event: 'event:DockingTimeout', cb: (event: IDockingTimeout) => void): this;
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
    public on(event: 'event:EscapeInterdiction', cb: (event: IEscapeInterdiction) => void): this;
    public on(event: 'event:LaunchFighter', cb: (event: ILaunchFighter) => void): this;
    public on(event: 'event:RepairAll', cb: (event: IRepairAll) => void): this;
    public on(event: 'event:Location', cb: (event: ILocation) => void): this;
    public on(event: 'event:Fileheader', cb: (event: IFileheader) => void): this;
    public on(event: 'event:ShipyardSell', cb: (event: IShipyardSell) => void): this;
    public on(event: 'event:ShipyardSwap', cb: (event: IShipyardSwap) => void): this;
    public on(event: 'event:ShipyardTransfer', cb: (event: IShipyardTransfer) => void): this;
    public on(event: 'event:EjectCargo', cb: (event: IEjectCargo) => void): this;
    public on(event: 'event:HeatWarning', cb: (event: IHeatWarning) => void): this;
    public on(event: 'event:Screenshot', cb: (event: IScreenshot) => void): this;
    public on(event: 'event:RedeemVoucher', cb: (event: IRedeemVoucher) => void): this;
    public on(event: 'event:PayLegacyFines', cb: (event: IPayLegacyFines) => void): this;
    public on(event: 'event:RebootRepair', cb: (event: IRebootRepair) => void): this;
    public on(event: 'event:MaterialDiscovered', cb: (event: IMaterialDiscovered) => void): this;
    public on(event: 'event:NewCommander', cb: (event: INewCommander) => void): this;
    public on(event: 'event:ClearSavedGame', cb: (event: IClearSavedGame) => void): this;
    public on(event: 'event:Synthesis', cb: (event: ISynthesis) => void): this;
    public on(event: 'event:DockSRV', cb: (event: IDockSRV) => void): this;
    public on(event: 'event:Died', cb: (event: IDied) => void): this;
    public on(event: 'event:Resurrect', cb: (event: IResurrect) => void): this;
    public on(event: 'event:DatalinkScan', cb: (event: IDatalinkScan) => void): this;
    public on(event: 'event:DatalinkVoucher', cb: (event: IDatalinkVoucher) => void): this;
    public on(event: 'event:ModuleSell', cb: (event: IModuleSell) => void): this;
    public on(event: 'event:WingAdd', cb: (event: IWingAdd) => void): this;
    public on(event: 'event:WingJoin', cb: (event: IWingJoin) => void): this;
    public on(event: 'event:WingLeave', cb: (event: IWingLeave) => void): this;
    public on(event: 'event:CrewAssign', cb: (event: ICrewAssign) => void): this;
    public on(event: 'event:ModuleSellRemote', cb: (event: IModuleSellRemote) => void): this;
    public on(event: 'event:DockFighter', cb: (event: IDockFighter) => void): this;
    public on(event: 'event:VehicleSwitch', cb: (event: IVehicleSwitch) => void): this;
    public on(event: 'event:RestockVehicle', cb: (event: IRestockVehicle) => void): this;
    public on(event: 'event:FetchRemoteModule', cb: (event: IFetchRemoteModule) => void): this;
    public on(event: 'event:PowerplayJoin', cb: (event: IPowerplayJoin) => void): this;
    public on(event: 'event:PowerplaySalary', cb: (event: IPowerplaySalary) => void): this;
    public on(event: 'event:FactionKillBond', cb: (event: IFactionKillBond) => void): this;
    public on(event: 'event:Interdiction', cb: (event: IInterdiction) => void): this;
    public on(event: 'event:ApproachSettlement', cb: (event: IApproachSettlement) => void): this;
    public on(event: 'event:DataScanned', cb: (event: IDataScanned) => void): this;
    public on(event: 'event:Promotion', cb: (event: IPromotion) => void): this;
    public on(event: 'event:CollectCargo', cb: (event: ICollectCargo) => void): this;
    public on(event: 'event:ModuleRetrieve', cb: (event: IModuleRetrieve) => void): this;
    public on(event: 'event:ModuleStore', cb: (event: IModuleStore) => void): this;
    public on(event: 'event:MissionFailed', cb: (event: IMissionFailed) => void): this;
    public on(event: 'event:Repair', cb: (event: IRepair) => void): this;
    public on(event: 'event:PVPKill', cb: (event: IPVPKill) => void): this;
    public on(event: 'event:CommunityGoalJoin', cb: (event: ICommunityGoalJoin) => void): this;
    public on(event: 'event:CommunityGoalReward', cb: (event: ICommunityGoalReward) => void): this;
    public on(event: 'event:PayFines', cb: (event: IPayFines) => void): this;
    public on(event: 'event:JetConeBoost', cb: (event: IJetConeBoost) => void): this;
    public on(event: 'event:ShipyardBuy', cb: (event: IShipyardBuy) => void): this;
    public on(event: 'event:ShipyardNew', cb: (event: IShipyardNew) => void): this;
    public on(event: 'event:BuyExplorationData', cb: (event: IBuyExplorationData) => void): this;
    public on(event: 'event:CockpitBreached', cb: (event: ICockpitBreached) => void): this;

    // Future
    public on(event: 'event:Cargo', cb: (event: ICargo) => void): this;
    public on(event: 'event:Loudout', cb: (event: ILoadout) => void): this;
    public on(event: 'event:Materials', cb: (event: IMaterials) => void): this;
    public on(event: 'event:SetUserShipName', cb: (event: ISetUserShipName) => void): this;
    public on(event: 'event:StartJump', cb: (event: IStartJump) => void): this;
    public on(event: 'event:Scanned', cb: (event: IScanned) => void): this;
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
    public once(event: 'event:DockingCancelled', cb: (event: IDockingCancelled) => void): this;
    public once(event: 'event:DockingDenied', cb: (event: IDockingDenied) => void): this;
    public once(event: 'event:DockingTimeout', cb: (event: IDockingTimeout) => void): this;
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
    public once(event: 'event:EscapeInterdiction', cb: (event: IEscapeInterdiction) => void): this;
    public once(event: 'event:LaunchFighter', cb: (event: ILaunchFighter) => void): this;
    public once(event: 'event:RepairAll', cb: (event: IRepairAll) => void): this;
    public once(event: 'event:Location', cb: (event: ILocation) => void): this;
    public once(event: 'event:Fileheader', cb: (event: IFileheader) => void): this;
    public once(event: 'event:ShipyardSell', cb: (event: IShipyardSell) => void): this;
    public once(event: 'event:ShipyardSwap', cb: (event: IShipyardSwap) => void): this;
    public once(event: 'event:ShipyardTransfer', cb: (event: IShipyardTransfer) => void): this;
    public once(event: 'event:EjectCargo', cb: (event: IEjectCargo) => void): this;
    public once(event: 'event:HeatWarning', cb: (event: IHeatWarning) => void): this;
    public once(event: 'event:Screenshot', cb: (event: IScreenshot) => void): this;
    public once(event: 'event:RedeemVoucher', cb: (event: IRedeemVoucher) => void): this;
    public once(event: 'event:PayLegacyFines', cb: (event: IPayLegacyFines) => void): this;
    public once(event: 'event:RebootRepair', cb: (event: IRebootRepair) => void): this;
    public once(event: 'event:MaterialDiscovered', cb: (event: IMaterialDiscovered) => void): this;
    public once(event: 'event:NewCommander', cb: (event: INewCommander) => void): this;
    public once(event: 'event:ClearSavedGame', cb: (event: IClearSavedGame) => void): this;
    public once(event: 'event:Synthesis', cb: (event: ISynthesis) => void): this;
    public once(event: 'event:DockSRV', cb: (event: IDockSRV) => void): this;
    public once(event: 'event:Died', cb: (event: IDied) => void): this;
    public once(event: 'event:Resurrect', cb: (event: IResurrect) => void): this;
    public once(event: 'event:DatalinkScan', cb: (event: IDatalinkScan) => void): this;
    public once(event: 'event:DatalinkVoucher', cb: (event: IDatalinkVoucher) => void): this;
    public once(event: 'event:ModuleSell', cb: (event: IModuleSell) => void): this;
    public once(event: 'event:WingAdd', cb: (event: IWingAdd) => void): this;
    public once(event: 'event:WingJoin', cb: (event: IWingJoin) => void): this;
    public once(event: 'event:WingLeave', cb: (event: IWingLeave) => void): this;
    public once(event: 'event:CrewAssign', cb: (event: ICrewAssign) => void): this;
    public once(event: 'event:ModuleSellRemote', cb: (event: IModuleSellRemote) => void): this;
    public once(event: 'event:DockFighter', cb: (event: IDockFighter) => void): this;
    public once(event: 'event:VehicleSwitch', cb: (event: IVehicleSwitch) => void): this;
    public once(event: 'event:RestockVehicle', cb: (event: IRestockVehicle) => void): this;
    public once(event: 'event:FetchRemoteModule', cb: (event: IFetchRemoteModule) => void): this;
    public once(event: 'event:PowerplayJoin', cb: (event: IPowerplayJoin) => void): this;
    public once(event: 'event:PowerplaySalary', cb: (event: IPowerplaySalary) => void): this;
    public once(event: 'event:FactionKillBond', cb: (event: IFactionKillBond) => void): this;
    public once(event: 'event:Interdiction', cb: (event: IInterdiction) => void): this;
    public once(event: 'event:ApproachSettlement', cb: (event: IApproachSettlement) => void): this;
    public once(event: 'event:DataScanned', cb: (event: IDataScanned) => void): this;
    public once(event: 'event:Promotion', cb: (event: IPromotion) => void): this;
    public once(event: 'event:CollectCargo', cb: (event: ICollectCargo) => void): this;
    public once(event: 'event:ModuleRetrieve', cb: (event: IModuleRetrieve) => void): this;
    public once(event: 'event:ModuleStore', cb: (event: IModuleStore) => void): this;
    public once(event: 'event:MissionFailed', cb: (event: IMissionFailed) => void): this;
    public once(event: 'event:Repair', cb: (event: IRepair) => void): this;
    public once(event: 'event:PVPKill', cb: (event: IPVPKill) => void): this;
    public once(event: 'event:CommunityGoalJoin', cb: (event: ICommunityGoalJoin) => void): this;
    public once(event: 'event:CommunityGoalReward', cb: (event: ICommunityGoalReward) => void): this;
    public once(event: 'event:PayFines', cb: (event: IPayFines) => void): this;
    public once(event: 'event:JetConeBoost', cb: (event: IJetConeBoost) => void): this;
    public once(event: 'event:ShipyardBuy', cb: (event: IShipyardBuy) => void): this;
    public once(event: 'event:ShipyardNew', cb: (event: IShipyardNew) => void): this;
    public once(event: 'event:BuyExplorationData', cb: (event: IBuyExplorationData) => void): this;
    public once(event: 'event:CockpitBreached', cb: (event: ICockpitBreached) => void): this;
     // Future
    public once(event: 'event:Cargo', cb: (event: ICargo) => void): this;
    public once(event: 'event:Loadout', cb: (event: ILoadout) => void): this;
    public once(event: 'event:Materials', cb: (event: IMaterials) => void): this;
    public once(event: 'event:SetUserShipName', cb: (event: ISetUserShipName) => void): this;
    public once(event: 'event:StartJump', cb: (event: IStartJump) => void): this;
    public once(event: 'event:Scanned', cb: (event: IScanned) => void): this;

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

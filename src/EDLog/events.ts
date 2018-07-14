import { EDPosition } from './locations';
import { AllSlots } from '../common';

export interface IEventBase {
    timestamp: Date;
    readonly event: string;
}

export type StationType = 'Orbis' | 'Coriolis' | 'Bernal' | 'Outpost' | 'SurfaceStation' | 'AsteroidBase';
export type Faction = 'Empire' | 'Alliance' | 'Federation' | 'PilotsFederation' | 'Guardian';
export type Allegiance = 'None' | 'Independent' | Faction;
export type FactionState = 'None' | 'Retreat' | 'Lockdown' | 'CivilUnrest' | 'CivilWar' | 'Boom' | 'Expansion' | 'Bust' | 'Famine' | 'Election' | 'Investment' | 'Outbreak'| 'War';
export type Economy = '$economy_None;' | '$economy_Colony;' | '$economy_Agri;' | '$economy_HighTech;' | '$economy_Extraction;' | '$economy_Industrial;' | '$economy_Military;' | '$economy_Refinery;' |'$economy_Terraforming;' | '$economy_Service;' | '$economy_Repair;';
export type Security = '$SYSTEM_SECURITY_low;' | '$SYSTEM_SECURITY_medium;' | '$SYSTEM_SECURITY_high;';
export type BodyType = 'Star' | 'Planet' | 'Station' | 'PlanetaryRing' | 'StellarRing' | 'Null' | 'AsteroidCluster';
export type MaterialType = 'Encoded' | 'Manufactured' | 'Raw';
export type Power = 'Li Yong-Rui' | 'Felicia Winters' | 'Edmund Mahon' | 'Denton Patreus' | 'Zachary Hudson' | 'Zermina Torval' | 'Archon Delaine' | 'Aisling Duval' | 'A. Lavigny-Duval' | 'Pranav Antal' | 'Yuri Grom';
export type FighterLoadout = 'zero' | 'two';

export interface IVeryBaseLocation {
    SystemAddress?: number;
    StarSystem: string;
}

export interface IBaseLocation extends IEventBase, IVeryBaseLocation {
    SystemAllegiance?: Allegiance | '';
    SystemEconomy: Economy;
    SystemSecondEconomy?: Economy;
    SystemFaction?: string;
    FactionState?: FactionState;
    StarPos: EDPosition;
    Population?: number;

    SystemSecurity: string;
    SystemGovernment: string;

    SystemEconomy_Localised?: string;
    SystemSecondEconomy_Localised?: string;
    SystemGovernment_Localised: string;
    SystemSecurity_Localised: string;

    Powers?: Power[];
    PowerplayState?: 'Exploited' | 'Controlled' | 'InPrepareRadius' | 'Prepared' | 'Contested' | 'Turmoil' | 'HomeSystem';
}

export interface IFSDJump extends IBaseLocation {
    Factions?: IFactionInfo[];
    JumpDist: number;
    FuelUsed: number;
    FuelLevel: number;
}

export interface IFactionInfo {
    Name: string;
    PendingStates?: {
        State: FactionState;
        Trend: number;
    }[];
    RecoveringStates?: {
        State: FactionState;
        Trend: number;
    }[];
    FactionState: FactionState;
    Government: string;
    Influence: number;
    Allegiance: Allegiance;
}

export interface ILocation extends IBaseLocation {
    Latitude?: number;
    Longitude?: number;
    StationName?: string;
    StationType?: StationType;
    Docked: boolean;
    Body?: string;
    BodyType?: BodyType;
    FactionState?: FactionState;
    Factions?: IFactionInfo[];
    MarketID?: number;
    BodyID?: number;
}

export interface IReceiveText extends IEventBase {
    Channel: 'local' | 'npc' | 'direct' | 'player' | 'wing' | 'voicechat';
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
    To: 'local' | 'wing' | string;
    To_Localised?: string;
}

export interface IBounty extends IEventBase {
    Target: string;
    VictimFaction: string;
    VictimFaction_Localised?: string;
    Reward?: number;
    TotalReward?: number;
    SharedWithOthers?: number;
    Rewards?: {
        Faction: string;
        Reward: number;
    }[];
}

export interface IFuelScoop extends IEventBase {
    Scooped: number;
    Total: number;
}

export interface ILaunchSRV extends IEventBase {
    Loadout: 'starter';
    PlayerControlled: boolean;
}

export interface ILoadGame extends IEventBase {
    Commander: string;
    Ship: string;
    Ship_Localised?: string;
    ShipID: number;
    ShipIdent: string;
    ShipName: string;
    StartLanded?: true;
    StartDead?: true;
    FuelCapacity: number;
    FuelLevel: number;
    GameMode: 'Solo' | 'Group' | 'Open';
    Credits: number;
    Loan: number;
    Horizons?: boolean;
}

/**
 * Used once as a rank index progression and once as Rank progress update.
 */
export interface IRank extends IEventBase {
    Combat: number;
    Trade: number;
    Explore: number;
    Empire: number;
    Federation: number;
    CQC: number;
}

export interface IProgress extends IRank {}

export interface ISupercruiseExit extends IEventBase, IVeryBaseLocation {
    Body: string;
    BodyID?: number;
    BodyType: BodyType;
}

export interface ISupercruiseEntry extends IEventBase, IVeryBaseLocation {
}

export interface ICommitCrime extends IEventBase {
    CrimeType:
        'assault' |
        'collidedAtSpeedInNoFireZone' |
        'collidedAtSpeedInNoFireZoneHullDamage' |
        'disobeyPolice' |
        'dockingMajorBlockingAirlock' |
        'dockingMajorBlockingLandingPad' |
        'dockingMajorTresspass' |
        'dockingMinorBlockingAirlock' |
        'dockingMinorBlockingLandingPad' |
        'dockingMinorTresspass' |
        'dumpingDangerous' |
        'dumpingNearStation' |
        'fireInNoFireZone' |
        'fireInStation' |
        'illegalCargo' |
        'interdiction'|
        'murder' |
        'piracy';
    // deprecated
    Victim_Localised?: string;
    Faction: string;
    Victim?: string;
    Bounty?: number;
    Fine?: number;
}

export interface IMaterialEvent extends IEventBase {
    Category: MaterialType;
    Name: string;
    Name_Localised?: string;
    Count: number;
}

export interface IMaterialCollected extends IMaterialEvent {}

export interface IMaterialDiscarded extends IMaterialEvent {}

export interface IMission extends IEventBase {
    Faction: string;
    Name: string;
    DestinationSystem?: string;
    DestinationStation?: string;
    Expiry?: string; // TODO autoconvert to date?
    MissionID: number;
    Count?: number;

    Commodity?: string,
    Commodity_Localised?: string,
    Reward?: number;
}

export interface IMissionAccepted extends IMission {
    Influence: string;
    TargetType?: string;
    TargetFaction?: string;
    KillCount?: number;
    TargetType_Localised?: string;
    LocalisedName: string;
    PassengerCount?: number,
    PassengerVIPs?: boolean,
    PassengerWanted?: boolean,
    PassengerType?: 'Terrorist' | 'Tourist' | 'AidWorker',
    Reputation: string;
}

export interface IMissionCompleted extends IMission {
    Donation?: number;
}

export interface IModuleEvent extends IEventBase {
    MarketID: number;
    Slot?: AllSlots;
    Ship: string;
    ShipID: number;
}

export interface IModuleStoreEvent extends IModuleEvent {
    EngineerModifications?: string;
    Quality?: number;
    Level: number;
    Hot: boolean;
}

export interface IModuleRetrieve extends IModuleStoreEvent {
    RetrievedItem: string;
    RetrievedItem_Localised: string;
    SwapOutItem?: string;
    SwapOutItem_Localised?: string;
    Cost?: number;
}

export interface IModuleStoreBase {
    StoredItem: string;
    StoredItem_Localised: string;
}

export interface IModuleStore extends IModuleStoreEvent, IModuleStoreBase {
}

export interface IMassModuleStore extends IModuleEvent {
    Items: {
        Slot: string;
        Name: string;
        Name_Localised: string;
        EngineerModifications?: string;
        Quality: number;
        Level: number;
        Hot: boolean;
    }[];
}

export interface IBaseBaseSell {
    SellItem: string;
    SellItem_Localised: string;
    SellPrice: number;
}

export interface IModuleBuy extends IModuleEvent, Partial<IBaseBaseSell>, Partial<IModuleStoreBase> {
    BuyItem: string;
    BuyItem_Localised: string;
    BuyPrice: number;
}

export interface IModuleSell extends IModuleEvent, IBaseBaseSell {

}

export interface IModuleSwap extends IEventBase {
    FromSlot: AllSlots;
    ToSlot: AllSlots;
    FromItem: string;
    FromItem_Localised: string;
    ToItem: string | 'Null';
    ToItem_Localised?: string;
    Ship: string;
    ShipID: number;

}

export interface IShieldState extends IEventBase {
    ShieldsUp: boolean;
}

export interface IRefuelBase extends IEventBase {
    Cost: number;
}

export interface IRefuelAll extends IRefuelBase {
    Amount: number;
}

export interface IRefuelPartial extends IRefuelBase {
    Amount: number;
}

export interface IBuyAmmo extends IRefuelBase {}

export interface ISellExplorationData extends IEventBase {
    Systems: string[];
    Discovered: string[];
    BaseValue: number;
    Bonus: number;
    TotalEarnings: number;
}

export interface IDockingEvent extends IEventBase {
    StationName: string;
    StationType?: StationType;
    MarketID?: number;
}

export interface IDockingGranted extends IDockingEvent {
    LandingPad: number;
}

export interface IDockingRequested extends IDockingEvent {}

export interface IDockingCancelled extends IDockingEvent {}

export interface IDockingTimeout extends IDockingEvent {}

export interface IDockingDenied extends IDockingEvent {
    Reason: 'NoSpace' | 'TooLarge' | 'Hostile' |  'Offences' | 'Distance' | 'ActiveFighter' | 'NoReason';
}

export interface IMarketEvent extends IEventBase {
    Type: string;
    Type_Localised: string;
    Count: number;
    MarketID: number;
}

export interface IMarketBuy extends IMarketEvent {
    BuyPrice: number;
    TotalCost: number;
}

export interface IMarketSell extends IMarketEvent {
    SellPrice: number;
    TotalSale: number;
    /**
     * Per unit.
     */
    AvgPricePaid: number;

    IllegalGoods?: true;
    StolenGoods?: true;
    BlackMarket?: true;
}

export interface IDockBase extends IEventBase {
    StationName: string;
    StationType: StationType;
    StationState?: 'UnderRepairs';
    MarketID?: number;
}

export interface IMissionAbandoned extends IEventBase {
    Name: string;
    MissionID: number;
}

export interface IDocked extends IDockBase, IVeryBaseLocation {
    FactionState?: FactionState;
    StationServices?: string[];
    StationFaction: string;
    FactionStation?: FactionState;
    StationGovernment: string; // TODO: type
    StationGovernment_Localised: string;
    StationAllegiance?: Allegiance;
    StationEconomy: Economy;
    StationEconomy_Localised: string;
    CockpitBreach?: true;
    DistFromStarLS: number;
    StationEconomies?: {
        Name: string;
        Name_Localised: string;
        Proportion: number;
    }[];
}

export interface IUndocked extends IDockBase {}

export interface IUSSDrop extends IEventBase {
    USSType:
        '$USS_Type_Aftermath;' |
        '$USS_Type_VeryValuableSalvage;' |
        '$USS_Type_Salvage;' |
        '$USS_Type_WeaponsFire;' |
        '$USS_Type_Convoy;' |
        '$USS_Type_DistressSignal;' |
        '$USS_Type_MissionTarget;' |
        '$USS_Type_ValuableSalvage;' |
        '$USS_Type_Ceremonial;' |
        '$USS_Type_NonHuman;';
    USSType_Localised: string;
    USSThreat: number;
}

export interface IGeoEvent extends IEventBase {
    Latitude: number;
    Longitude: number;
}

export interface IPlayerController {
    PlayerControlled: boolean;
}

export interface ITouchdown extends Partial<IGeoEvent>, IPlayerController {}
export interface ILiftoff extends Partial<IGeoEvent>, IPlayerController {}

export interface IEngineerEvent extends IEventBase {
    EngineerID: number;
    BlueprintID: number;
    Engineer: string;
    BlueprintName: string;
    Level: number;
}

export interface IEngineerCraft extends IEngineerEvent {
    Ingredients: {
        Name: string;
        Name_Localised?: string;
        Count: number;
    }[];
    Modifiers: {
        Label: string;
        Value: number;
        OriginalValue: number;
        LessIsGood: number;
    }[];
    Quality: number;
    Module: string;
    Slot: string;
    ApplyExperimentalEffect?: string;
    ExperimentalEffect?: string;
    ExperimentalEffect_Localised?: string;
}

export interface IEngineerApply extends IEngineerEvent {
    Override?: string;
}

export interface IEngineerProgress extends IEventBase {
    Engineer: string;
    Rank: number;
}

export interface IHullDamage extends IEventBase {
    Health: number;
    PlayerPilot: boolean;
    Fighter?: boolean;
}

export interface IInterdictionBase extends IEventBase {
    Interdictor: string;
    IsPlayer: boolean;
}

export interface IInterdicted extends IInterdictionBase {
    Submitted: boolean;
    Faction: string;
    Power?: Power;
}

export interface IEscapeInterdiction extends IInterdictionBase {
    Interdictor: string;
    IsPlayer: boolean;
}

export interface ILaunchFighter extends IEventBase {
    Loadout: FighterLoadout;
    PlayerControlled: boolean;
}

export interface ILogFileSwap {
    file: string;
}

export interface IFileheader extends IEventBase {
    part: number;
    language: string;
    gameversion: string;
    build: string;
}

export interface IRepairAll extends IEventBase {
    Cost: number;
}

export interface IShipyardSell extends IEventBase {
    ShipType: string;
    SellShipID: number;
    ShipPrice: number;
    System?: string;
}


export interface IShipyardSwap extends IEventBase {
    MarketID: number;
    ShipType: string;
    ShipType_Localised?: string;
    ShipID: number;
    ShipPrice?: number;
    StoreOldShip?: string,
    StoreShipID?: number;
    SellOldShip?: string;
    SellShipID?: number;
}

export interface IShipyardTransfer extends IEventBase {
    ShipType: string;
    ShipID: number;
    System: string;
    Distance: number;
    TransferPrice: number;
    TransferTime: number;
}

export interface IEjectCargo extends IEventBase {
    Type: string;
    Type_Localised?: string;
    Count: number;
    Abandoned: boolean;
    PowerplayOrigin?: string;
}

export interface IHeatWarning extends IEventBase {}

export interface IHeatDamage extends IEventBase {}

export interface IScreenshot extends IEventBase {
    Filename: string;
    Width: number;
    Height: number;
    System: string;
    Body: string;
    Latitude?: number;
    Longitude?: number;
    Altitude?: number;
    Heading?: number;
}

export interface IRedeemVoucher extends IEventBase {
    Type: 'bounty' | 'settlement' | 'scannable' | 'CombatBond' | 'trade';
    Amount: number;
    Faction?: string;
    Factions?: { Faction: string, Amount: number }[];
    BrokerPercentage?: number;
}

export interface IPayLegacyFines extends IEventBase {
    Amount: number;
    BrokerPercentage?: number;
}

export interface IRebootRepair extends IEventBase {
    Modules: AllSlots[];
}

export interface IMaterialDiscovered extends IEventBase {
    Category: MaterialType;
    Name: string;
    Name_Localised?: string;
    DiscoveryNumber: number;
}

export interface IClearSavedGame extends IEventBase {
    Name: string;
}

export interface INewCommander extends IEventBase {
    Name: string;
    Package: string;
}

export interface ISynthesis extends IEventBase {
    Name: string;
    Materials: {
        Name: string;
        Count: number;
    }[];
}

export interface IDockSRV extends IEventBase {}

export type CombatRank = 'Harmless' | 'Mostly Harmless' | 'Novice' | 'Competent' | 'Expert' | 'Dangerous' | 'Master' | 'Deadly' | 'Elite'

export interface ISuicide extends IEventBase  {
}

export interface ISingleDeath extends IEventBase  {
    KillerName: string;
    KillerShip: string;
    KillerRank: CombatRank;
}

export interface IWingDeath extends IEventBase  {
    Killers: {
        Name: string;
        Ship: string;
        Rank: CombatRank;
    }[];
}

export type IDied = ISingleDeath | IWingDeath | ISuicide;

export interface IResurrect extends IEventBase {
    Option: 'rebuy';
    Cost: number;
    Bankrupt: boolean;
}

export interface IPowerplayJoin extends IEventBase {
    Power: Power;
}

export interface IDatalinkScan extends IEventBase {
    Message: string;
    Message_Localised: string;
}

export interface IDatalinkVoucher extends IEventBase {
    Reward: number;
    VictimFaction: Faction;
    PayeeFaction: Faction;
}

export interface IWingJoin extends IEventBase {
    Others: string[];
}

export interface IWingAdd extends IEventBase {
    Name: string;
}

export interface IWingLeave extends IEventBase {
    Name?: string;
}

export interface IWingInvite extends IEventBase {
    Name: string;
}

export interface IPowerplaySalary extends IEventBase {
    Power: Power;
    Amount: number;
}

export interface ICrewAssign extends IEventBase {
    CrewID?: number;
    Name: string;
    Role: 'Active'; // TODO: More
}

export interface IModuleSellRemote extends IModuleEvent, IBaseBaseSell {
    StorageSlot: number;
    ServerId: number;
}

export interface IDockFighter extends IEventBase {}

export interface IVehicleSwitch extends IEventBase {
    // Apparently nothing when it's the SRV
    To?: 'Mothership' | 'Fighter';
}

export interface IRestockVehicle extends IEventBase {
    Type: 'independent_fighter' | 'federation_fighter' | 'imperial_fighter';
    Loadout: FighterLoadout;
    Cost: number;
    Count: number;
}

export interface IFetchRemoteModule extends IEventBase {
    StorageSlot: number;
    StorageItem?: string;
    StorageItem_Localised?: string;
    StoredItem?: string;
    StoredItem_Localised?: string;
    ServerId: number;
    TransferCost: number
    Ship: string;
    ShipID: number;
    TransferTime: number;
}

export interface IFactionKillBond extends IEventBase {
    Reward: number;
    AwardingFaction: string;
    AwardingFaction_Localised?: string;
    VictimFaction: string;
}

export interface IInterdiction extends IEventBase {
    Success: boolean;
    IsPlayer: boolean;
    Faction?: string;
    CombatRank?: CombatRank;
    Power?: Power;
}

export interface IApproachSettlement extends IEventBase {
    MarketID?: number;
    Name_Localised?: string;
    Name: string;
}

export interface IDataScanned extends IEventBase {
    Type: 'DataPoint' | 'DataLink' | 'ListenigPost' | 'AdandonedDataLog' | 'WreckedShip' | 'Unknown_Uplink' | 'ShipUplink' | 'ListeningPost' | 'ANCIENTCODEX';
}

export type IPromotion = Partial<IRank>;

export interface ICollectCargo extends IEventBase {
    Type: string;
    Type_Localised?: string;
    Stolen: boolean;
}

export interface IMissionFailed extends IEventBase {
    Name: string;
    MissionID: number;
}

export interface IRepair extends IEventBase {
    Item: string;
    Cost: number;
}

export interface IPVPKill extends IEventBase {
    Victim: string;
    CombatRank: number;
}

export interface ICommunityEventbase extends IEventBase {
    Name: string;
    System: string;
}

export interface ICommunityGoalJoin extends ICommunityEventbase {}

export interface ICommunityGoalReward extends ICommunityEventbase {
    Reward: number;
}

export interface IPayFines extends IEventBase {
    AllFines?: true;
    ShipID: number;
    Amount: number;
}

export interface IJetConeBoost extends IEventBase {
    BoostValue: number;
}

export interface IJetConeDamage extends IEventBase {
    Module: string;
}

export interface IShipyardBuy extends IEventBase {
    MarketID: number;
    ShipType: string;
    ShipType_Localised: string;
    ShipPrice: number;
    StoreOldShip: string;
    StoreShipID: number;
}

export interface IShipyardNew extends IEventBase {
    ShipType: string;
    ShipType_Localised: string;
    NewShipID: number;
}

export interface ICapShipBond extends IFactionKillBond {}

export interface IRing {
    Name: string;
    RingClass: string;
    MassMT: number;
    InnerRad: number;
    OuterRad: number;
}

export interface IScanBase extends IEventBase {
    BodyName: string;
    DistanceFromArrivalLS: number;
    SurfaceTemperature: number;
    RotationPeriod: number;
    Rings?: IRing[];
}

export interface IStar extends IScanBase {
    StarType: string;
    StellarMass: number;
    Radius: number;
    AbsoluteMagnitude: number;
    Age_MY: number;
}

export interface IBody extends IScanBase {
    AxialTilt: number;
    TidalLock?: boolean;
    TerraformState: 'Terraformable' | 'Terraforming' | '' | null;
    PlanetClass: string;
    Atmosphere: string;
    AtmosphereType: string;
    AtmosphereComposition?: { Name: string; Percent: number }[];
    Volcanism: string;
    MassEM: number;
    SurfaceGravity: number;
    SurfacePressure: number;
    Landable?: true;
    Materials: {
        Name: string;
        Percentage: number;
    }
}

export interface INonCentralBody extends IScanBase {
    SemiMajorAxis: number;
    Eccentricity: number;
    OrbitalInclination: number;
    Periapsis: number;
    OrbitalPeriod: number;
}

export type IScan = (IStar | IBody) & Partial<INonCentralBody>;

export interface IBuyExplorationData extends IEventBase {
    System: string;
    Cost: number;
}

export interface IBuyTradeData extends IEventBase {
    System: string;
    Cost: number;
}

export interface IMiningRefined extends IEventBase {
    Type: string;
}

export interface ICockpitBreached extends IEventBase {}

export interface IDronesEvent extends IEventBase {
    Type: 'Drones';
    Count: number;
}

export interface IBuyDrones extends IDronesEvent {
    BuyPrice: number;
    TotalCost: number;
}

export interface ISellDrones extends IDronesEvent {
    SellPrice: number;
    TotalSale: number;
}

export interface ISelfDestruct extends IEventBase {}

export interface ICargo extends IEventBase {
    Inventory: {
        Name: string;
        Name_Localised?: string;
        Count: number;
        Stolen: number;
    }[];
}

export interface IBaseModule {
    Slot: AllSlots;
    Item: string;
    On: boolean;
    Priority: number;
    Health: number;
    Value: number;
    EngineerBlueprint?: string;
    EngineeringLevel?: number;
}

export interface IAmmoWeaponModule extends IBaseModule {
    AmmoInClip: number;
    AmmoInHopper?: number;
}

export interface ILoadout extends IEventBase {
    Ship: string;
    ShipID: number;
    ShipName: string;
    ShipIdent: string;
    Rebuy?: number;
    HullValue?: number;
    ModulesValue?: number;
    Modules: (IBaseModule | IAmmoWeaponModule)[]
}

export type IMaterials = {
    [K in MaterialType]: {
        Name: string;
        Count: number;
        Name_Localised?: string;
    }[];
} & IEventBase;

export interface ISetUserShipName extends IEventBase {
    Ship: string;
    ShipID: number;
    UserShipName: string;
    UserShipId: string;
}

export interface ISuperCruiseJump extends IEventBase {
    JumpType: 'Supercruise';
}

export interface IHyperspaceJump extends IEventBase, IVeryBaseLocation {
    JumpType: 'Hyperspace';
    StarClass: string;
}

export type IStartJump = ISuperCruiseJump | IHyperspaceJump;

export interface IScanned extends IEventBase {
    ScanType: 'Cargo' | 'Data' | 'Crime';
}

export interface ICrewEvent extends IEventBase {
    Crew: string;
}

export interface ICrewMemberJoins extends ICrewEvent {}

export interface ICrewLaunchFighter extends ICrewEvent {}

export interface ICrewMemberRoleChange extends ICrewEvent {
    Role: 'Idle' | 'FireCon' | 'FighterCon';
}

export interface ICrewMemberQuits extends ICrewEvent {}

export interface ICrewHire extends ICrewEvent {
    name: string;
    Faction: string;
    Cost: number;
    CombatRank: number;
}

export interface IKickCrewMember extends ICrewEvent {
    Crew: string;
}

export interface ICommunityGoalDiscard extends ICrewEvent {
    name: string;
    system: string;
}

export interface IEndCrewSession extends ICrewEvent {
    OnCrime: boolean;
}

export interface IJoinACrew extends ICrewEvent {
    Captain: string;
}

export interface IChangeCrewRole extends ICrewEvent {
    Role: string;
}

export interface IQuitACrew extends ICrewEvent {
    Captain: string;
}

export interface IFriends extends IEventBase {
    Status: 'Online' | 'Offline' | 'Requested' | 'Added' | 'Lost' | 'Declined';
    Name: string;
}

export interface IMusic extends IEventBase {
    MusicTrack: 'NoTrack' |
    'MainMenu' |
    'Starport' |
    'SystemMap' |
    'Supercruise' |
    'DestinationFromSupercruise' |
    'GalacticPowers' |
    'Exploration' |
    'GalaxyMap' |
    'Combat_Dogfight' | 'Combat_LargeDogFight' | 'Combat_SRV' |
    'DestinationFromHyperspace' |
    'Unknown_Encounter' | 'GuardianSites' |
    'Combat_Unknown' |
    'Unknown_Settlement' | 'Interdiction' | 'Unknown_Exploration';
}

export interface IPassengerManifest {
    MissionID: number;
    Type: string;
    VIP: boolean;
    Wanted: boolean;
    Count: number;
}

export interface IPassengers extends IEventBase {
    Manifest: IPassengerManifest[];
}

export interface IAfmuRepairs extends IEventBase {
    Module: string;
    Module_Localised: string;
    FullyRepaired: boolean;
    Health: number;
}

export interface IRepairDrone extends IEventBase {
    HullRepaired: number;
}

export interface IModuleInfo extends IEventBase {

}

export interface IMissionInfo {
    MissionID: number;
    Name: string;
    PassengerMission: boolean;
    Expires: number;
}

export interface IMissions extends IEventBase {
    Active: IMissionInfo[];
    Failed: IMissionInfo[];
    Complete: IMissionInfo[];
}

export interface ICommander extends IEventBase {
    Name: string;
}

export interface IReputation extends IEventBase {
    Empire: number;
    Federation: number;
    Alliance: number;
    Independent: number;
}

export interface IStatistics extends IEventBase {
    Bank_Account:{
       Current_Wealth: number;
       Spent_On_Ships: number;
       Spent_On_Outfitting: number;
       Spent_On_Repairs: number;
       Spent_On_Fuel: number;
       Spent_On_Ammo_Consumables: number;
       Insurance_Claims: number;
       Spent_On_Insurance: number
    };
    Combat:{
       Bounties_Claimed: number;
       Bounty_Hunting_Profit: number;
       Combat_Bonds: number;
       Combat_Bond_Profits: number;
       Assassinations: number;
       Assassination_Profits: number;
       Highest_Single_Reward: number;
       Skimmers_Killed: number
    };
    Crime:{
       Notoriety: number;
       Fines: number;
       Total_Fines: number;
       Bounties_Received: number;
       Total_Bounties: number;
       Highest_Bounty: number
    };
    Smuggling:{
       Black_Markets_Traded_With: number;
       Black_Markets_Profits: number;
       Resources_Smuggled: number;
       Average_Profit: number;
       Highest_Single_Transaction: number
    };
    Trading:{
       Markets_Traded_With: number;
       Market_Profits: number;
       Resources_Traded: number;
       Average_Profit: number;
       Highest_Single_Transaction: number
    };
    Mining:{
       Mining_Profits: number;
       Quantity_Mined: number;
       Materials_Collected: number
    };
    Exploration:{
       Systems_Visited: number;
       Exploration_Profits: number;
       Planets_Scanned_To_Level_2: number;
       Planets_Scanned_To_Level_3: number;
       Highest_Payout: number;
       Total_Hyperspace_Distance: number;
       Total_Hyperspace_Jumps: number;
       Greatest_Distance_From_Start: number;
       Time_Played: number
    };
    Passengers:{
       Passengers_Missions_Accepted: number;
       Passengers_Missions_Disgruntled: number;
       Passengers_Missions_Bulk: number;
       Passengers_Missions_VIP: number;
       Passengers_Missions_Delivered: number;
       Passengers_Missions_Ejected: number
    };
    Search_And_Rescue:{
       SearchRescue_Traded: number;
       SearchRescue_Profit: number;
       SearchRescue_Count: number
    };
    TG_ENCOUNTERS:{
       TG_ENCOUNTER_TOTAL: number;
       TG_ENCOUNTER_TOTAL_LAST_SYSTEM: string;
       TG_ENCOUNTER_TOTAL_LAST_TIMESTAMP: string;
       TG_ENCOUNTER_TOTAL_LAST_SHIP: string;
       TG_SCOUT_COUNT: number
    };
    Crafting:{
       Count_Of_Used_Engineers: number;
       Recipes_Generated: number;
       Recipes_Generated_Rank_1: number;
       Recipes_Generated_Rank_2: number;
       Recipes_Generated_Rank_3: number;
       Recipes_Generated_Rank_4: number;
       Recipes_Generated_Rank_5: number
    };
    Crew:{
       NpcCrew_TotalWages: number;
       NpcCrew_Hired: number
    };
    Multicrew:{
       Multicrew_Time_Total: number;
       Multicrew_Gunner_Time_Total: number;
       Multicrew_Fighter_Time_Total: number;
       Multicrew_Credits_Total: number;
       Multicrew_Fines_Total: number
    };
    Material_Trader_Stats:{
       Trades_Completed: number;
       Materials_Traded: number;
       Encoded_Materials_Traded?: number;
       Raw_Materials_Traded?: number;
       Grade_1_Materials_Traded?: number;
       Grade_2_Materials_Traded?: number;
       Grade_3_Materials_Traded?: number;
       Grade_4_Materials_Traded?: number;
       Grade_5_Materials_Traded?: number;
    };
    CQC:{
       CQC_Credits_Earned: number;
       CQC_Time_Played: number;
       CQC_KD: number;
       CQC_Kills: number;
       CQC_WL: number
    }
 }

 export interface INpcCrewPaidWage extends IEventBase {
    NpcCrewName: string,
    NpcCrewId: number;
    Amount: number;
}

export interface IStatStationData {
    MarketID: number;
    StarSystem: string;
    StationName: string;
}

export interface IShipThing {
    ShipID: number;
    ShipType: string;
    ShipType_Localised?: string;
    Name?: string;
    Value: number;
    Hot: boolean;
}

export interface IRemoteShip extends IShipThing {
    StarSystem: string;
    ShipMarketID: number;
    TransferTime: number;
    TransferPrice: number;
}

export interface IStoredShips extends IEventBase, IStatStationData {
    ShipsHere: IShipThing[];
    ShipsRemote: IRemoteShip[];
}

export interface IStoredModules extends IEventBase, IStatStationData {
    Items: {
        Name: string;
        Name_Localised: string;
        StorageSlot: number;
        StarSystem: string;
        MarketID: number;
        TransferCost: number;
        TransferTime: number;
        BuyPrice: number;
        Hot: boolean;
        EngineerModifications?: string;
        Level?: number;
        Quality?: number;
    }[];
}

interface INoLock extends IEventBase {
    TargetLocked: false;
}

interface IShipTargetedStage0Base extends IEventBase {
    ScanStage: number;
    Ship: string;
    Ship_Localised?: string;
    TargetLocked: true;
}

export interface IShipTargetedStage0 extends IShipTargetedStage0Base {
    ScanStage: 0;
}

export type LegalStatus = 'Clean' | 'Wanted' | 'Lawless' | 'Unknown';

interface IShipTargetedStage1Base extends IShipTargetedStage0Base {
    PilotName: string;
    PilotName_Localised: string;
    PilotRank: CombatRank;
}

export interface IShipTargetedStage1 extends IShipTargetedStage1Base {
    ScanStage: 1;
}

interface IShipTargetedStage2Base extends IShipTargetedStage1Base {
    ShieldHealth: number;
    HullHealth: number;
}

export interface IShipTargetedStage2 extends IShipTargetedStage2Base {
    ScanStage: 2;
}

interface IShipTargetedStage3Base extends IShipTargetedStage2Base {
    LegalStatus: LegalStatus;
    Bounty?: number;
    Faction?: string;
    Subsystem?: string;
    Subsystem_Localised?: string;
    SubsystemHealth?: number;
}

export interface IShipTargetedStage3 extends IShipTargetedStage3Base {
    ScanStage: 3;
}

export type IShipTargeted = INoLock | IShipTargetedStage0 | IShipTargetedStage1 | IShipTargetedStage2 | IShipTargetedStage3;

export interface IShutdown extends IEventBase {
}

export interface IUnderAttack extends IEventBase {
    Target: string;
}

export interface IDiscoveryScan extends IEventBase {
    SystemAddress: number;
    Bodies: number;
}

export interface IBodyPromixity extends IEventBase {
    StarSystem: string;
    SystemAddress: number;
    Body: string;
    BodyID: number;
}

export interface IApproachBody extends IBodyPromixity {
}

export interface ILeaveBody extends IBodyPromixity {
}

export interface IFighterRebuilt extends IEventBase {
    Loadout: FighterLoadout;
}

export interface IMaterialExchange {
    Material: string;
    Material_Localised?: string;
    Category: string;
    Category_Localised: string;
    Quantity: number;
}

export interface IMaterialTrade extends IEventBase {
    MarketID: number;
    TraderType: 'encoded' | 'raw' | 'manufactured';
    Paid: IMaterialExchange;
    Received: IMaterialExchange;
}

export interface ITechnologyBroker extends IEventBase {
    BrokerType: 'guardian' | 'human';
    MarketID: number;
    ItemsUnlocked: {
        Name: string;
        Name_Localised: string;
    }[];
    Commodities: {
        Name: string;
        Name_Localised?: string;
        Count: number;
     }[];
    Materials: {
        Name: string;
        Name_Localised?: string;
        Count: number;
        Category: MaterialType;
    }[];
}

// Stat events

export interface IMarket extends IEventBase, IStatStationData {
    Items?: {
        name: string;
        BuyPrice: number;
        SellPrice: number;
        MeanPrice: number;
        DemandBracket: number;
        Stock: number;
        Demand: number;
        Consumer: boolean;
        Producer: boolean;
        Rare: boolean;
    }[];
}

export interface IShipyard extends IEventBase, IStatStationData {
    Horizons?: boolean;
    AllowCobraMkIV?: boolean;
    PriceList?: {
        id: number;
        ShipType: string;
        ShipType_Localised: string;
        ShipPrice: number;
    }[];
}

export interface IOutfitting extends IEventBase, IStatStationData {
    Horizons?: boolean;
    Items?: {
        id: number;
        Name: string;
        BuyPrice: number;
    }[];
}

export interface IModulesInfo extends IEventBase {
    Modules: {
        Slot: AllSlots;
        Item: string;
        Power?: number;
        Priority?: number;
    };
}

export const enum StatusFlags {
    Docked = 1,
    Landed = 1 << 1,
    LandingGear = 1 << 2,
    Shields = 1 << 3,
    Supercruise = 1 << 4,
    FlightAssist = 1 << 5,
    HardpointsDeployed = 1 << 6,
    Winged = 1 << 7,
    lIGHTS = 1 << 8,
    CargoScoop = 1 << 9,
    SilentRunning = 1 << 10,
    FuelScooping = 1 << 11,
    SrvHandbrake = 1 << 12,
    SrvTurret = 1 << 13,
    SrvUnderShip = 1 << 14,
    SrvDriveAssist = 1 << 15,
    FSDMassLocked = 1 << 16,
    FSDCharging = 1 << 17,
    FSDCooldown = 1 << 18,
    LowFuel = 1 << 19,
    OverHeating = 1 << 20,
    HasLatLong = 1 << 21,
    IsInDanger = 1 << 22,
    Interdicted = 1 << 23,
    InMainShip = 1 << 24,
    InFighter = 1 << 25,
    InSRV = 1 << 26,
}

export const enum GuiFocus {
    NoFocus,
    InternalPanel,
    ExternalPanel,
    CommsPanel,
    RolePanel,
    StationServices,
    GalaxyMap,
    SystemMap,
}

export interface IStatus extends IEventBase {
    Flags: StatusFlags;
    Pips: [number, number, number];
    Firegroup: number;
    GuiFocus: GuiFocus;
    Latitude?: number;
    Longitude?: number;
    Altitude?: number;
    Heading?: number;
}

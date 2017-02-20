import { EDPosition } from './locations';

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
    Powers?: string[]; // TODO: enum
    PowerplayState?: string; // TODO: enum
}

export interface ILocation extends IBaseLocation {
    Docked: boolean;
    Body?: string;
    BodyType?: 'Star';
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

/**
 * Used once as a rank index progression and once as Rank progress update.
 */
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

export interface IMaterialEvent {
    Category: 'Encoded';
    Name: string;
    Count: number;
}

export interface IMaterialCollected extends IMaterialEvent {}

export interface IMaterialDiscarded extends IMaterialEvent {}

export interface IMission extends IEventBase {
    Faction: string;
    Name: string;
    DestinationSystem: string;
    DestinationStation: string;
    Expiry?: string; // TODO autoconvert to date?
    MissionID: number;
}

export interface IMissionAccepted extends IMission {
    TargetType: string;
    TargetType_Localised: string;
}

export interface IMissionCompleted extends IMission {
    Reward: number;
}

export interface IModuleBuy extends IEventBase {
    Slot: string; // TODO: Possibly enum
    BuyItem: string;
    BuyItem_Localised: string;
    BuyPrice: number;
    Ship: string; // TODO: possible enum
    ShipID: number;
}

export interface IShieldState extends IEventBase {
    ShieldsUp: boolean;
}

export interface IRefuelBase extends IEventBase {
    Cost: number;
}

export interface IRefuelAll extends IRefuelBase {}

export interface IBuyAmmo extends IRefuelBase {}

export interface ISellExplorationData extends IEventBase {
    Systems: string[];
    Discovered: string[]; // TODO: Does this include planets?
    BaseValue: number;
    Bonus: number;
}

export interface IDockingGranted extends IEventBase {
    LandingPad: number;
    StationName: string;
}

export interface IDockingRequested extends IEventBase {
    StationName: string;
}

export interface IMarketEvent extends IEventBase {
    Type: string; // TODO: Commodity enum? I'd rather kill myself.
    Count: number;
}

export interface IMarketBuy extends IMarketEvent {
    BuyPrice: number;
    TotalCost: number;
}

export interface IMarketSell extends IMarketEvent {
    SellPrice: number;
    TotalPrice: number;
    /**
     * Per unit.
     */
    AvgPricePaid: number;
}

export interface IDockBase extends IEventBase {
    StationName: string;
    StationType: 'Orbis' | 'Coriolis';
}

export interface IDocked extends IDockBase {
    StarSystem: string;
    StationFaction: string;
    FactionStation: FactionState;
    StationGovernment: string; // TODO: type
    StationGovernment_Localised: string;
    StationAllegiance: Allegiance;
    StationEconomy: string; // TODO: type
    StationEconomy_Localised: string;
}

export interface IUndocked extends IDockBase {}

export interface IUSSDrop extends IEventBase {
    USSType: '$USS_Type_Aftermath' | '$USS_Type_VeryValuableSalvage;' | '$USS_Type_Salvage;';
    USSType_Localised: string;
    USSThreat: number;
}

export interface IGeoEvent extends IEventBase {
    Latitude: number;
    Longitude: number;
}

export interface ITouchdown extends IGeoEvent {}
export interface ILiftoff extends IGeoEvent {}

export interface IEngineerEvent extends IEventBase {
    Engineer: string;
    Blueprint: string;
    Level: number;
}

export interface IEngineerCraft extends IEngineerEvent {
    Ingredients: { [material: string]: number }
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
    PlayerPilot: false;
    Fighter: boolean;
}

export interface IInterdicted extends IEventBase {
    Submitted: boolean;
    Interdictor: string;
    Interdictor_Localised: string;
    IsPlayer: boolean;
    Faction: string;
}

export interface ILaunchFighter extends IEventBase {
    Loadout: 'zero';
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
    SellShipId: number;
    ShipPrice: number;
}


export interface IShipyardSwap extends IEventBase {
    ShipType: string;
    ShipId: number;
    ShipPrice: number;
    StoreOldShip: string,
    StoreShipID: number;
}

export interface IShipyardTransfer extends IEventBase {
    ShipType: string;
    ShipID: number;
    System: string;
    Distance: number;
    TransferPrice: number;
}

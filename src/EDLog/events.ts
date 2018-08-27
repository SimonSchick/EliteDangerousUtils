import { AllSlots } from '../common';
import { EDPosition } from './locations';

// tslint:disable:no-empty-interface

export interface EventBase {
  timestamp: Date;
  readonly event: string;
}

export type StationType =
  | 'Orbis'
  | 'Coriolis'
  | 'Bernal'
  | 'Outpost'
  | 'SurfaceStation'
  | 'AsteroidBase'
  | 'MegaShip';
export type Faction = 'Empire' | 'Alliance' | 'Federation' | 'PilotsFederation' | 'Guardian';
export type Allegiance = 'None' | 'Independent' | Faction;
export type FactionState =
  | 'None'
  | 'Retreat'
  | 'Lockdown'
  | 'CivilUnrest'
  | 'CivilWar'
  | 'Boom'
  | 'Expansion'
  | 'Bust'
  | 'Famine'
  | 'Election'
  | 'Investment'
  | 'Outbreak'
  | 'War';
export type Economy =
  | '$economy_None;'
  | '$economy_Colony;'
  | '$economy_Agri;'
  | '$economy_HighTech;'
  | '$economy_Extraction;'
  | '$economy_Industrial;'
  | '$economy_Military;'
  | '$economy_Refinery;'
  | '$economy_Terraforming;'
  | '$economy_Service;'
  | '$economy_Repair;'
  | '$economy_Tourism;'
  | '$economy_Prison;'
  | '$economy_Damaged;';

export type Security =
  | '$SYSTEM_SECURITY_low;'
  | '$SYSTEM_SECURITY_medium;'
  | '$SYSTEM_SECURITY_high;';
export type BodyType =
  | 'Star'
  | 'Planet'
  | 'Station'
  | 'PlanetaryRing'
  | 'StellarRing'
  | 'Null'
  | 'AsteroidCluster';
export type MaterialType = 'Encoded' | 'Manufactured' | 'Raw';
export type Power =
  | 'Li Yong-Rui'
  | 'Felicia Winters'
  | 'Edmund Mahon'
  | 'Denton Patreus'
  | 'Zachary Hudson'
  | 'Zemina Torval'
  | 'Archon Delaine'
  | 'Aisling Duval'
  | 'A. Lavigny-Duval'
  | 'Pranav Antal'
  | 'Yuri Grom';
export type FighterLoadout = 'zero' | 'two';

export interface VeryBaseLocation {
  SystemAddress?: number;
  StarSystem: string;
}

export interface BaseLocation extends EventBase, VeryBaseLocation {
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
  PowerplayState?:
    | 'Exploited'
    | 'Controlled'
    | 'InPrepareRadius'
    | 'Prepared'
    | 'Contested'
    | 'Turmoil'
    | 'HomeSystem';
}

export interface FSDJump extends BaseLocation {
  Factions?: FactionInfo[];
  JumpDist: number;
  FuelUsed: number;
  FuelLevel: number;
  BoostUsed?: number;
}

export interface FactionInfo {
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

export interface Location extends BaseLocation {
  Latitude?: number;
  Longitude?: number;
  StationName?: string;
  StationType?: StationType;
  Docked: boolean;
  Body?: string;
  BodyType?: BodyType;
  FactionState?: FactionState;
  Factions?: FactionInfo[];
  MarketID?: number;
  BodyID?: number;
}

export interface ReceiveText extends EventBase {
  Channel: 'local' | 'npc' | 'direct' | 'player' | 'wing' | 'voicechat';
  // If Channel is player, this will be prefixed with a `&`
  From?: string;
  Message: string;
  // May be null for station transmissions
  From_Localised?: string;
  // Only set when channel is npc.
  Message_Localised?: string;
}

export interface SendText extends EventBase {
  Message: string;
  To: 'local' | 'wing' | string;
  To_Localised?: string;
}

export interface Bounty extends EventBase {
  Target: string;
  VictimFaction: string;
  VictimFaction_Localised?: string;
  Reward?: number;
  TotalReward?: number;
  SharedWithOthers?: number;
  Faction?: string;
  Rewards?: {
    Faction: string;
    Reward: number;
  }[];
}

export interface FuelScoop extends EventBase {
  Scooped: number;
  Total: number;
}

export interface LaunchSRV extends EventBase {
  Loadout: 'starter';
  PlayerControlled: boolean;
}

export interface LoadGame extends EventBase {
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
export interface Rank extends EventBase {
  Combat: number;
  Trade: number;
  Explore: number;
  Empire: number;
  Federation: number;
  CQC: number;
}

export interface Progress extends Rank {}

export interface SupercruiseExit extends EventBase, VeryBaseLocation {
  Body: string;
  BodyID?: number;
  BodyType: BodyType;
}

export interface SupercruiseEntry extends EventBase, VeryBaseLocation {}

export interface CommitCrime extends EventBase {
  CrimeType:
    | 'assault'
    | 'collidedAtSpeedInNoFireZone'
    | 'collidedAtSpeedInNoFireZoneHullDamage'
    // wut
    | 'collidedAtSpeedInNoFireZone_hulldamage'
    | 'disobeyPolice'
    | 'dockingMajorBlockingAirlock'
    | 'dockingMajorBlockingLandingPad'
    | 'dockingMajorTresspass'
    | 'dockingMinorBlockingAirlock'
    | 'dockingMinorBlockingLandingPad'
    | 'dockingMinorTresspass'
    | 'dumpingDangerous'
    | 'dumpingNearStation'
    | 'fireInNoFireZone'
    | 'fireInStation'
    | 'illegalCargo'
    | 'interdiction'
    | 'murder'
    | 'piracy'
    | 'recklessWeaponsDischarge';
  // deprecated
  Victim_Localised?: string;
  Faction: string;
  Victim?: string;
  Bounty?: number;
  Fine?: number;
}

export interface MaterialEvent extends EventBase {
  Category: MaterialType;
  Name: string;
  Name_Localised?: string;
  Count: number;
}

export interface MaterialCollected extends MaterialEvent {}

export interface MaterialDiscarded extends MaterialEvent {}

export interface Mission extends EventBase {
  Faction: string;
  Name: string;
  DestinationSystem?: string;
  DestinationStation?: string;
  Expiry?: string; // TODO autoconvert to date?
  MissionID: number;
  Count?: number;

  Commodity?: string;
  Commodity_Localised?: string;
  Reward?: number;

  Donation?: string | number;
  Wing?: boolean;

  TargetFaction?: string;

  TargetType?: string;
  TargetType_Localised?: string;

  Target?: string;
  Target_Localised?: string;
}

export type Trend = 'UpGood' | 'DownGood' | 'UpBad' | 'DownBad' | 'None';

export interface FactionEffect {
  Faction: string;
  Effects: {
    Effect: string;
    Effect_Localised: string;
    Trend: Trend;
  }[];
  Influence: {
    SystemAddress: number;
    Trend: Trend;
  }[];
  Reputation: Trend;
}

export interface MissionAccepted extends Mission {
  TargetFaction?: string;
  KillCount?: number;
  LocalisedName: string;
  PassengerCount?: number;
  PassengerVIPs?: boolean;
  PassengerWanted?: boolean;
  PassengerType?: 'Terrorist' | 'Tourist' | 'AidWorker';
  Influence: 'Med' | 'None';
  Reputation: 'Med' | 'None';
}

export interface MissionCompleted extends Mission {
  FactionEffects: FactionEffect[];
  MaterialsReward?: {
    Count: number;
    Name: string;
    Name_Localised?: string;
    Category: string;
    Category_Localised: string;
  }[];

  CommodityReward?: {
    Name: string;
    Name_Localised: string;
    Count: number;
  }[];
}

export interface ModuleEvent extends EventBase {
  MarketID?: number;
  Slot?: AllSlots;
  Ship: string;
  ShipID: number;
}

export interface ModuleStoreEvent extends ModuleEvent {
  EngineerModifications?: string;
  Quality?: number;
  Level?: number;
  Hot: boolean;
}

export interface ModuleRetrieve extends ModuleStoreEvent {
  RetrievedItem: string;
  RetrievedItem_Localised: string;
  SwapOutItem?: string;
  SwapOutItem_Localised?: string;
  Cost?: number;
}

export interface ModuleStoreBase {
  StoredItem: string;
  StoredItem_Localised: string;
}

export interface ModuleStore extends ModuleStoreEvent, ModuleStoreBase {}

export interface MassModuleStore extends ModuleEvent {
  Items: {
    Slot: string;
    Name: string;
    Name_Localised: string;
    EngineerModifications?: string;
    Quality?: number;
    Level?: number;
    Hot: boolean;
  }[];
}

export interface BaseBaseSell {
  SellItem: string;
  SellItem_Localised: string;
  SellPrice: number;
}

export interface ModuleBuy extends ModuleEvent, Partial<BaseBaseSell>, Partial<ModuleStoreBase> {
  BuyItem: string;
  BuyItem_Localised: string;
  BuyPrice: number;
}

export interface ModuleSell extends ModuleEvent, BaseBaseSell {}

export interface ModuleSwap extends EventBase {
  MarketID: number;
  FromSlot: AllSlots;
  ToSlot: AllSlots;
  FromItem: string;
  FromItem_Localised: string;
  ToItem: string | 'Null';
  ToItem_Localised?: string;
  Ship: string;
  ShipID: number;
}

export interface ShieldState extends EventBase {
  ShieldsUp: boolean;
}

export interface RefuelBase extends EventBase {
  Cost: number;
}

export interface RefuelAll extends RefuelBase {
  Amount: number;
}

export interface RefuelPartial extends RefuelBase {
  Amount: number;
}

export interface BuyAmmo extends RefuelBase {}

export interface SellExplorationData extends EventBase {
  Systems: string[];
  Discovered: string[];
  BaseValue: number;
  Bonus: number;
  TotalEarnings: number;
}

export interface DockingEvent extends EventBase {
  StationName: string;
  StationType?: StationType;
  MarketID?: number;
}

export interface DockingGranted extends DockingEvent {
  LandingPad: number;
}

export interface DockingRequested extends DockingEvent {}

export interface DockingCancelled extends DockingEvent {}

export interface DockingTimeout extends DockingEvent {}

export interface DockingDenied extends DockingEvent {
  Reason:
    | 'NoSpace'
    | 'TooLarge'
    | 'Hostile'
    | 'Offences'
    | 'Distance'
    | 'ActiveFighter'
    | 'NoReason';
}

export interface MarketEvent extends EventBase {
  Type: string;
  Type_Localised?: string;
  Count: number;
  MarketID: number;
}

export interface MarketBuy extends MarketEvent {
  BuyPrice: number;
  TotalCost: number;
}

export interface MarketSell extends MarketEvent {
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

export interface DockBase extends EventBase {
  StationName: string;
  StationType: StationType;
  StationState?: 'UnderRepairs' | 'Damaged';
  MarketID?: number;
}

export interface MissionAbandoned extends EventBase {
  Name: string;
  MissionID: number;
}

export interface Docked extends DockBase, VeryBaseLocation {
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
  Wanted?: true;
}

export interface Undocked extends DockBase {}

export interface USSDrop extends EventBase {
  USSType:
    | '$USS_Type_Aftermath;'
    | '$USS_Type_VeryValuableSalvage;'
    | '$USS_Type_Salvage;'
    | '$USS_Type_WeaponsFire;'
    | '$USS_Type_Convoy;'
    | '$USS_Type_DistressSignal;'
    | '$USS_Type_MissionTarget;'
    | '$USS_Type_ValuableSalvage;'
    | '$USS_Type_Ceremonial;'
    | '$USS_Type_NonHuman;';
  USSType_Localised: string;
  USSThreat: number;
}

export interface GeoEvent extends EventBase {
  Latitude: number;
  Longitude: number;
}

export interface PlayerController {
  PlayerControlled: boolean;
}

export interface Touchdown extends Partial<GeoEvent>, PlayerController {}
export interface Liftoff extends Partial<GeoEvent>, PlayerController {}

export interface EngineerEvent extends EventBase {
  EngineerID: number;
  BlueprintID: number;
  Engineer: string;
  BlueprintName: string;
  Level: number;
}

export interface EngineerCraft extends EngineerEvent {
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

export interface EngineerApply extends EngineerEvent {
  Override?: string;
}

export interface EngineerProgress extends EventBase {
  Engineer: string;
  EngineerID: number;
  Progress?: 'Unlocked';
  Rank: number;
}

export interface HullDamage extends EventBase {
  Health: number;
  PlayerPilot: boolean;
  Fighter?: boolean;
}

export interface InterdictionBase extends EventBase {
  Interdictor: string;
  Interdictor_Localised?: string;
  IsPlayer: boolean;
  CombatRank?: number;
}

export interface Interdicted extends InterdictionBase {
  Submitted: boolean;
  Faction?: string;
  Power?: Power;
}

export interface EscapeInterdiction extends InterdictionBase {
  Interdictor: string;
  IsPlayer: boolean;
}

export interface LaunchFighter extends EventBase {
  Loadout: FighterLoadout;
  PlayerControlled: boolean;
}

export interface LogFileSwap {
  file: string;
}

export interface Fileheader extends EventBase {
  part: number;
  language: string;
  gameversion: string;
  build: string;
}

export interface RepairAll extends EventBase {
  Cost: number;
}

export interface ShipyardSell extends EventBase {
  MarketID: number;
  ShipType_Localised: string;
  ShipType: string;
  SellShipID: number;
  ShipPrice: number;
  System?: string;
}

export interface ShipyardSwap extends EventBase {
  MarketID: number;
  ShipType: string;
  ShipType_Localised?: string;
  ShipID: number;
  ShipPrice?: number;
  StoreOldShip?: string;
  StoreShipID?: number;
  SellOldShip?: string;
  SellShipID?: number;
}

export interface ShipyardTransfer extends EventBase {
  ShipType: string;
  ShipType_Localised?: string;
  ShipID: number;
  System: string;
  Distance: number;
  TransferPrice: number;
  TransferTime: number;
  MarketID: number;
  ShipMarketID: number;
}

export interface EjectCargo extends EventBase {
  Type: string;
  Type_Localised?: string;
  Count: number;
  Abandoned: boolean;
  PowerplayOrigin?: string;
}

export interface HeatWarning extends EventBase {}

export interface HeatDamage extends EventBase {}

export interface Screenshot extends EventBase {
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

export interface RedeemVoucher extends EventBase {
  Type: 'bounty' | 'settlement' | 'scannable' | 'CombatBond' | 'trade';
  Amount: number;
  Faction?: string;
  Factions?: { Faction: string; Amount: number }[];
  BrokerPercentage?: number;
}

export interface PayLegacyFines extends EventBase {
  Amount: number;
  BrokerPercentage?: number;
}

export interface RebootRepair extends EventBase {
  Modules: AllSlots[];
}

export interface MaterialDiscovered extends EventBase {
  Category: MaterialType;
  Name: string;
  Name_Localised?: string;
  DiscoveryNumber: number;
}

export interface ClearSavedGame extends EventBase {
  Name: string;
}

export interface NewCommander extends EventBase {
  Name: string;
  Package: string;
}

export interface Synthesis extends EventBase {
  Name: string;
  Materials: {
    Name: string;
    Count: number;
  }[];
}

export interface DockSRV extends EventBase {}

export type CombatRank =
  | 'Harmless'
  | 'Mostly Harmless'
  | 'Novice'
  | 'Competent'
  | 'Expert'
  | 'Dangerous'
  | 'Master'
  | 'Deadly'
  | 'Elite';

export interface Suicide extends EventBase {}

export interface SingleDeath extends EventBase {
  KillerName: string;
  KillerShip: string;
  KillerRank: CombatRank;
}

export interface WingDeath extends EventBase {
  Killers: {
    Name: string;
    Ship: string;
    Rank: CombatRank;
  }[];
}

export type Died = SingleDeath | WingDeath | Suicide;

export interface Resurrect extends EventBase {
  Option: 'rebuy';
  Cost: number;
  Bankrupt: boolean;
}

export interface PowerplayJoin extends EventBase {
  Power: Power;
}

export interface DatalinkScan extends EventBase {
  Message: string;
  Message_Localised: string;
}

export interface DatalinkVoucher extends EventBase {
  Reward: number;
  VictimFaction: Faction | '';
  PayeeFaction: Faction;
}

export interface WingJoin extends EventBase {
  Others: string[];
}

export interface WingAdd extends EventBase {
  Name: string;
}

export interface WingLeave extends EventBase {
  Name?: string;
}

export interface WingInvite extends EventBase {
  Name: string;
}

export interface PowerplaySalary extends EventBase {
  Power: Power;
  Amount: number;
}

export interface CrewAssign extends EventBase {
  CrewID?: number;
  Name: string;
  Role: 'Active'; // TODO: More
}

export interface ModuleSellRemote extends ModuleEvent, BaseBaseSell {
  StorageSlot: number;
  ServerId: number;
}

export interface DockFighter extends EventBase {}

export interface VehicleSwitch extends EventBase {
  // Apparently nothing when it's the SRV
  To?: 'Mothership' | 'Fighter';
}

export interface RestockVehicle extends EventBase {
  Type: 'independent_fighter' | 'federation_fighter' | 'imperial_fighter';
  Loadout: FighterLoadout;
  Cost: number;
  Count: number;
}

export interface FetchRemoteModule extends EventBase {
  StorageSlot: number;
  StorageItem?: string;
  StorageItem_Localised?: string;
  StoredItem?: string;
  StoredItem_Localised?: string;
  ServerId: number;
  TransferCost: number;
  Ship: string;
  ShipID: number;
  TransferTime: number;
}

export interface FactionKillBond extends EventBase {
  Reward: number;
  AwardingFaction: string;
  AwardingFaction_Localised?: string;
  VictimFaction: string;
}

export interface Interdiction extends EventBase {
  Success: boolean;
  IsPlayer: boolean;
  Faction?: string;
  CombatRank?: number;
  Power?: Allegiance;
  Interdicted?: string;
}

export interface ApproachSettlement extends EventBase {
  MarketID?: number;
  Name_Localised?: string;
  Name: string;
}

export interface DataScanned extends EventBase {
  Type:
    | 'DataPoint'
    | 'DataLink'
    | 'ListenigPost'
    | 'AdandonedDataLog'
    | 'WreckedShip'
    | 'Unknown_Uplink'
    | 'ShipUplink'
    | 'ListeningPost'
    | 'ANCIENTCODEX'
    | 'AbandonedDataLog';
}

export type Promotion = Partial<Rank>;

export interface CollectCargo extends EventBase {
  Type: string;
  Type_Localised?: string;
  Stolen: boolean;
}

export interface MissionFailed extends EventBase {
  Name: string;
  MissionID: number;
}

export interface Repair extends EventBase {
  Item: string;
  Cost: number;
}

export interface PVPKill extends EventBase {
  Victim: string;
  CombatRank: number;
}

export interface CommunityEventbase extends EventBase {
  Name: string;
  System: string;
}

export interface CommunityGoalJoin extends CommunityEventbase {}

export interface CommunityGoalReward extends CommunityEventbase {
  Reward: number;
}

export interface PayFines extends EventBase {
  AllFines?: true;
  ShipID: number;
  Amount: number;
}

export interface JetConeBoost extends EventBase {
  BoostValue: number;
}

export interface JetConeDamage extends EventBase {
  Module: string;
}

export interface ShipyardBuy extends EventBase {
  MarketID: number;
  ShipType: string;
  ShipType_Localised: string;
  ShipPrice: number;
  StoreOldShip: string;
  StoreShipID: number;
}

export interface ShipyardNew extends EventBase {
  ShipType: string;
  ShipType_Localised: string;
  NewShipID: number;
}

export interface CapShipBond extends FactionKillBond {}

export interface Ring {
  Name: string;
  RingClass: string;
  MassMT: number;
  InnerRad: number;
  OuterRad: number;
}

export interface ScanBase extends EventBase {
  BodyName: string;
  DistanceFromArrivalLS: number;
  SurfaceTemperature: number;
  RotationPeriod: number;
  Rings?: Ring[];
}

export interface Star extends ScanBase {
  StarType: string;
  StellarMass: number;
  Radius: number;
  AbsoluteMagnitude: number;
  Age_MY: number;
}

export interface Body extends ScanBase {
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
  };
}

export interface NonCentralBody extends ScanBase {
  SemiMajorAxis: number;
  Eccentricity: number;
  OrbitalInclination: number;
  Periapsis: number;
  OrbitalPeriod: number;
}

export type Scan = (Star | Body) & Partial<NonCentralBody>;

export interface BuyExplorationData extends EventBase {
  System: string;
  Cost: number;
}

export interface BuyTradeData extends EventBase {
  System: string;
  Cost: number;
}

export interface MiningRefined extends EventBase {
  Type: string;
  Type_Localised?: string;
}

export interface CockpitBreached extends EventBase {}

export interface DronesEvent extends EventBase {
  Type: 'Drones';
  Count: number;
}

export interface BuyDrones extends DronesEvent {
  BuyPrice: number;
  TotalCost: number;
}

export interface SellDrones extends DronesEvent {
  SellPrice: number;
  TotalSale: number;
}

export interface SelfDestruct extends EventBase {}

export interface Cargo extends EventBase {
  Inventory: {
    Name: string;
    Name_Localised?: string;
    Count: number;
    Stolen: number;
  }[];
}

export interface BaseModule {
  Slot: AllSlots;
  Item: string;
  On: boolean;
  Priority: number;
  Health: number;
  Value: number;
  EngineerBlueprint?: string;
  EngineeringLevel?: number;
}

export interface AmmoWeaponModule extends BaseModule {
  AmmoInClip: number;
  AmmoInHopper?: number;
}

export interface Loadout extends EventBase {
  Ship: string;
  ShipID: number;
  ShipName: string;
  ShipIdent: string;
  Rebuy?: number;
  HullValue?: number;
  ModulesValue?: number;
  Modules: (BaseModule | AmmoWeaponModule)[];
}

export type Materials = {
  [K in MaterialType]: {
    Name: string;
    Count: number;
    Name_Localised?: string;
  }[]
} &
  EventBase;

export interface SetUserShipName extends EventBase {
  Ship: string;
  ShipID: number;
  UserShipName: string;
  UserShipId: string;
}

export interface SuperCruiseJump extends EventBase {
  JumpType: 'Supercruise';
}

export interface HyperspaceJump extends EventBase, VeryBaseLocation {
  JumpType: 'Hyperspace';
  StarClass: string;
}

export type StartJump = SuperCruiseJump | HyperspaceJump;

export interface Scanned extends EventBase {
  ScanType: 'Cargo' | 'Data' | 'Crime';
}

export interface CrewEvent extends EventBase {
  Crew: string;
}

export interface CrewMemberJoins extends CrewEvent {
  Crew: string;
}

export interface CrewLaunchFighter extends CrewEvent {}

export interface CrewMemberRoleChange extends CrewEvent {
  Role: 'Idle' | 'FireCon' | 'FighterCon';
}

export interface CrewMemberQuits extends CrewEvent {}

export interface CrewHire extends EventBase {
  Name: string;
  CrewID: number;
  Faction: string;
  Cost: number;
  CombatRank: number;
}

export interface KickCrewMember extends CrewEvent {
  Crew: string;
}

export interface CommunityGoalDiscard extends CrewEvent {
  name: string;
  system: string;
}

export interface EndCrewSession extends CrewEvent {
  OnCrime: boolean;
}

export interface JoinACrew extends CrewEvent {
  Captain: string;
}

export interface ChangeCrewRole extends CrewEvent {
  Role: string;
}

export interface QuitACrew extends CrewEvent {
  Captain: string;
}

export interface Friends extends EventBase {
  Status: 'Online' | 'Offline' | 'Requested' | 'Added' | 'Lost' | 'Declined';
  Name: string;
}

export interface Music extends EventBase {
  MusicTrack:
    | 'NoTrack'
    | 'MainMenu'
    | 'Starport'
    | 'SystemMap'
    | 'Supercruise'
    | 'DestinationFromSupercruise'
    | 'GalacticPowers'
    | 'Exploration'
    | 'GalaxyMap'
    | 'Combat_Dogfight'
    | 'Combat_LargeDogFight'
    | 'Combat_SRV'
    | 'DestinationFromHyperspace'
    | 'Unknown_Encounter'
    | 'GuardianSites'
    | 'Combat_Unknown'
    | 'Unknown_Settlement'
    | 'Interdiction'
    | 'Unknown_Exploration'
    | 'Combat_CapitalShip'
    | 'Damaged_Starport';
}

export interface PassengerManifest {
  MissionID: number;
  Type: string;
  VIP: boolean;
  Wanted: boolean;
  Count: number;
}

export interface Passengers extends EventBase {
  Manifest: PassengerManifest[];
}

export interface AfmuRepairs extends EventBase {
  Module: string;
  Module_Localised: string;
  FullyRepaired: boolean;
  Health: number;
}

export interface RepairDrone extends EventBase {
  HullRepaired: number;
}

export interface ModuleInfo extends EventBase {}

export interface MissionInfo {
  MissionID: number;
  Name: string;
  PassengerMission: boolean;
  Expires: number;
}

export interface Missions extends EventBase {
  Active: MissionInfo[];
  Failed: MissionInfo[];
  Complete: MissionInfo[];
}

export interface Commander extends EventBase {
  Name: string;
}

export interface Reputation extends EventBase {
  Empire: number;
  Federation: number;
  Alliance: number;
  Independent: number;
}

export interface Statistics extends EventBase {
  Bank_Account: {
    Current_Wealth: number;
    Spent_On_Ships: number;
    Spent_On_Outfitting: number;
    Spent_On_Repairs: number;
    Spent_On_Fuel: number;
    Spent_On_Ammo_Consumables: number;
    Insurance_Claims: number;
    Spent_On_Insurance: number;
  };
  Combat: {
    Bounties_Claimed: number;
    Bounty_Hunting_Profit: number;
    Combat_Bonds: number;
    Combat_Bond_Profits: number;
    Assassinations: number;
    Assassination_Profits: number;
    Highest_Single_Reward: number;
    Skimmers_Killed: number;
  };
  Crime: {
    Notoriety: number;
    Fines: number;
    Total_Fines: number;
    Bounties_Received: number;
    Total_Bounties: number;
    Highest_Bounty: number;
  };
  Smuggling: {
    Black_Markets_Traded_With: number;
    Black_Markets_Profits: number;
    Resources_Smuggled: number;
    Average_Profit: number;
    Highest_Single_Transaction: number;
  };
  Trading: {
    Markets_Traded_With: number;
    Market_Profits: number;
    Resources_Traded: number;
    Average_Profit: number;
    Highest_Single_Transaction: number;
  };
  Mining: {
    Mining_Profits: number;
    Quantity_Mined: number;
    Materials_Collected: number;
  };
  Exploration: {
    Systems_Visited: number;
    Exploration_Profits: number;
    Planets_Scanned_To_Level_2: number;
    Planets_Scanned_To_Level_3: number;
    Highest_Payout: number;
    Total_Hyperspace_Distance: number;
    Total_Hyperspace_Jumps: number;
    Greatest_Distance_From_Start: number;
    Time_Played: number;
  };
  Passengers: {
    Passengers_Missions_Accepted: number;
    Passengers_Missions_Disgruntled: number;
    Passengers_Missions_Bulk: number;
    Passengers_Missions_VIP: number;
    Passengers_Missions_Delivered: number;
    Passengers_Missions_Ejected: number;
  };
  Search_And_Rescue: {
    SearchRescue_Traded: number;
    SearchRescue_Profit: number;
    SearchRescue_Count: number;
  };
  TG_ENCOUNTERS: {
    TG_ENCOUNTER_TOTAL: number;
    TG_ENCOUNTER_TOTAL_LAST_SYSTEM: string;
    TG_ENCOUNTER_TOTAL_LAST_TIMESTAMP: string;
    TG_ENCOUNTER_TOTAL_LAST_SHIP: string;
    TG_SCOUT_COUNT: number;
  };
  Crafting: {
    Count_Of_Used_Engineers: number;
    Recipes_Generated: number;
    Recipes_Generated_Rank_1: number;
    Recipes_Generated_Rank_2: number;
    Recipes_Generated_Rank_3: number;
    Recipes_Generated_Rank_4: number;
    Recipes_Generated_Rank_5: number;
  };
  Crew: {
    NpcCrew_TotalWages: number;
    NpcCrew_Hired: number;
    NpcCrew_Died?: number;
  };
  Multicrew: {
    Multicrew_Time_Total: number;
    Multicrew_Gunner_Time_Total: number;
    Multicrew_Fighter_Time_Total: number;
    Multicrew_Credits_Total: number;
    Multicrew_Fines_Total: number;
  };
  Material_Trader_Stats: {
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
  CQC: {
    CQC_Credits_Earned: number;
    CQC_Time_Played: number;
    CQC_KD: number;
    CQC_Kills: number;
    CQC_WL: number;
  };
}

export interface NpcCrewPaidWage extends EventBase {
  NpcCrewName: string;
  NpcCrewId: number;
  Amount: number;
}

export interface StatStationData {
  MarketID: number;
  StarSystem: string;
  StationName: string;
}

export interface ShipThing {
  ShipID: number;
  ShipType: string;
  ShipType_Localised?: string;
  Name?: string;
  Value: number;
  Hot: boolean;
}

export interface RemoteShip extends ShipThing {
  StarSystem?: string;
  ShipMarketID?: number;
  TransferTime?: number;
  InTransit?: true;
  TransferPrice?: number;
}

export interface StoredShips extends EventBase, StatStationData {
  ShipsHere: ShipThing[];
  ShipsRemote: RemoteShip[];
}

export interface StoredModules extends EventBase, StatStationData {
  Items: {
    Name: string;
    Name_Localised: string;
    StorageSlot: number;
    StarSystem?: string;
    MarketID?: number;
    TransferCost?: number;
    TransferTime?: number;
    BuyPrice: number;
    Hot: boolean;
    EngineerModifications?: string;
    Level?: number;
    Quality?: number;
    InTransit?: true;
  }[];
}

interface NoLock extends EventBase {
  TargetLocked: false;
}

interface ShipTargetedStage0Base extends EventBase {
  ScanStage: number;
  Ship: string;
  Ship_Localised?: string;
  TargetLocked: true;
}

export interface ShipTargetedStage0 extends ShipTargetedStage0Base {
  ScanStage: 0;
}

export type LegalStatus = 'Clean' | 'Wanted' | 'Lawless' | 'Unknown' | 'Enemy' | 'WantedEnemy';

interface ShipTargetedStage1Base extends ShipTargetedStage0Base {
  PilotName: string;
  PilotName_Localised: string;
  PilotRank: CombatRank;
}

export interface ShipTargetedStage1 extends ShipTargetedStage1Base {
  ScanStage: 1;
}

interface ShipTargetedStage2Base extends ShipTargetedStage1Base {
  ShieldHealth: number;
  HullHealth: number;
}

export interface ShipTargetedStage2 extends ShipTargetedStage2Base {
  ScanStage: 2;
}

interface ShipTargetedStage3Base extends ShipTargetedStage2Base {
  LegalStatus: LegalStatus;
  Bounty?: number;
  Faction?: string;
  Subsystem?: string;
  Subsystem_Localised?: string;
  SubsystemHealth?: number;
}

export interface ShipTargetedStage3 extends ShipTargetedStage3Base {
  ScanStage: 3;
}

export type ShipTargeted =
  | NoLock
  | ShipTargetedStage0
  | ShipTargetedStage1
  | ShipTargetedStage2
  | ShipTargetedStage3;

export interface Shutdown extends EventBase {}

export interface UnderAttack extends EventBase {
  Target: string;
}

export interface DiscoveryScan extends EventBase {
  SystemAddress: number;
  Bodies: number;
}

export interface BodyPromixity extends EventBase {
  StarSystem: string;
  SystemAddress: number;
  Body: string;
  BodyID: number;
}

export interface ApproachBody extends BodyPromixity {}

export interface LeaveBody extends BodyPromixity {}

export interface FighterRebuilt extends EventBase {
  Loadout: FighterLoadout;
}

export interface MaterialDefinition {
  Material: string;
  Material_Localised?: string;
  Category: string;
  Category_Localised: string;
}

export interface MaterialExchange extends MaterialDefinition {
  Quantity: number;
}

export interface MaterialTrade extends EventBase {
  MarketID: number;
  TraderType: 'encoded' | 'raw' | 'manufactured';
  Paid: MaterialExchange;
  Received: MaterialExchange;
}

export interface TechnologyBroker extends EventBase {
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

export interface MissionRedirected extends EventBase {
  MissionID: number;
  Name: string;
  NewDestinationStation: string;
  NewDestinationSystem: string;
  OldDestinationStation: string;
  OldDestinationSystem: string;
}

export interface PayBounties extends EventBase {
  Amount: number;
  Faction: string;
  Faction_Localised: string;
  ShipID: number;
  BrokerPercentage?: number;
}

export type DroneType = 'Recon' | 'Collection' | 'Prospector';

export interface LaunchDrone extends EventBase {
  Type: DroneType;
}

export interface SystemsShutdown extends EventBase {

}

export interface FighterDestroyed extends EventBase {

}

export interface NpcCrewRank extends EventBase {
  NpcCrewId: number;
  NpcCrewName: string;
  RankCombat: number;
}

export interface Powerplay extends EventBase {
  Power: string;
  Rank: number;
  Votes: number;
  Merits: number;
  TimePledged: number;
}

export interface PowerplayVoucher extends EventBase {
  Power: string;
  Systems: string[];
}

export interface CargoDepot extends EventBase {
  MissionID: number;
  UpdateType: 'Deliver';
  CargoType: string;
  Count: number;
  StartMarketID: number;
  EndMarketID: number;
  ItemsCollected: number;
  ItemsDelivered: number;
  TotalItemsToDeliver: number;
  Progress: number;
}

export interface NavBeaconScan extends EventBase {
  SystemAddress: number;
  NumBodies: number;
}

export interface EngineerContribution extends EventBase {
  Engineer: string;
  EngineerID: number;
  Type: string;
  Commodity: string;
  Quantity: number;
  TotalQuantity: number;
}

// Stat events

export interface Market extends EventBase, StatStationData {
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

export interface Shipyard extends EventBase, StatStationData {
  Horizons?: boolean;
  AllowCobraMkIV?: boolean;
  PriceList?: {
    id: number;
    ShipType: string;
    ShipType_Localised: string;
    ShipPrice: number;
  }[];
}

export interface Outfitting extends EventBase, StatStationData {
  Horizons?: boolean;
  Items?: {
    id: number;
    Name: string;
    BuyPrice: number;
  }[];
}

export interface ModulesInfo extends EventBase {
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

export interface Status extends EventBase {
  Flags: StatusFlags;
  Pips: [number, number, number];
  Firegroup: number;
  GuiFocus: GuiFocus;
  Latitude?: number;
  Longitude?: number;
  Altitude?: number;
  Heading?: number;
}

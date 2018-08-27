import { EventEmitter } from 'events';
import { FSWatcher, readFileSync, statSync, watch } from 'fs';
import { join } from 'path';
import { createInterface, ReadLine } from 'readline';
import { findLast } from '../util/findLast';
import { ContinuesReadStream } from './ContinousReadStream';
import { directory } from './directory';
import { EDEvent } from './EDEvent';
import { EDLogReader } from './EDLogReader';
import {
  AfmuRepairs,
  ApproachBody,
  ApproachSettlement,
  Bounty,
  BuyAmmo,
  BuyDrones,
  BuyExplorationData,
  BuyTradeData,
  CapShipBond,
  Cargo,
  ChangeCrewRole,
  ClearSavedGame,
  CockpitBreached,
  CollectCargo,
  Commander,
  CommitCrime,
  CommunityGoalDiscard,
  CommunityGoalJoin,
  CommunityGoalReward,
  CrewAssign,
  CrewHire,
  CrewLaunchFighter,
  CrewMemberJoins,
  CrewMemberQuits,
  CrewMemberRoleChange,
  DatalinkScan,
  DatalinkVoucher,
  DataScanned,
  Died,
  DiscoveryScan,
  Docked,
  DockFighter,
  DockingCancelled,
  DockingDenied,
  DockingGranted,
  DockingRequested,
  DockingTimeout,
  DockSRV,
  EjectCargo,
  EndCrewSession,
  EngineerApply,
  EngineerCraft,
  EngineerProgress,
  EscapeInterdiction,
  FactionKillBond,
  FetchRemoteModule,
  FighterDestroyed,
  FighterRebuilt,
  Fileheader,
  Friends,
  FSDJump,
  FuelScoop,
  HeatDamage,
  HeatWarning,
  HullDamage,
  Interdicted,
  Interdiction,
  JetConeBoost,
  JetConeDamage,
  JoinACrew,
  KickCrewMember,
  LaunchDrone,
  LaunchFighter,
  LaunchSRV,
  LeaveBody,
  Liftoff,
  LoadGame,
  Loadout,
  Location,
  LogFileSwap,
  Market,
  MarketBuy,
  MarketSell,
  MassModuleStore,
  MaterialCollected,
  MaterialDiscarded,
  MaterialDiscovered,
  Materials,
  MaterialTrade,
  MiningRefined,
  MissionAbandoned,
  MissionAccepted,
  MissionCompleted,
  MissionFailed,
  MissionRedirected,
  Missions,
  ModuleBuy,
  ModuleInfo,
  ModuleRetrieve,
  ModuleSell,
  ModuleSellRemote,
  ModulesInfo,
  ModuleStore,
  ModuleSwap,
  Music,
  NewCommander,
  NpcCrewPaidWage,
  NpcCrewRank,
  Outfitting,
  Passengers,
  PayBounties,
  PayFines,
  PayLegacyFines,
  PowerplayJoin,
  PowerplaySalary,
  Progress,
  Promotion,
  PVPKill,
  QuitACrew,
  Rank,
  RebootRepair,
  ReceiveText,
  RedeemVoucher,
  RefuelAll,
  RefuelPartial,
  Repair,
  RepairAll,
  RepairDrone,
  Reputation,
  RestockVehicle,
  Resurrect,
  Scan,
  Scanned,
  Screenshot,
  SelfDestruct,
  SellDrones,
  SellExplorationData,
  SendText,
  SetUserShipName,
  ShieldState,
  ShipTargeted,
  Shipyard,
  ShipyardBuy,
  ShipyardNew,
  ShipyardSell,
  ShipyardSwap,
  ShipyardTransfer,
  Shutdown,
  StartJump,
  Statistics,
  Status,
  StoredModules,
  StoredShips,
  SupercruiseEntry,
  SupercruiseExit,
  Synthesis,
  SystemsShutdown,
  TechnologyBroker,
  Touchdown,
  UnderAttack,
  Undocked,
  USSDrop,
  VehicleSwitch,
  WingAdd,
  WingInvite,
  WingJoin,
  WingLeave,
  Powerplay,
  PowerplayVoucher,
  CargoDepot,
  NavBeaconScan,
  EngineerContribution,
} from './events';

export interface BacklogOptions {
  /**
   * If true the method will return an array of event logs, otherwise empty.
   */
  process?: boolean;

  /**
   * If true the method will keep the backlog loaded.
   */
  store?: boolean;
}

export interface GameEvents {
  'event:ApproachSettlement': ApproachSettlement;
  'event:Bounty': Bounty;
  'event:BuyAmmo': BuyAmmo;
  'event:BuyDrones': BuyDrones;
  'event:BuyExplorationData': BuyExplorationData;
  'event:BuyTradeData': BuyTradeData;
  'event:CapShipBond': CapShipBond;
  'event:Cargo': Cargo;
  'event:ChangeCrewRole': ChangeCrewRole;
  'event:ClearSavedGame': ClearSavedGame;
  'event:CockpitBreached': CockpitBreached;
  'event:CollectCargo': CollectCargo;
  'event:CommitCrime': CommitCrime;
  'event:CommunityGoalDiscard': CommunityGoalDiscard;
  'event:CommunityGoalJoin': CommunityGoalJoin;
  'event:CommunityGoalReward': CommunityGoalReward;
  'event:CrewAssign': CrewAssign;
  'event:CrewHire': CrewHire;
  'event:CrewLaunchFighter': CrewLaunchFighter;
  'event:CrewMemberJoins': CrewMemberJoins;
  'event:CrewMemberQuits': CrewMemberQuits;
  'event:CrewMemberRoleChange': CrewMemberRoleChange;
  'event:DataScanned': DataScanned;
  'event:DatalinkScan': DatalinkScan;
  'event:DatalinkVoucher': DatalinkVoucher;
  'event:Died': Died;
  'event:DockFighter': DockFighter;
  'event:DockSRV': DockSRV;
  'event:Docked': Docked;
  'event:DockingCancelled': DockingCancelled;
  'event:DockingDenied': DockingDenied;
  'event:DockingGranted': DockingGranted;
  'event:DockingRequested': DockingRequested;
  'event:DockingTimeout': DockingTimeout;
  'event:EjectCargo': EjectCargo;
  'event:EndCrewSession': EndCrewSession;
  'event:EngineerApply': EngineerApply;
  'event:EngineerCraft': EngineerCraft;
  'event:EngineerProgress': EngineerProgress;
  'event:EscapeInterdiction': EscapeInterdiction;
  'event:FSDJump': FSDJump;
  'event:FactionKillBond': FactionKillBond;
  'event:FetchRemoteModule': FetchRemoteModule;
  'event:Fileheader': Fileheader;
  'event:Friends': Friends;
  'event:FuelScoop': FuelScoop;
  'event:HeatDamage': HeatDamage;
  'event:HeatWarning': HeatWarning;
  'event:HullDamage': HullDamage;
  'event:Interdicted': Interdicted;
  'event:Interdiction': Interdiction;
  'event:JetConeBoost': JetConeBoost;
  'event:JetConeDamage': JetConeDamage;
  'event:JoinACrew': JoinACrew;
  'event:KickCrewMember': KickCrewMember;
  'event:LaunchFighter': LaunchFighter;
  'event:LaunchSRV': LaunchSRV;
  'event:Liftoff': Liftoff;
  'event:LoadGame': LoadGame;
  'event:Loadout': Loadout;
  'event:Location': Location;
  'event:MarketBuy': MarketBuy;
  'event:MarketSell': MarketSell;
  'event:MassModuleStore': MassModuleStore;
  'event:MaterialCollected': MaterialCollected;
  'event:MaterialDiscarded': MaterialDiscarded;
  'event:MaterialDiscovered': MaterialDiscovered;
  'event:Materials': Materials;
  'event:MiningRefined': MiningRefined;
  'event:MissionAbandoned': MissionAbandoned;
  'event:MissionAccepted': MissionAccepted;
  'event:MissionCompleted': MissionCompleted;
  'event:MissionFailed': MissionFailed;
  'event:ModuleBuy': ModuleBuy;
  'event:ModuleRetrieve': ModuleRetrieve;
  'event:ModuleSell': ModuleSell;
  'event:ModuleSellRemote': ModuleSellRemote;
  'event:ModuleStore': ModuleStore;
  'event:ModuleSwap': ModuleSwap;
  'event:Music': Music;
  'event:NewCommander': NewCommander;
  'event:PVPKill': PVPKill;
  'event:Passengers': Passengers;
  'event:PayFines': PayFines;
  'event:PayLegacyFines': PayLegacyFines;
  'event:PowerplayJoin': PowerplayJoin;
  'event:PowerplaySalary': PowerplaySalary;
  'event:Progress': Progress;
  'event:Promotion': Promotion;
  'event:QuitACrew': QuitACrew;
  'event:Rank': Rank;
  'event:RebootRepair': RebootRepair;
  'event:ReceiveText': ReceiveText;
  'event:RedeemVoucher': RedeemVoucher;
  'event:RefuelAll': RefuelAll;
  'event:Repair': Repair;
  'event:RepairAll': RepairAll;
  'event:RestockVehicle': RestockVehicle;
  'event:Resurrect': Resurrect;
  'event:Scan': Scan;
  'event:Scanned': Scanned;
  'event:Screenshot': Screenshot;
  'event:SelfDestruct': SelfDestruct;
  'event:SellDrones': SellDrones;
  'event:SellExplorationData': SellExplorationData;
  'event:SendText': SendText;
  'event:SetUserShipName': SetUserShipName;
  'event:ShieldState': ShieldState;
  'event:ShipyardBuy': ShipyardBuy;
  'event:ShipyardNew': ShipyardNew;
  'event:ShipyardSell': ShipyardSell;
  'event:ShipyardSwap': ShipyardSwap;
  'event:ShipyardTransfer': ShipyardTransfer;
  'event:StartJump': StartJump;
  'event:SupercruiseEntry': SupercruiseEntry;
  'event:SupercruiseExit': SupercruiseExit;
  'event:Synthesis': Synthesis;
  'event:Touchdown': Touchdown;
  'event:USSDrop': USSDrop;
  'event:ModuleInfo': ModuleInfo;
  'event:Undocked': Undocked;
  'event:VehicleSwitch': VehicleSwitch;
  'event:WingAdd': WingAdd;
  'event:WingInvite': WingInvite;
  'event:WingJoin': WingJoin;
  'event:WingLeave': WingLeave;
  'event:RefuelPartial': RefuelPartial;
  'event:AfmuRepairs': AfmuRepairs;
  'event:RepairDrone': RepairDrone;
  'event:Missions': Missions;
  'event:Commander': Commander;
  'event:Reputation': Reputation;
  'event:Statistics': Statistics;
  'event:NpcCrewPaidWage': NpcCrewPaidWage;
  'event:StoredShips': StoredShips;
  'event:StoredModules': StoredModules;
  'event:ShipTargeted': ShipTargeted;
  'event:Shutdown': Shutdown;
  'event:UnderAttack': UnderAttack;
  'event:DiscoveryScan': DiscoveryScan;
  'event:ApproachBody': ApproachBody;
  'event:FighterRebuilt': FighterRebuilt;
  'event:LeaveBody': LeaveBody;
  'event:TechnologyBroker': TechnologyBroker;
  'event:MaterialTrade': MaterialTrade;
  'event:MissionRedirected': MissionRedirected;
  'event:PayBounties': PayBounties;
  'event:LaunchDrone': LaunchDrone;
  'event:SystemsShutdown': SystemsShutdown;
  'event:FighterDestroyed': FighterDestroyed;
  'event:NpcCrewRank': NpcCrewRank;
  'event:Powerplay': Powerplay;
  'event:PowerplayVoucher': PowerplayVoucher;
  'event:CargoDepot': CargoDepot;
  'event:NavBeaconScan': NavBeaconScan;
  'event:EngineerContribution': EngineerContribution;
  // stuff
  'event:Market': Market;
  'event:Shipyard': Shipyard;
  'event:Outfitting': Outfitting;
  'event:ModulesInfo': ModulesInfo;
  'event:Status': Status;
}

export type Events = {
  // Unscoped
  event: EDEvent;
  file: LogFileSwap;
  warn: Error;
  error: Error;
} & GameEvents;

export interface EDLog {
  on<K extends keyof Events>(event: K, cb: (event: Events[K]) => void): this;
  once<K extends keyof Events>(event: K, cb: (event: Events[K]) => void): this;
  listenerCount<K extends keyof Events>(event: K): number;
  emit<K extends keyof Events>(event: K, value: Events[K]): boolean;
}

export class EDLog extends EventEmitter {
  private fileStream?: ContinuesReadStream;
  private fileName?: string;
  private lineStream?: ReadLine;
  private backlog?: EDEvent[];
  private logReader = new EDLogReader();
  private watcher?: FSWatcher;
  private watchers: FSWatcher[] = [];

  /**
   * Launches the log reader.
   *
   * @param backlog Optional configuration settings.
   */
  public start(backlog: BacklogOptions = {}): EDEvent[] {
    const dir = directory();
    this.watcher = watch(dir, (eventType, fileName) => {
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

    const files = this.logReader.fetchFiles(dir);

    let bl: EDEvent[] = [];
    if (backlog.process) {
      bl = this.logReader.read(dir).map(raw => new EDEvent(raw));
    }

    this.listenToFile(files[files.length - 1], true);

    for (const m of ['Market', 'Shipyard', 'Outfitting', 'ModulesInfo', 'Status']) {
      this.makeWatcher(m);
    }
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
    return <GameEvents[K]>this.backlog.filter(ev => ev.event === realEvent);
  }

  /**
   * Ends the log reader.
   */
  public end(): void {
    delete this.fileName;
    if (this.fileStream) {
      this.fileStream.close();
    }
    if (this.lineStream) {
      this.lineStream.close();
    }
    if (this.watcher) {
      this.watcher.close();
    }
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.removeAllListeners();
  }

  private emitEvent(event: EDEvent) {
    this.emit('event', event);
    this.emit(<keyof Events>`event:${event.event}`, event);
    if (this.backlog) {
      this.backlog.push(event);
    }
  }

  private emitFileEvent(path: string): void {
    this.emitEvent(new EDEvent(JSON.parse(readFileSync(path, 'utf8'))));
  }

  private makeWatcher(file: string) {
    const fullFile = join(directory(), `${file}.json`);
    this.watchers.push(
      watch(fullFile, event => {
        if (event !== 'change' || statSync(fullFile).size === 0) {
          return;
        }
        this.emitFileEvent(fullFile);
      }),
    );
    setImmediate(() => {
      this.emitFileEvent(fullFile);
    });
  }

  private listenToFile(file: string, skip = false) {
    file = join(directory(), file);
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
}

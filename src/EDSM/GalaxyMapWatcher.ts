import { EventEmitter } from 'events';
import { findMin } from '../util/findMin';
import { Client, CommanderMapEntry, CommandMapPage, Coordinate } from './Client';

export interface Options {
  delay: number;
  cycleDelay: number;
  additionalDelay?: number;
}

export interface Move {
  lastPosition: Coordinate;
  entry: CommanderMapEntry;
}

export interface Page {
  pageNo: number;
  page: CommandMapPage;
}

export interface MapEvents {
  registered: CommanderMapEntry;
  moved: Move;
  page: Page;
  error: Error;
  cycle: number;
}

export interface GalaxyMapWatcher {
  once<K extends keyof MapEvents>(event: K, cb: (event: MapEvents[K]) => void): this;
  on<K extends keyof MapEvents>(event: K, cb: (event: MapEvents[K]) => void): this;
  emit<K extends keyof MapEvents>(event: K, value: MapEvents[K]): boolean;
}

export class GalaxyMapWatcher extends EventEmitter {
  private timer?: NodeJS.Timer;
  private lastPage = 0;
  private registry: {
    [key: string]: CommanderMapEntry;
  } = {};
  private fetchCycle = 0;
  constructor(private client: Client, private options: Options) {
    super();
  }

  public start() {
    if (this.timer) {
      throw new Error('Already started');
    }
    // tslint:disable-next-line no-floating-promises
    this.next();
  }

  public isRunning() {
    return !!this.timer;
  }

  public stop() {
    if (!this.timer) {
      throw new Error('Not started');
    }
    clearTimeout(this.timer);
    delete this.timer;
  }

  public getRegistry(): {
    readonly [key: string]: Readonly<CommanderMapEntry>;
  } {
    return this.registry;
  }

  public findClosest(loc: Coordinate): [CommanderMapEntry, number] | void {
    const [closest, distanceSqrt] = findMin(this.registry, ({ coordinates }) =>
      this.sqrtLocDistance(coordinates, loc),
    );
    if (!closest) {
      return undefined;
    }
    return [closest, Math.sqrt(distanceSqrt)];
  }

  public findInSphere(loc: Coordinate, radius: number): [CommanderMapEntry, number][] {
    const rSqrt = radius ** 2;
    const ret: [CommanderMapEntry, number][] = [];
    for (const entry of Object.values(this.registry)) {
      const sqrtDist = this.sqrtLocDistance(entry.coordinates, loc);
      if (sqrtDist <= rSqrt) {
        ret.push([entry, Math.sqrt(sqrtDist)]);
      }
    }
    return ret;
  }

  public async findClosestAutoComplete(
    loc: Coordinate,
  ): Promise<[CommanderMapEntry, number] | undefined> {
    const res = this.findClosest(loc);
    if (!res) {
      return undefined;
    }
    const [closest] = res;
    if (!closest) {
      return undefined;
    }
    if (closest.systemName) {
      return res;
    }
    const name = await this.client.locationToSystem(closest.coordinates);
    if (!name) {
      return res;
    }
    closest.systemName = name;
    return res;
  }

  public hasCycled(): boolean {
    return this.fetchCycle > 0;
  }

  private comparePosition(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
  }

  private async next() {
    try {
      const data = await this.client.getCommanderMapPage(this.lastPage + 1);
      this.emit('page', {
        page: data,
        pageNo: this.lastPage,
      });
      data.items.forEach(entry => {
        const reg = this.registry[entry.user];
        if (!reg) {
          this.registry[entry.user] = entry;
          this.emit('registered', entry);
          return;
        }
        this.registry[entry.user] = entry;
        if (!this.comparePosition(entry.coordinates, reg.coordinates)) {
          this.emit('moved', {
            entry,
            lastPosition: reg.coordinates,
          });
        }
      });
      if (this.lastPage >= data.maxPage) {
        this.lastPage = 0;
        this.fetchCycle++;
        this.emit('cycle', this.fetchCycle);
      } else {
        this.lastPage++;
      }
    } catch (err) {
      this.emit('error', err);
    } finally {
      const baseDelay = (this.fetchCycle > 0 ? this.options.additionalDelay || this.options.delay : 0);
      const cycleDelay = this.lastPage === 0 ? this.options.cycleDelay : 0;
      this.timer = setTimeout(() => {
        // tslint:disable-next-line no-floating-promises
        this.next();
      }, baseDelay + cycleDelay);
    }
  }

  private sqrtLocDistance(coordinates: Coordinate, cooordinate2: Coordinate): number {
    return (
      (coordinates.x - cooordinate2.x) ** 2 +
      (coordinates.y - cooordinate2.y) ** 2 +
      (coordinates.z - cooordinate2.z) ** 2
    );
  }
}

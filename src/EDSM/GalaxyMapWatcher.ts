import { Client, ICommandMapPage, ICommanderMapEntry, ICoordinate } from './Client';
import { EventEmitter } from 'events';
import { findMin } from '../util/findMin';


export interface IOptions {
    delay: number;
    cycleDelay: number;
    additionalDelay?: number;
}

export interface IMove {
    lastPosition: ICoordinate;
    entry: ICommanderMapEntry;
}

export interface IPage {
    pageNo: number;
    page: ICommandMapPage;
}

export type Events = {
    registered: ICommanderMapEntry,
    moved: IMove,
    page: IPage,
    error: Error,
    cycle: number,
}

export class GalaxyMapWatcher extends EventEmitter {
    private timer: NodeJS.Timer;
    private lastPage = 0;
    private registry: {
        [key: string]: ICommanderMapEntry;
    } = {};
    private fetchCycle = 0;
    constructor (private client: Client, private options: IOptions) {
        super();
    }

    private comparePosition (a: ICoordinate, b: ICoordinate): boolean {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

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

    private next() {
        this.client.getCommanderMapPage(this.lastPage + 1)
        .then(data => {
            this.emit('page', {
                pageNo: this.lastPage,
                page: data,
            });
            data.items.forEach(entry => {
                const reg = this.registry[entry.user];
                if (!reg) {
                    this.registry[entry.user] = entry;
                    this.emit('registered', entry);
                    return;
                } else {
                    this.registry[entry.user] = entry;
                }
                if (!this.comparePosition(entry.coordinates, reg.coordinates)) {
                    this.emit('moved', {
                        lastPosition: reg.coordinates,
                        entry,
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
        })
        .catch((err: Error) => this.emit('error', err))
        .then(() => {
            const baseDelay = this.options.delay + (this.fetchCycle > 0 ? this.options.additionalDelay || this.options.delay : 0);
            const cycleDelay = this.lastPage === 0 ? this.options.cycleDelay : 0;
            this.timer = setTimeout(() => this.next(), baseDelay + cycleDelay);
        });
    }

    public start () {
        if (this.timer) {
            throw new Error('Already started');
        }
        this.next();
    }

    public isRunning () {
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
        readonly [key: string]: Readonly<ICommanderMapEntry>;
    } {
        return this.registry;
    }

    private sqrtLocDistance (coordinates: ICoordinate, cooordinate2: ICoordinate): number {
        return (coordinates.x - cooordinate2.x) ** 2 + (coordinates.y - cooordinate2.y) ** 2 + (coordinates.z - cooordinate2.z) ** 2
    }

    public findClosest(loc: ICoordinate): [ICommanderMapEntry, number] {
        const [closest, distanceSqrt] = findMin(this.registry, ({ coordinates }) => this.sqrtLocDistance(coordinates, loc));
        if (!closest) {
            return undefined;
        }
        return [closest, Math.sqrt(distanceSqrt)];
    }

    public findInSphere(loc: ICoordinate, radius: number): [ICommanderMapEntry, number][] {
        const rSqrt = radius ** 2;
        const ret: [ICommanderMapEntry, number][] = [];
        for (const key in this.registry) {
            const entry = this.registry[key];
            const sqrtDist = this.sqrtLocDistance(entry.coordinates, loc)
            if (sqrtDist <= rSqrt) {
                ret.push([entry, Math.sqrt(sqrtDist)]);
            }
        }
        return ret;
    }

    public findClosestAutoComplete (loc: ICoordinate): Promise<[ICommanderMapEntry, number]> {
        const res = this.findClosest(loc);
        const [closest] = res;
        if (!closest) {
            return Promise.reject(undefined);
        }
        if (closest.systemName) {
            return Promise.resolve(res);
        }
        return this.client.locationToSystem(closest.coordinates)
        .then(name => {
            if (!name) {
                return res;
            }
            closest.systemName = name;
            return res;
        });
    }

    public hasCycled (): boolean {
        return this.fetchCycle > 0;
    }
}

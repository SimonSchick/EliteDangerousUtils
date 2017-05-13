import { HTTPClient, Options } from '../util/HTTPClient';
import { EDPosition } from '../EDLog/locations';

export interface ICoordinate {
    x: number;
    y: number;
    z: number;
}

export interface ICommandMapPage {
    maxItems: number;
    maxPage: number;
    items: ICommanderMapEntry[];
}

export interface ICommanderMapEntry {
    user: string;
    coordinates: ICoordinate;
    cmdrUrl: string;
    cmdrName: string;
    systemName: string;
}

/**
 * @see {@link https://www.edsm.net/en/api}
 */
export interface ISystemsQuery {
    /**
     * Query origin coordinates
     */
    position: ICoordinate;
    /**
     * Query size of search selector.
     */
    size: number;
    /**
     * Query origin system.
     */
    systemName?: string;
}

export interface IRawSystemQuery {
    systemName?: string;
    x?: number | string;
    y?: number | string;
    z?: number | string;
    size?: number;
}

export interface ISystemQueryResponse {
    name: string;
}

export class Client {
    public static convertEDSMToEDVector (coord: ICoordinate): EDPosition {
        return [coord.x, coord.y, coord.z];
    }

    constructor (private httpClient: HTTPClient, private apiKey?: string) {

    }

    private request<T>(opts: Options) {
        opts.uri = `https://www.edsm.net${opts.uri}`;
        opts.json = true;
        if (this.apiKey) {
            if (!opts.qs) {
                opts.qs = {};
            }
            opts.qs.apiKey = this.apiKey;
        }
        return this.httpClient.request<T>(opts);
    }

    public getCommanderMapPage(page: number, language = 'en'): Promise<ICommandMapPage> {
        return this.request<ICommandMapPage>({
            uri: `/${language}/map/users/live/p/${page}`,
            headers: {
                'x-requested-with': 'XMLHttpRequest',
            }
        })
        .then(r => r.body);
    }

    private getCommanderMapInternal(language: string, currentPage: number = 1, data: ICommanderMapEntry[] = []): Promise<ICommanderMapEntry[]> {
        return this.getCommanderMapPage(0, language)
        .then(res => {
            if (res.maxPage === currentPage) {
                return data.concat(res.items);
            }
            return this.getCommanderMapInternal(language, currentPage + 1, data);
        });
    }

    public getCommanderMap(language = 'en'): Promise<ICommanderMapEntry[]> {
        return this.getCommanderMapInternal(language)
    }

    private buildSystemQuery (query: ISystemsQuery): IRawSystemQuery {
        const { systemName, position, size } = query;
        if (!systemName && !position) {
            throw new Error('systemName or position is required');
        }
        if (systemName && position) {
            throw new Error('systemName and position are exclusive');
        }
        const ret: IRawSystemQuery = {
            size,
        };
        if (systemName) {
            ret.systemName = systemName;
        }
        if (position) {
            ret.x = position.x.toFixed(1);
            ret.y = position.y.toFixed(1);
            ret.z = position.z.toFixed(1);
        }
        return ret;
    }

    public getSystemsInCube (query: ISystemsQuery): Promise<ISystemQueryResponse[]> {
        return this.request<ISystemQueryResponse[]>({
            uri: '/api-v1/cube-systems',
            qs: this.buildSystemQuery(query),
        })
        .then(r => r.body);
    }

    public locationToSystem (position: ICoordinate): Promise<string> {
        return this.getSystemsInCube({
            position,
            size: 2,
        })
        .then(([r]) => r && r.name);
    }
}

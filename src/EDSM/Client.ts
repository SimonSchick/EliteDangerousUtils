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
}

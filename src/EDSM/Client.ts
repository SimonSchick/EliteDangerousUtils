import { EDPosition } from '../EDLog/locations';
import { HTTPClient, Options, Response } from '../util/HTTPClient';

export interface Coordinate {
  x: number;
  y: number;
  z: number;
}

export interface CommandMapPage {
  maxItems: number;
  maxPage: number;
  items: CommanderMapEntry[];
}

export interface CommanderMapEntry {
  user: string;
  coordinates: Coordinate;
  cmdrUrl?: string;
  cmdrName?: string;
  systemName?: string;
}

/**
 * @see {@link https://www.edsm.net/en/api}
 */
export interface SystemsQuery {
  /**
   * Query origin coordinates
   */
  position: Coordinate;
  /**
   * Query size of search selector.
   */
  size: number;
  /**
   * Query origin system.
   */
  systemName?: string;
}

export interface RawSystemQuery {
  systemName?: string;
  x?: number | string;
  y?: number | string;
  z?: number | string;
  size?: number;
}

export interface SystemQueryResponse {
  name: string;
}

export class Client {
  public static convertEDSMToEDVector(coord: Coordinate): EDPosition {
    return [coord.x, coord.y, coord.z];
  }

  constructor(private httpClient: HTTPClient, private apiKey?: string) {}

  public async getSystemsInCube(query: SystemsQuery): Promise<SystemQueryResponse[]> {
    return (await this.request<SystemQueryResponse[]>({
      qs: this.buildSystemQuery(query),
      uri: '/api-v1/cube-systems',
    })).body;
  }

  public async locationToSystem(position: Coordinate): Promise<string> {
    const [r] = await this.getSystemsInCube({
      position,
      size: 2,
    });
    return r && r.name;
  }

  public async getCommanderMapPage(page: number, language = 'en'): Promise<CommandMapPage> {
    return (await this.request<CommandMapPage>({
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
      uri: `/${language}/map/users/live/p/${page}`,
    })).body;
  }

  public async getCommanderMap(language = 'en'): Promise<CommanderMapEntry[]> {
    return this.getCommanderMapInternal(language);
  }

  private async getCommanderMapInternal(
    language: string,
    currentPage = 1,
    data: CommanderMapEntry[] = [],
  ): Promise<CommanderMapEntry[]> {
    const res = await this.getCommanderMapPage(0, language);
    if (res.maxPage === currentPage) {
      return data.concat(res.items);
    }
    return this.getCommanderMapInternal(language, currentPage + 1, data);
  }

  private async request<T>(opts: Options): Promise<Response<T>> {
    opts.uri = `https://www.edsm.net${opts.uri}`;
    opts.json = true;
    opts.headers = opts.headers || {};
    opts.headers.referer = 'https://www.edsm.net/en/map/users';
    opts.headers['x-requested-with'] = 'XMLHttpRequest';
    if (this.apiKey) {
      if (!opts.qs) {
        opts.qs = {};
      }
      opts.qs.apiKey = this.apiKey;
    }
    return this.httpClient.request<T>(opts);
  }

  private buildSystemQuery(query: SystemsQuery): RawSystemQuery {
    const { systemName, position, size } = query;
    if (!systemName && !position) {
      throw new Error('systemName or position is required');
    }
    if (systemName && position) {
      throw new Error('systemName and position are exclusive');
    }
    const ret: RawSystemQuery = {
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
}

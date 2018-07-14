import { MandatorySlots, OptionalSlots } from './common';
import { HTTPClient, Options, Response } from './util/HTTPClient';

export interface Commander {
  id: number;
  name: string;
  credits: number;
  debt: number;
  currentShipId: number;
  alive: boolean;
  docked: false;
  rank: {
    combat: number;
    trade: number;
    explore: number;
    crime: number;
    service: number;
    empire: number;
    federation: number;
    power: number;
    cqc: number;
  };
}

export interface APISystemInfo {
  id: number;
  name: string;
  faction: string;
}

export interface APIModule {
  id: number;
  category: 'module' | 'bobblehead' | 'paintjob' | 'shipkit' | 'decal';
  name: string;
  cost: number;
}

export interface APICommodity {
  id: number;
  name: string;
  cost_min: string;
  cost_max: number;
  cost_mean: string;
  homebuy: string;
  homesell: string;
  consumebuy: string;
  baseCreationQty: number;
  baseConsumptionQty: number;
  capacity: number;
  buyPrice: number;
  sellPrice: number;
  meanPrice: number;
  demandBracket: number;
  stockBracket: number;
  creationQty: number;
  consumptionQty: number;
  targetStock: number;
  stock: number;
  demand: number;
  rare_min_stock: string;
  rare_max_stock: string;
  market_id?: any;
  parent_id?: any;
  statusFlags: any[];
  categoryname: string;
  volumescale: string;
  sec_illegal_min: string;
  sec_illegal_max: string;
  stolenmod: string;
}

export interface StartPortInfo extends APISystemInfo {
  modules: { [index: number]: APIModule };
  commodities: APICommodity[];
}

export interface APIShipModule {
  id: number;
  name: string;
  value: number;
  unloaded: number;
  free: boolean;
  health: number;
  on: boolean;
  priority: number;
  ammo?: {
    clip: number;
    hopper: number;
  };
  recipeValue?: number;
  recipeName?: string;
  recipeLevel?: number;
  recipeVersion?: number;
  modifiers?: {
    id: number;
    engineerID: number;
    recipeID: number;
    slotIndex: number;
    moduleTags: number[];
    modifiers: {
      name: string;
      value: number;
      type: number;
    }[];
  };
}

export interface CargoItem {
  commodity: string;
  origin?: number; // TODO: Probably starport ID?
  powerplayOrigin?: number;
  masq?: any; // TODO
  owner?: number; // TODO: Is this the player id? :D
  mission?: number;
  qty: number;
  value: number;
  xyz: {
    x: number;
    y: number;
    z: number;
  };
  marked: number; // TODO: bitflag?
}

export interface APIShip {
  name: string;
  modules: { [name in OptionalSlots]?: APIShipModule } &
    { [name in MandatorySlots]: APIShipModule };
  value: {
    hull: number;
    modules: number;
    cargo: number;
    total: number;
    unloaned: number;
  };
  free: boolean;
  health: {
    hull: number;
    shield: number;
    shieldup: boolean;
    integrity: number;
    paintwork: number;
  };
  cockpitBreached: boolean;
  oxygenRemaining: number;
  fuel: {
    main: {
      level: number;
      capacity: number;
    };
    reserve: {
      level: number;
      capacity: number;
    };
    superchargedFSD: number;
  };
  cargo: {
    capacity: number;
    qty: number;
    items: any[]; // TODO
    lock: number;
    ts: {
      sec: number;
      usec: number;
    };
  };
  tag?: string; // ???
  passengers: any[]; // TODO
  refinery: any; // TODO
  id: number;
}

export interface APIRemoteShip extends APIShip {
  station: {
    id: number;
    name: string;
  };
  starsystem: {
    id: number;
    name: string;
    systemaddress: string;
  };
}

export interface APIResponseRoot {
  commander: Commander;
  lastSystem: APISystemInfo;
  lastStarport: StartPortInfo;
  ship: APIShip;
  /** Contains all ships the player owns, all ships except the one being used are IAPIRemoteShip types. */
  ships: { [index: number]: APIShip | APIRemoteShip };
}

export interface CredentialsFetcher {
  getCode(): string | Promise<string>;
  getLogin(): Credentials | Promise<Credentials>;
}

export interface Cookie {
  key: string;
  value: string;
  domain: string;
  path: string;
  hostOnly: string;
  creation: string;
  lastAccessed: string;
  secure?: boolean;
}

export interface CookieStore {
  findCookie(
    domain: string,
    path: string,
    key: string,
    cb: (error?: Error, data?: Cookie) => void,
  ): void;
  findCookies(domain: string, path: string, cb: (error?: Error, data?: Cookie[]) => void): void;
  putCookie(cookie: Cookie, cb: (error?: Error) => void): void;
  updateCookie(cookie: Cookie, newCookie: Cookie, cb: (error?: Error) => void): void;
  removeCookie(domain: string, path: string, key: string, cb: (error?: Error) => void): void;
  removeCookies(domain: string, path: string, cb: (error?: Error) => void): void;
}

export class InvalidCredentialsError extends Error {
  constructor(public resp: Response<any>) {
    super('Invalid credentials');
  }
}

export class VerificationError extends Error {
  constructor(public resp: Response<any>) {
    super('Invalid verification code');
  }
}

export interface Credentials {
  email: string;
  password: string;
}

/**
 * HTTP Status codes.
 */
const enum HTTPStatus {
  MovedPermanently = 302,
}

/**
 * Client for the Elite: Dangerous Companion App API
 */
export class EDCompanionAPI {
  private apiURL = 'https://companion.orerve.net/';
  private requestOptions: Partial<Options> = {
    followRedirect: false,
    headers: {
      'User-Agent':
        // tslint:disable-next-line:max-line-length
        'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B411',
    },
  };
  /**
   * @param A cookie store used to avoid login in repetetly.
   * @param Asyncronously provides credentials.
   */
  constructor(
    private httpRequest: HTTPClient,
    jar: CookieStore,
    private credentialFetcher: CredentialsFetcher,
  ) {
    this.requestOptions.jar = <any>jar;
  }

  /**
   * Fetches all data from /profile.
   * This may invoke the `ICredentialsFetcher`s `getLogin` and `getCode` if no cookie is provided.
   */
  public async getProfile(): Promise<APIResponseRoot> {
    const response = await this.request<APIResponseRoot>({
      json: true,
      uri: 'profile',
    });
    if (
      response.statusCode === HTTPStatus.MovedPermanently &&
      response.headers.location === '/user/login'
    ) {
      await this.login();
      return this.getProfile();
    }
    return response.body;
  }

  /**
   * Helper method to run a request on the API.
   */
  private async request<T>(opts: Options): Promise<Response<T>> {
    opts.uri = `${this.apiURL}${opts.uri}`;
    Object.assign(opts, this.requestOptions);
    return this.httpRequest.request<T>(opts);
  }

  /**
   * Handles the confirm code confirmation.
   * Rejects if code is invalid.
   */
  private async confirm() {
    const code = await this.credentialFetcher.getCode();
    const response = await this.request<string>({
      form: {
        code,
      },
      method: 'post',
      uri: 'user/confirm',
    });
    if (response.statusCode === HTTPStatus.MovedPermanently && response.headers.location === '/') {
      return response;
    }

    if (response.body.includes('errorSummary')) {
      throw new VerificationError(response);
    }

    return response;
  }

  /**
   * Runs the login, eventually falls back to confirm.
   * Rejects if invalid credentials are used.
   */
  private async login(): Promise<void> {
    const credentials = this.credentialFetcher.getLogin();
    const response = await this.request({
      form: credentials,
      method: 'post',
      uri: 'user/login',
    });
    if (response.headers.location === '/user/confirm') {
      await this.confirm();
    }
    throw new InvalidCredentialsError(response);
  }
}

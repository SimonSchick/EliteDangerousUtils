import * as request from 'request';

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
    }
}

export interface IAPISystemInfo {
    id: number;
    name: string;
    faction: string;
}

export interface IAPIModule {
    id: number;
    category: 'module' | 'bobblehead' | 'paintjob' | 'shipkit' | 'decal';
    name: string;
    cost: number;
}

export interface IStartPortInfo extends IAPISystemInfo {
    modules: { [index: number]: IAPIModule }
}

export interface IAPIModule {
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
    }
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
    }
}

export interface IAPIShip {
    name: string;
    modules: { [name: string]: IAPIModule };
    value: {
        hull: number;
        modules: number;
        cargo: number;
        total: number;
        unloaned: number;
    }
    free: boolean;
    health: {
        hull: number;
        shield: number;
        shieldup: boolean;
        integrity: number;
        paintwork: number;
    }
    cockpitBreached: boolean;
    oxygenRemaining: number;
    fuel: {
        main: {
            level: number;
            capacity: number;
        },
        reserve: {
            level: number;
            capacity: number;
        },
        superchargedFSD: number;
    }
    cargo: {
        capacity: number;
        qty: number;
        items: any[]; // TODO
        lock: number;
        ts: {
            sec: number;
            usec: number;
        }
    }
    tag?: string; // ???
    passengers: any[]; // TODO
    refinery: any; // TODO
    id: number;
}

export interface IAPIRemoteShip extends IAPIShip {
    station: {
        id: number;
        name: string;
    }
    starsystem: {
        id: number;
        name: string;
        systemaddress: string;
    }
}

export interface IAPIResponseRoot {
    commander: Commander;
    lastSystem: IAPISystemInfo;
    lastStarport: IStartPortInfo;
    ship: IAPIShip;
    /** Contains all ships the player owns, all ships except the one being used are IAPIRemoteShip types. */
    ships: { [index: number]: IAPIShip | IAPIRemoteShip }
}

export interface ICredentialsFetcher {
    getCode(): string | Promise<string>;
    getLogin(): ICredentials | Promise<ICredentials>;
}

export interface ICookie {
    key: string;
    value: string;
    domain: string;
    path: string;
    hostOnly: string;
    creation: string;
    lastAccessed: string;
    secure?: boolean;
}

export interface ICookieStore {
    findCookie(domain: string, path: string, key: string, cb: (error: Error, data?: ICookie) => void): void;
    findCookies(domain: string, path: string, cb: (error: Error, data?: ICookie[]) => void): void;
    putCookie(domain: string, cb: (error?: Error) => void): void;
    updateCookie(domain: string, cb: (error?: Error) => void): void;
    removeCookie(domain: string, path: string, key: string, cb: (error?: Error) => void): void;
    removeCookies(domain: string, path: string, cb: (error?: Error) => void): void;
}

export class InvalidCredentialsError extends Error {
    constructor (public resp: request.RequestResponse) {
        super('Invalid credentials');
    }
}

export class VerificationError extends Error {
    constructor (public resp: request.RequestResponse) {
        super('Invalid verification code');
    }
}

export interface ICredentials {
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
    private requestOptions: Partial<request.CoreOptions> = {
        followRedirect: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B411',
        },
    };
    /**
     * @param A cookie store used to avoid login in repetetly.
     * @param Asyncronously provides credentials.
     */
    constructor (jar: ICookieStore | string, private credentialFetcher: ICredentialsFetcher) {
        this.requestOptions.jar = (<any>request.jar)(jar);
    }

    /**
     * Helper method to run a request on the API.
     */
    private request<T>(opts: (request.CoreOptions & request.UriOptions)): Promise<request.RequestResponse & { body: T }> {
        return new Promise((resolve, reject) => {
            opts.uri = `${this.apiURL}${opts.uri}`;
            request(Object.assign(opts, this.requestOptions), (error, response) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    /**
     * Fetches all data from /profile.
     * This may invoke the `ICredentialsFetcher`s `getLogin` and `getCode` if no cookie is provided.
     */
    public getProfile (): Promise<IAPIResponseRoot> {
        return this.request<IAPIResponseRoot>({
            uri: 'profile',
            json: true,
        })
        .then(response => {
            if (response.statusCode === HTTPStatus.MovedPermanently && response.headers.location === '/user/login') {
                return this.login()
                .then(() => this.getProfile());
            }
            return response.body;
        })
    }

    /**
     * Handles the confirm code confirmation.
     * Rejects if code is invalid.
     */
    private confirm () {
        return Promise.resolve(this.credentialFetcher.getCode())
        .then(code => {
            return this.request<string>({
                uri: 'user/confirm',
                method: 'post',
                form: {
                    code,
                }
            })
            .then(response => {
                if (response.statusCode === HTTPStatus.MovedPermanently && response.headers.location === '/') {
                    return response;
                }

                if(response.body.includes('errorSummary')) {
                    throw new VerificationError(response);
                }

                return response;
            })
        })
        .then(() => undefined)
    }

    /**
     * Runs the login, eventually falls back to confirm.
     * Rejects if invalid credentials are used.
     */
    private login (): Promise<void> {
        return Promise.resolve(this.credentialFetcher.getLogin())
        .then(credentials =>
            this.request({
                uri: 'user/login',
                method: 'post',
                form: credentials,
            })
        )
        .then(response => {
            if (response.headers.location === '/user/confirm') {
                return this.confirm();
            }
            throw new InvalidCredentialsError(response);
        })
        .then(() => undefined);
    }
}

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

const enum HTTPStatus {
    Ok = 200,
    NoContent = 204,
    MovedPermanently = 302,
}

export class EDCompanionAPI {
    private apiURL = 'https://companion.orerve.net/';
    private requestOptions: Partial<request.CoreOptions> = {
        followRedirect: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B411',
        },
    };
    constructor (jar: ICookieStore | string, private credentialFetcher: ICredentialsFetcher) {
        this.requestOptions.jar = (<any>request.jar)(jar);
        this.requestOptions.jar
    }

    private fetchCode (): Promise<string> {
        return Promise.resolve(this.credentialFetcher.getCode());
    }

    private request<T>(opts: (request.CoreOptions & request.UriOptions)): Promise<request.RequestResponse & { body: T }> {
        console.log(opts);
        return new Promise((resolve, reject) => {
            request(Object.assign(opts, this.requestOptions), (error, response) => {
                console.log(response.statusCode, response.headers, (<any>response).body);
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
                return;
            })
        });
    }

    public getProfile (): Promise<IAPIResponseRoot> {
        return this.request<IAPIResponseRoot>({
            uri: this.apiURL + 'profile',
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

    private confirm () {
        return this.fetchCode()
        .then(code => {
            return this.request<string>({
                uri: this.apiURL + 'user/confirm',
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

    private login (): Promise<void> {
        return Promise.resolve(this.credentialFetcher.getLogin())
        .then(credentials =>
            this.request({
                uri: this.apiURL + 'user/login',
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

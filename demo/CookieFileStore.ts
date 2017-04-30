import { ICookie, ICookieStore } from '../src/EDCompanionAPI';
import { readFile, writeFile } from 'fs';

export interface ICookieStorage {
    [domain: string]: {
        [path: string]: {
            [key: string]: ICookie;
        }
    }
}

export class CookieFileStore implements ICookieStore {
    private data: ICookieStorage;
    public synchronous = true;
    constructor (private fileName: string, private forceReadOnAccess: boolean = false) {
    }

    private loadData (cb: (err: Error) => void) {
        if (this.data && !this.forceReadOnAccess) {
            return cb(null);
        }

        readFile(this.fileName, 'utf8', (error, data) => {
            if (error) {
                return cb(error);
            }
            try {
                this.data = JSON.parse(data);
                cb(null);
            } catch (error) {
                cb(error);
            }
        });
    }

    private saveData (cb: (err: Error) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            writeFile(this.fileName, JSON.stringify(this.data), cb);
        });
    }

    public findCookie (domain: string, path: string, key: string, cb: (err: Error, cookie?: ICookie) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            if (!this.data[domain]) {
                return cb(null, null);
            }
            if (!this.data[domain][path]) {
                return cb(null, null);
            }
            cb(null, this.data[domain][path][key] || null);
        });
    }

    public findCookies (domain: string, _path: string, cb: (err: Error, cookies?: ICookie[]) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            if (!this.data[domain]) {
                return cb(null, []);
            }
            const { data } = this;
            if (!this.data[domain]) {
                return cb(null, null);
            }
            const out: ICookie[] = [];
            for (const path in data[domain]) {
                for (const key in data[domain][path]) {
                    out.push(data[domain][path][key]);
                }
            }
            cb(null, out);
        });
    }

    public putCookie (cookie: ICookie, cb: (err: Error) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            if (!this.data[cookie.domain]) {
                this.data[cookie.domain] = {};
            }
            if (!this.data[cookie.domain][cookie.path]) {
                this.data[cookie.domain][cookie.path] = {};
            }
            this.data[cookie.domain][cookie.path][cookie.key] = cookie;
            this.saveData(cb);
        });
    };

    public updateCookie (_oldCookie: ICookie, newCookie: ICookie, cb: (err: Error) => void) {
        this.putCookie(newCookie, cb);
    };

    public removeCookie(domain: string, path: string, key: string, cb: (err: Error) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            if (this.data[domain] && this.data[domain][path] && this.data[domain][path][key]) {
                delete this.data[domain][path][key];
            }
            this.saveData(cb);
        });
    }

    public removeCookies (domain: string, path: string, cb: (err: Error) => void) {
        this.loadData(err => {
            if (err) {
                return cb(err);
            }
            if (!this.data[domain]) {
                return cb(null);
            }
            if (path) {
                delete this.data[domain][path];
            } else {
                delete this.data[domain];
            }
            this.saveData(cb);
        });
    }
}

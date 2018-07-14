import { readFile, writeFile } from 'fs';
import { Cookie, CookieStore } from '../src/EDCompanionAPI';

export interface CookieStorage {
  [domain: string]: {
    [path: string]: {
      [key: string]: Cookie;
    };
  };
}

export class CookieFileStore implements CookieStore {
  public synchronous = true;
  private data?: CookieStorage;
  constructor(private fileName: string, private forceReadOnAccess = false) {}

  public findCookie(
    domain: string,
    path: string,
    key: string,
    cb: (err?: Error, cookie?: Cookie) => void,
  ) {
    this.loadData((err, data) => {
      if (err) {
        return cb(err);
      }
      if (!data![domain]) {
        return cb();
      }
      if (!data![domain][path]) {
        return cb();
      }
      cb(undefined, data![domain][path][key] || null);
    });
  }

  public findCookies(domain: string, _path: string, cb: (err?: Error, cookies?: Cookie[]) => void) {
    this.loadData((err, data) => {
      if (err) {
        return cb(err);
      }
      if (!data![domain]) {
        return cb(undefined, []);
      }
      if (!data![domain]) {
        return cb();
      }
      let out: Cookie[] = [];
      for (const domainData of Object.values(data![domain])) {
        out = out.concat(Object.values(domainData));
      }
      cb(undefined, out);
    });
  }

  public putCookie(cookie: Cookie, cb: (err: Error) => void) {
    this.loadData((err, data) => {
      if (err) {
        return cb(err);
      }
      if (!data![cookie.domain]) {
        data![cookie.domain] = {};
      }
      if (!data![cookie.domain][cookie.path]) {
        data![cookie.domain][cookie.path] = {};
      }
      data![cookie.domain][cookie.path][cookie.key] = cookie;
      this.saveData(cb);
    });
  }

  public updateCookie(_oldCookie: Cookie, newCookie: Cookie, cb: (err: Error) => void) {
    this.putCookie(newCookie, cb);
  }

  public removeCookie(domain: string, path: string, key: string, cb: (err: Error) => void) {
    this.loadData((err, data) => {
      if (err) {
        return cb(err);
      }
      if (data![domain] && data![domain][path] && data![domain][path][key]) {
        delete data![domain][path][key];
      }
      this.saveData(cb);
    });
  }

  public removeCookies(domain: string, path: string, cb: (err?: Error) => void) {
    this.loadData((err, data) => {
      if (err) {
        return cb(err);
      }
      if (!data![domain]) {
        return cb();
      }
      if (path) {
        delete data![domain][path];
      } else {
        delete data![domain];
      }
      this.saveData(cb);
    });
  }

  private loadData(cb: (err: undefined | Error, data?: CookieStorage) => void): void {
    if (this.data && !this.forceReadOnAccess) {
      return cb(undefined, this.data);
    }

    readFile(this.fileName, 'utf8', (error, data) => {
      if (error) {
        return cb(error);
      }
      try {
        this.data = JSON.parse(data);
        cb(undefined, this.data);
      } catch (error) {
        cb(error);
      }
    });
  }

  private saveData(cb: (err: Error) => void) {
    this.loadData(err => {
      if (err) {
        return cb(err);
      }
      writeFile(this.fileName, JSON.stringify(this.data), cb);
    });
  }
}

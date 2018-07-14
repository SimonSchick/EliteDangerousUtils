import { ICookieStore, ICookie } from '../../src/EDCompanionAPI';

declare class FileCookieStore implements ICookieStore {
  constructor(fileName: string);
  findCookie(
    domain: string,
    path: string,
    key: string,
    cb: (error: Error, data?: ICookie) => void,
  ): void;
  findCookies(domain: string, path: string, cb: (error: Error, data?: ICookie[]) => void): void;
  putCookie(domain: string, cb: (error?: Error) => void): void;
  updateCookie(domain: string, cb: (error?: Error) => void): void;
  removeCookie(domain: string, path: string, key: string, cb: (error?: Error) => void): void;
  removeCookies(domain: string, path: string, cb: (error?: Error) => void): void;
}
declare namespace FileCookieStore {

}
export = FileCookieStore;

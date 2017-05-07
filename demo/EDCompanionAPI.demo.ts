import { EDCompanionAPI } from '../src/EDCompanionAPI';
import { CookieFileStore } from './CookieFileStore';
import { createInterface } from 'readline';
import { join } from 'path';
import { HTTPClient } from '../src/util/HTTPClient';

function readLineAsync (prompt: string): Promise<string> {
    return new Promise<string>(resolve => {
        const int = createInterface(process.stdin, process.stderr);
        int.question(prompt, response => {
            int.close();
            resolve(response);
        });
    });
}

function promiseSequence<T> (generators: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    let chain = Promise.resolve();
    generators.forEach(gen => {
        chain = chain.then(() => gen()).then(val => { results.push(val) });
    });
    return chain.then(() => results);
}

const api = new EDCompanionAPI(new HTTPClient(), new CookieFileStore(join(__dirname, 'cookies.json')), {
    getLogin () {
        return promiseSequence([
            () => readLineAsync('E-Mail: '),
            () => readLineAsync('Password: '),
        ])
        .then(([email, password]) => ({ email, password }));
    },
    getCode () {
        return readLineAsync('Please enter code: ');
    }
});
api.getProfile()
.then(val => JSON.stringify(val, null, '    '))
.then(console.log)
.catch(err => console.error(err.stack));

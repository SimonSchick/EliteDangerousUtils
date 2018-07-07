import { RawLog } from './EDLog';
import { homedir } from 'os';
import { join } from 'path';
import { readdirSync, readFileSync } from "fs";

export class EDLogReader {
    public static readonly fileMatcher = /Journal\.(\d+)\.\d+.log$/;
    private files?: string[];
    private home?: string;

    public getDir(): string {
        if (this.home) {
            return this.home;
        }
        return this.home = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous');
    }

    public fetchFiles (directory: string = this.getDir()) {
        return this.files = readdirSync(directory)
        .map(fileName => EDLogReader.fileMatcher.exec(fileName))
        .filter(match => !!match)
        .sort((a, b) => Number(a![1]) - Number(b![1]))
        .map(matcher => matcher![0]);
    }

    public parseJSON(str: string): any {
        return JSON.parse(str.replace(/[\0-\25]/g, ''));
    }

    public read(directory: string = this.getDir(), useCachedFiles = true): RawLog[] {
        const out: RawLog[] = [];
        (useCachedFiles && this.files ? this.files : this.fetchFiles(directory))
        .forEach(fileName => {
            readFileSync(join(directory, fileName), 'utf8')
            .split('\n')
            .forEach(line => {
                if (line === '') {
                    return;
                }
                out.push(this.parseJSON(line));
            });
        });
        return out;
    }
}

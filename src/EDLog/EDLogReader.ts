import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { RawLog } from './EDEvent';

export class EDLogReader {
  public static readonly fileMatcher = /Journal\.(\d+)\.\d+.log$/;
  private files?: string[];

  public fetchFiles(directory: string) {
    return (this.files = readdirSync(directory)
      .map(fileName => EDLogReader.fileMatcher.exec(fileName))
      .filter(match => !!match)
      .sort((a, b) => Number(a![1]) - Number(b![1]))
      .map(matcher => matcher![0]));
  }

  public read(directory: string, useCachedFiles = true): RawLog[] {
    const out: RawLog[] = [];
    (useCachedFiles && this.files ? this.files : this.fetchFiles(directory)).forEach(fileName => {
      readFileSync(join(directory, fileName), 'utf8')
        .split('\n')
        .forEach(line => {
          if (line === '') {
            return;
          }
          out.push(JSON.parse(line));
        });
    });
    return out;
  }
}

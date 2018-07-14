import { homedir } from 'os';
import { join } from 'path';

let out: string;
export function directory(): string {
    if (out) {
        return out;
    }
    return out = join(homedir(), '/Saved Games/Frontier Developments/Elite Dangerous');
}

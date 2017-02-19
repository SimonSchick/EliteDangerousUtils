import { Readable, ReadableOptions } from 'stream';
import * as fs from 'fs';

export class ContinuesReadStream extends Readable {
    private closed = false;
    private offset = 0;
    private file: number;
    private poll: NodeJS.Timer;
    private buffer: Buffer;
    constructor (private fileName: string, opts?: ReadableOptions) {
        super(opts);
        this.closed = false;
    }

    public seekToEnd () {
        this.offset = fs.statSync(this.fileName).size;
    }

    public close () {
        if (this.closed) {
            throw new Error('Already closed');
        }
        if (!this.file) {
            return;
        }
        fs.closeSync(this.file);
        clearInterval(this.poll);
        this.closed = true;
    }

    protected _read () {
        if (this.file) {
            return;
        }
        this.buffer = Buffer.alloc(0xFFFF);
        this.file = fs.openSync(this.fileName, 'r');
        this.poll = setInterval(() => {
            try {
                const read = fs.readSync(this.file, this.buffer, 0, 0xFFFF, this.offset);
                this.offset += read;
                if(!this.push(this.buffer.toString('utf8', 0, read))) {
                    this.close();
                }
            } catch (e) {
                process.nextTick(() => this.emit('error', e));
            }
        }, 100);
    }
}

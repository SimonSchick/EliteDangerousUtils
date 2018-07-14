import { closeSync, openSync, readSync, statSync } from 'fs';
import { Readable, ReadableOptions } from 'stream';

/**
 * Stream that allows continiously reading from a file that is procedually being (via append etc).
 */
export class ContinuesReadStream extends Readable {
  private closed = false;
  private offset = 0;
  private file?: number;
  private poll?: NodeJS.Timer;
  private buffer?: Buffer;
  constructor(
    public readonly fileName: string,
    opts?: ReadableOptions,
    public readonly pollInterval: number = 100,
  ) {
    super(opts);
    this.closed = false;
  }

  /**
   * Skips all content and seeks to the end of file.
   */
  public seekToEnd() {
    this.offset = statSync(this.fileName).size;
  }

  /**
   * Closes the stream.
   */
  public close() {
    if (this.closed) {
      throw new Error('Already closed');
    }
    if (!this.file) {
      return;
    }
    closeSync(this.file);
    if (this.poll) {
      clearInterval(this.poll);
    }
    this.closed = true;
  }

  /**
   * @override
   */
  public _read() {
    if (this.file) {
      return;
    }
    this.buffer = Buffer.alloc(0xffff);
    this.file = openSync(this.fileName, 'r');
    this.poll = setInterval(() => {
      try {
        const read = readSync(this.file!, this.buffer!, 0, 0xffff, this.offset);
        this.offset += read;
        if (!this.push(this.buffer!.toString('utf8', 0, read))) {
          this.close();
        }
      } catch (e) {
        process.nextTick(() => this.emit('error', e));
      }
    }, this.pollInterval);
  }
}

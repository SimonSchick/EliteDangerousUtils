import { EventEmitter } from 'events';
export class AsyncQueue extends EventEmitter {
    private queue: ((cb: (error: Error | undefined) => void) => void)[] = [];
    private isDraining = false;

    push (call: (cb: (error: Error | undefined) => void) => void) {
        this.queue.push(call);
        this.drain();
    }

    drain (ignoreDrain = false) {
        if (this.isDraining && !ignoreDrain) {
            return;
        }
        this.isDraining = true;
        const item = this.queue.shift();
        if (!item) {
            this.isDraining = false;
            return;
        }
        item(error => {
            if (error) {
                this.emit('error', error);
            }
            this.drain(true);
        })
    }
}

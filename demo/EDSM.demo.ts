import { Client, ICoordinate } from '../src/EDSM/Client';
import { HTTPClient } from '../src/util/HTTPClient';
import { GalaxyMapWatcher } from '../src/EDSM/GalaxyMapWatcher';

const client = new Client(new HTTPClient());


function prettyCoordinate (coord: ICoordinate): string {
    return `${coord.x.toFixed(2)}, ${coord.y.toFixed(2)}, ${coord.z.toFixed(2)}`;
}

const watcher = new GalaxyMapWatcher(client, {
    delay: 250,
    cycleDelay: 1000,
});

watcher.on('moved', move => {
    console.log(`${move.entry.cmdrName} moved to ${prettyCoordinate(move.entry.coordinates)}`);
});

watcher.on('page', page => {
    console.log('fetched page', page.pageNo);
});

watcher.on('error', console.error);

watcher.start();

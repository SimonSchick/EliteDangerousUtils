import { Client, Coordinate } from '../src/EDSM/Client';
import { GalaxyMapWatcher } from '../src/EDSM/GalaxyMapWatcher';
import { HTTPClient } from '../src/util/HTTPClient';

const client = new Client(new HTTPClient());

function prettyCoordinate(coord: Coordinate): string {
  return `${coord.x.toFixed(2)}, ${coord.y.toFixed(2)}, ${coord.z.toFixed(2)}`;
}

const watcher = new GalaxyMapWatcher(client, {
  cycleDelay: 1000,
  delay: 250,
});

watcher.on('moved', move => {
  console.log(`${move.entry.cmdrName} moved to ${prettyCoordinate(move.entry.coordinates)}`);
});

watcher.on('page', page => {
  console.log('fetched page', page.pageNo);
});

watcher.on('error', console.error);

watcher.start();

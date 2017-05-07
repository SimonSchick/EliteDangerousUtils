import { Client } from '../src/EDSM/Client';
import { HTTPClient } from '../src/util/HTTPClient';

const client = new Client(new HTTPClient());

client.getCommanderMapPage(0)
.then(console.log);

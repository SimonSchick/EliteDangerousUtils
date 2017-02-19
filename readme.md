# elite-dangerous-utils

Collection of components that allow interacting with [Elite: Dangerous JSON Log JSON API](https://forums.frontier.co.uk/attachment.php?attachmentid=112608&d=1477509102])
and the Companion API.

#### I strongly suggest using typescript for consumption of this library.
#### Due to the amount of different objects and log types not all typings may be available, feel free to make a pull request!

# EDLog

EDLog is a basic `EventEmitter` that acts as a wrapper around
that handles log rotation, parsing and handling of their events.

EDLog is very simple to bootstrap as it takes care of pathing too.

Please mind that events may be delayed by about 100ms as the log is polled.

## Compatibility

**Only runs on Windows right now, sorry.**

### Simple demo
```typescript
import { locations, starSystemDistance } from '../elite-dangerous-utils/dist/EDLog/EDLog';

const log = new EDLog();

log.on('event:ReceiveText', event => {
    switch (event.Channel) {
        case 'npc':
            if (blocklist.some(entry => (event.From_Localised || event.From).includes(entry))) {
                return;
            }
            console.log(`Message from: ${event.From_Localised || event.From}: ${event.Message_Localised}`);
            break;
        case 'player':
            console.log(`Direct message from: ${event.From.substr(1)}: ${event.Message}`);
            break;
        case 'local':
            if (event.From_Localised.startsWith('CMDR')) {
                console.log(`Message from ${event.From_Localised.replace('Commander ', '')}: ${event.Message}`);
                break;
            }
            console.log(`Message from ${event.From.substr(1)}: ${event.Message}`);
            break;
    }
});

log.on('event:Bounty', event => {
    console.log(`Killed ${event.Target} for ${event.TotalReward} `);
});
log.on('file', ev => console.log(ev.file))
log.on('event', ev => console.log(ev));
log.start();
```

For a more complex demo see [demo folder](demo/EDLog.demo.ts).

### Events

- `event:*`: Emitted for each log event as documented in the [Spec](https://forums.frontier.co.uk/attachment.php?attachmentid=112608&d=1477509102]) and possibly more.
    - [TS] Some events may not be explicitly typed, in these cases please us the generic form and create a pull request.
    - The `timestamp` property is replaced by a `Date` object for ease of use.
- `event`: Catch-all listener for ALL events.
- `file`: Emitted when a log rotation occurs
    - `file`: The file path of the new file.
- `warn`: Emits an error object.

For all other docs please see the `.d.ts` files.

---

# EDCompanionAPI

EDCompanionAPI is a basic is a basic client wrapper around their companion API that handles login and requests but still requires user credentials.

Please use this with care, avoid too many requests to Frontiers API and avoid logging in too often.

### Simple demo

```typescript
import { EDCompanionAPI } from 'elite-dangerous-utils/dist/EDCompanionAPI';
import * as FileCookieStore from 'tough-cookie-filestore';
import { createInterface } from 'readline';

function readLineAsync (prompt: string): Promise<string> {
    return new Promise<string>(resolve => {
        const int = createInterface(process.stdin, process.stdout);
        int.question(prompt, response => {
            int.close();
            resolve(response);
        });
    });
}

const api = new EDCompanionAPI(new FileCookieStore('cookies.json'), {
    getLogin () {
        return {
            email: 'my@awesomeemail.com',
            password: 'XxXelitehaxxorXxX',
        };
    },
    getCode () {
        return readLineAsync('Please enter code: ');
    }
});
api.getProfile()
.then(console.log)
.catch(console.error);
```

For a _slighty_ more complex demo see [demo folder](demo/EDLog.demo.ts).

### Docs

Due to the size of the schema of this API, please refer to the `d.ts` files, most types should be documented.

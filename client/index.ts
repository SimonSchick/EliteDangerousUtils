import * as fs from 'fs';
import { join } from 'path';
import { locations, distance, EDPosition } from '../src/EDLog/locations';
import { EDLog, EDEvent } from '../src/EDLog/EDLog';
import { speak } from 'say';
import { byAllegiance, byState, byStateAllegiance } from '../src/EDLog/systemMaterialList';
import { IFSDJump, IReceiveText, IBounty, IStartJump, ISendText, IBaseLocation } from '../src/EDLog/events';
import { sampleSize } from 'lodash';
import { AsyncQueue } from '../src/util/AsyncQueue';
import { Client as EDSMClient, ICommanderMapEntry } from '../src/EDSM/Client';
import { HTTPClient } from '../src/util/HTTPClient';
import { GalaxyMapWatcher, IMove } from '../src/EDSM/GalaxyMapWatcher';
import { inspect } from 'util';

let blocklist: string[];
try {
    blocklist = require(join(__dirname, './blocklist.json'));
} catch (e) {
    blocklist = [];
}

function handler (error: Error) {
    console.log(inspect(error, {
        showHidden: true,
        depth: 3,
    }));
}

process.on('uncaughtException', handler)
.on('unhandledRejection', handler);

class Client {
    private criticalFuelLevel: number = 8;
    private galaxyMapWatcherMinSolDistance: number = 1000;
    private galaxyMapWatcherCommanderDistance: number = 1000;
    private materialTruncateLength: number = 5;
    private galaxyMapWatcherBubbleDistance: number = 1000;
    private galaxyMapWatcherOptions = {
        delay: 250,
        cycleDelay: 30 * 1000,
        additionalDelay: 1500,
    };
    private fsdJumpInfoDistance: number = 400;
    private cachedPosition: EDPosition;

    private log = new EDLog();
    private queue = new AsyncQueue();
    private knownEvents: string[];
    private watcher = new GalaxyMapWatcher(new EDSMClient(new HTTPClient()), this.galaxyMapWatcherOptions);

    private attachEventListeners() {
        this.log
        .on('event:FSDJump', event => this.onFSDJump(event))
        .on('event:ReceiveText', event => this.onReceiveText(event))
        .on('event:SendText', event => this.onSendText(event))
        .on('event:Bounty', event => this.onBounty(event))
        .on('event:StartJump', event => this.onStartJump(event))
        .on('event:Location', event => this.onLocation(event))
        .on('file', ev => console.log(ev.file))
        .on('event', ev => {
            console.log(ev);
            if (!this.knownEvents.includes(ev.event)) {
                this.sayQ(`Unknown event discovered: ${ev.event}`);
            }
        })
        .on('warn', error => this.sayQ(`Warn: ${error.message}`))
        .on('error', error => this.sayQ(`Error: ${error.message}`));

        this.watcher
        .once('cycle', () => this.sayQ('Galaxy watcher fetch complete'))
        .on('moved', ev => this.onCommanderMoved(ev))
        .on('error', err => this.sayQ(`Error: ${err.message}`));
    }

    private formatCommanderInfo (cmdr: ICommanderMapEntry, distance: number): string {
        return `${cmdr.cmdrName}\nSystem: ${cmdr.systemName}\nDistance: ${distance.toFixed(1)} light years.`
    }

    private onCommanderMoved(event: IMove) {
        const pos = this.getPosition();
        if (distance(this.getPosition(), locations.Sol) < this.galaxyMapWatcherMinSolDistance) {
            return;
        }

        const dist = distance(EDSMClient.convertEDSMToEDVector(event.entry.coordinates), pos);
        if (dist < this.galaxyMapWatcherCommanderDistance) {
            this.sayQ(`Nearby Commander ${this.formatCommanderInfo(event.entry, dist)}`)
        }
    }

    private listUnknownEvents (backLog: EDEvent[]) {

        this.knownEvents = fs.readFileSync(join(__dirname, '../src/EDLog/EDLog.ts'), 'utf8')
        .trim()
        .split('\n')
        .map(line => line.match(/'event:(.*?)': (.*?),/))
        .filter(match => match)
        .map(match => match[1]);

        let unknown: string[] = [];
        backLog.forEach(ev => {
            if (!this.knownEvents.includes(ev.event) && !unknown.includes(ev.event)) {
                unknown.push(ev.event);
            }
        });
        if (unknown.length === 0) {
            return;
        }
        this.sayQ(`Unknown events: ${unknown.length}`);
        console.log(unknown);
    }

    private getPosition(): EDPosition {
        if (this.cachedPosition) {
            return this.cachedPosition;
        }
        const lastLocation: IBaseLocation = this.log.getLastEvent('event:Location') || this.log.getLastEvent('event:FSDJump');
        if (!lastLocation) {
            return undefined;
        } else {
            return this.cachedPosition = lastLocation.StarPos;
        }
    }

    private checkAndStartGalaxyWatcher () {
        const running = this.watcher.isRunning();
        if (running && distance(this.getPosition(), locations.Sol) < this.galaxyMapWatcherBubbleDistance) {
            this.watcher.stop();
            return;
        }
        if (!running) {
            this.sayQ('Starting galaxy watcher');
            this.watcher.start();
        }
    }

    public start() {

        const backLog = this.log.start({
            process: true,
            store: true,
        });
        this.listUnknownEvents(backLog);

        this.attachEventListeners();
        this.checkAndStartGalaxyWatcher();
    }

    private sayQ(text: string) {
        this.queue.push(((cb: (error: Error) => void) => speak(text, '', 1, cb)));
        console.log(text);
    }

    private onLocation (event: IBaseLocation) {
        this.cachedPosition = event.StarPos;
    }

    private onFSDJump (event: IFSDJump) {
        this.onLocation(event);
        const solDistance = distance(event.StarPos, locations.Sol);
        const info = [];
        if (event.SystemAllegiance && solDistance < this.fsdJumpInfoDistance) {
            info.push(`Arrived in ${event.StarSystem}`, `Distance to Sol: ${solDistance.toFixed(1)} Light Years`);
            info.push(`Allegiance: ${event.SystemAllegiance}`);
            info.push(`Economy: ${event.SystemEconomy_Localised}`);
            info.push(`Security: ${(event.SystemSecurity_Localised).replace('Security', '')}`);
            info.push(`Government: ${event.SystemGovernment_Localised}`);
            info.push(`Faction: ${event.SystemFaction}`);
            info.push(`State: ${event.FactionState || 'None'}`);

            let materials: string[] = [];
            let hasAllegiance = false;
            let hasState = false;
            if (event.SystemAllegiance !== 'None' && byAllegiance[event.SystemAllegiance]) {
                materials.push(...byAllegiance[event.SystemAllegiance]);
                hasAllegiance = true;
            }
            if (event.FactionState !== 'None' && byState[event.FactionState]) {
                materials.push(...byState[event.FactionState]);
                hasState = true;
            }
            if (hasAllegiance && hasState) {
                materials.push(...(byStateAllegiance[event.FactionState][event.SystemAllegiance] || []));
            }
            if (materials.length > 0) {
                const trunc = this.materialTruncateLength;
                if (materials.length > trunc) {
                    const origLength = materials.length;
                    materials = sampleSize(materials, trunc);
                    materials.push(`and ${origLength - trunc} more materials`);
                }
                info.push(`Materials: ${materials.join(', ')}`);
            }
        }
        if(event.FuelLevel < this.criticalFuelLevel) {
            info.push(`Warning: Fuel at ${event.FuelLevel.toFixed(1)} last jump consumed ${event.FuelUsed}!`);
        }
        if (info.length === 0) {
            return;
        }
        this.sayQ(info.join('\n'));
    }

    private onReceiveText(event: IReceiveText) {
        switch (event.Channel) {
            case 'npc':
                if (blocklist.some(entry => (event.From_Localised || event.From).includes(entry))) {
                    return;
                }
                this.sayQ(`Message from: ${event.From_Localised || event.From}: ${event.Message_Localised}`);
                break;
            case 'player':
                if (event.From.startsWith('&')) {
                    this.sayQ(`Direct message from: ${event.From.substring(1)}: ${event.Message}`);
                    return;
                }
                const matcher = /^\$cmdr_decorate:#name=(.*?);$/;
                this.sayQ(`Direct message from: ${event.From.match(matcher)[1]}: ${event.Message}`);
                break;
            case 'local':
                if (event.From_Localised.startsWith('CMDR')) {
                    this.sayQ(`Message from ${event.From_Localised.replace('CMDR ', 'Commander')}: ${event.Message}`);
                    break;
                }
                this.sayQ(`Message from ${event.From.substr(1)}: ${event.Message}`);
                break;
        }
    }

    private onSendText(event: ISendText) {
        if (event.Message.includes('Potter')) {
            this.sayQ('GODDAMNIT HARRY!');
        }
        if (event.Message.startsWith('/')) {
            const [cmd, ...payload] = event.Message.substr(1).split(' ');
            switch (cmd) {
                case 'say':
                    this.sayQ('dijufghnodifjghiodufgjdoufghdoifghiods(/%&(&/%/');
                    break;
                case 'block':
                    blocklist.push(payload.join(' '));
                    fs.writeFileSync(join(__dirname, 'blocklist.json'), JSON.stringify(blocklist));
                    this.sayQ(`Blocked ${payload.join(' ')} That motherfucker sure was annoying.`);
                    break;
                case 'closest':
                    if (!this.watcher.hasCycled()) {
                        this.sayQ('Warning, watcher has not cycled, result may be incorrect');
                    }
                    const [closest, distance] = this.watcher.findClosest(this.getPosition());
                    this.sayQ(`Closest Commander ${this.formatCommanderInfo(closest, distance)}`);
            }
        }
    }

    private onBounty(event: IBounty) {
        this.sayQ(`Killed ${event.Target} for ${event.TotalReward} `);
    }

    private onStartJump(event: IStartJump) {
        if (event.JumpType === 'Supercruise') {
            return;
        }
        this.sayQ(`Jumping to ${event.StarClass} class star.`);
        if (event.StarClass === 'H') {
            this.sayQ('Warning, potential hazard.');
        }
    }

}

const c = new Client();
c.start();

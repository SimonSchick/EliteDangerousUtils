import * as fs from 'fs';
import { EventEmitter } from 'events';
import { locations, starSystemDistance } from '../src/EDLog/locations';
import { EDLog } from '../src/EDLog/EDLog';
import { speak } from 'say';
import { byAllegiance, byState, byStateAllegiance } from '../src/EDLog/systemMaterialList';

let blocklist: string[];
try {
    blocklist = require('./blocklist.json');
} catch (e) {
    blocklist = [];
}


class AsyncQueue extends EventEmitter {
    private queue: ((cb: (error: Error) => void) => void)[] = [];
    private isDraining = false;

    push (call: (cb: (error: Error) => void) => void) {
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

const log = new EDLog();
const queue = new AsyncQueue();
function sayQ(text: string) {
    queue.push(((cb: (error: Error) => void) => speak(text, '', 1, cb)));
}
log.on('event:FSDJump', event => {
    const info = [`Arrived in ${event.StarSystem}`, `Distance to Sol: ${starSystemDistance(event.StarPos, locations.Sol).toFixed(1)} Light Years`];
    if (event.SystemAllegiance) {
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
            if (materials.length > 5) {
                const origLength = materials.length;
                materials = materials.slice(0, 5);
                materials.push(`and ${origLength - 5} more materials`);
            }
            info.push(`Materials: ${materials.join(', ')}`);
        }
    } else {
        info.push(`System is uninhabited.`);
    }
    sayQ(info.join('\n'));
});
log.on('event:ReceiveText', event => {
    switch (event.Channel) {
        case 'npc':
            if (blocklist.some(entry => (event.From_Localised || event.From).includes(entry))) {
                return;
            }
            sayQ(`Message from: ${event.From_Localised || event.From}: ${event.Message_Localised}`);
            break;
        case 'player':
            sayQ(`Direct message from: ${event.From.substr(1)}: ${event.Message}`);
            break;
        case 'local':
            if (event.From_Localised.startsWith('CMDR')) {
                sayQ(`Message from ${event.From_Localised.replace('Commander ', '')}: ${event.Message}`);
                break;
            }
            sayQ(`Message from ${event.From.substr(1)}: ${event.Message}`);
            break;
    }
});
log.on('event:SendText', event => {
    if (event.Message.includes('Potter')) {
        sayQ('GODDAMNIT HARRY!');
    }
    if (event.Message.startsWith('/')) {
        const [cmd, ...payload] = event.Message.substr(1).split(' ');
        switch (cmd) {
            case 'say':
                sayQ('dijufghnodifjghiodufgjdoufghdoifghiods(/%&(&/%/');
                break;
            case 'block':
                blocklist.push(payload.join(' '));
                fs.writeFileSync('blocklist.json', JSON.stringify(blocklist));
                sayQ(`
                    Blocked ${payload.join(' ')}
                    That motherfucker sure was annoying.
                `);
                break;
        }
    }
});
log.on('event:Bounty', event => {
    sayQ(`Killed ${event.Target} for ${event.TotalReward} `);
});
log.on('file', ev => console.log(ev.file));

const knownEvents = [
    'FSDJump',
    'ReceiveText',
    'SendText',
    'Bounty',
    'FuelScoop',
    'LaunchSRV',
    'LoadGame',
    'Rank',
    'Progress',
    'SupercruiseExit',
    'SupercruiseEntry',
    'CommitCrime',
    'MaterialCollected',
    'MaterialDiscarded',
    'MissionAccepted',
    'MissionCompleted',
    'ModuleBuy',
    'SellExplorationData',
    'RefuelAll',
    'BuyAmmo',
    'ShieldState',
    'DockingRequested',
    'DockingGranted',
    'MarketBuy',
    'MarketSell',
    'Docked',
    'Undocked',
    'USSDrop',
    'Touchdown',
    'Liftoff',
    'EngineerCraft',
    'EngineerApply',
    'EngineerProgress',
    'HullDamage',
    'Interdicted',
    'LaunchFighter',
    'RepairAll',
    'Location',
    'Fileheader',
    'ShipyardSell',
    'ShipyardTransfer',
]

log.on('event', ev => {
    if (!(<any>knownEvents).includes(ev.event)) {
        sayQ(`Unknown event discovered: ${ev.event}`);
        console.log(ev);
    }
});
const backLog = log.start(true);

let unknown: string[] = [];
backLog.forEach(ev => {
    if (!(<any>knownEvents).includes(ev.event) && !(<any>unknown).includes(ev.event)) {
        unknown.push(ev.event);
    }
});
sayQ(`Unknown events: ${unknown.length}`);
console.log(unknown);

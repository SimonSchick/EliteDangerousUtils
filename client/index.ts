import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { speak } from 'say';
import { inspect } from 'util';
import { EDEvent } from '../src/EDLog/EDEvent';
import { EDLog } from '../src/EDLog/EDLog';
import {
  BaseLocation,
  Bounty,
  FSDJump,
  LandableBody,
  ReceiveText,
  Scan,
  SendText,
  StartJump,
} from '../src/EDLog/events';
import { distance, EDPosition, locations } from '../src/EDLog/locations';
import { byAllegiance, byState, byStateAllegiance } from '../src/EDLog/systemMaterialList';
import { Client as EDSMClient, CommanderMapEntry, Coordinate } from '../src/EDSM/Client';
import { GalaxyMapWatcher, Move } from '../src/EDSM/GalaxyMapWatcher';
import { AsyncQueue } from '../src/util/AsyncQueue';
import { HTTPClient } from '../src/util/HTTPClient';
import { sampleSize } from '../src/util/sampleSize';

function handler(error: unknown) {
  console.log(
    inspect(error, {
      depth: 3,
      showHidden: true,
    }),
  );
}

process.on('uncaughtException', handler).on('unhandledRejection', handler);

function edLocationToEDSM(pos: EDPosition): Coordinate {
  return {
    x: pos[0],
    y: pos[1],
    z: pos[2],
  };
}

export interface RawSettings {
  blocked: string[];
  tracked: string[];
}

class Client {
  private criticalFuelLevel = 10;
  private galaxyMapWatcherMinPopDistance = 1000;
  private galaxyMapWatcherCommanderDistance = 1000;
  private materialTruncateLength = 5;
  private galaxyMapWatcherOptions = {
    additionalDelay: 1000,
    cycleDelay: 2.5 * 1000,
    delay: 200,
  };
  private cachedPosition?: EDPosition;
  private trackList: string[] = [];
  private settings?: {
    blocked: Set<string>;
    tracked: Set<string>;
  };

  private log = new EDLog();
  private queue = new AsyncQueue();
  private knownEvents?: string[];
  private edsm = new EDSMClient(new HTTPClient());
  private watcher = new GalaxyMapWatcher(this.edsm, this.galaxyMapWatcherOptions);

  public start() {
    this.loadSettings();

    this.attachEventListeners();
    const backLog = this.log.start({
      process: true,
      store: true,
    });
    this.listUnknownEvents(backLog);
    /* console.log(minBy(backLog, e => {
            if (e.event === 'FSDJump') {
                const bEv = <IBaseLocation> e;
                if (distance(bEv.StarPos, [800, 133, 7400]) < 750) {
                    console.log(bEv.StarSystem, distance(bEv.StarPos, [800, 133, 7400]));
                }
            }
        }));*/

    this.checkAndStartGalaxyWatcher();
    this.sayQ('Ready');
  }

  private loadSettings() {
    try {
      const rawSettings: RawSettings = require('./settings.json');
      this.settings = {
        blocked: new Set(rawSettings.blocked || []),
        tracked: new Set(rawSettings.tracked || []),
      };
    } catch (e) {
      this.settings = {
        blocked: new Set<string>(),
        tracked: new Set<string>(),
      };
      if (e.code === 'MODULE_NOT_FOUND') {
        this.sayQ('Settings file not found, loading default');
      } else {
        this.sayQ('Settings file corrupted, loading default');
      }
    }
  }

  private storeSettings() {
    if (!this.settings) {
      throw new Error('Setting not loaded');
    }
    const { blocked, tracked } = this.settings;
    writeFileSync(
      join(__dirname, 'settings.json'),
      JSON.stringify({
        blocked: [...blocked.values()],
        tracked: [...tracked.values()],
      }),
    );
  }

  private onError(err: Error) {
    this.sayQ(`Error: ${err.stack}`);
  }

  private attachEventListeners() {
    this.log
      .on('event:FSDJump', event => this.onFSDJump(event))
      .on('event:ReceiveText', event => this.onReceiveText(event))
      .on('event:SendText', async event => this.onSendText(event).catch(err => this.onError(err)))
      .on('event:Bounty', event => this.onBounty(event))
      .on('event:StartJump', event => this.onStartJump(event))
      .on('event:Location', event => this.onLocation(event))
      .on('event:Scan', event => this.onScan(event))
      .on('event', ev => {
        if (!this.knownEvents) {
          throw new Error('Events not loaded');
        }
        if (!this.knownEvents.includes(ev.event)) {
          this.sayQ(`Unknown event discovered: ${ev.event}`);
        }
      })
      .on('warn', error => {
        this.sayQ(`Warn: ${error.message}`);
        console.log(error);
      })
      .on('error', err => this.onError(err));

    this.watcher
      .once('cycle', () => this.sayQ('Galaxy watcher fetch complete'))
      .on('moved', ev => this.onCommanderMoved(ev))
      .on('error', err => this.sayQ(`Error: ${err.stack}`));
  }

  private formatCoord({ x, y, z }: Coordinate): string {
    return `${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)}`;
  }

  private onScan(event: Scan): void {
    if ('Materials' in event) {
      const materials = (<LandableBody>event).Materials;
      console.table(materials.map(v => ({ name: v.Name, content: `${v.Percent.toFixed(3)}%` })));
      const found = materials.find(({ Name }) => Name === 'polonium');
      if (found && found.Percent > 0.7) {
        this.sayQ(`Polonium rich planet ${event.BodyName}`);
      }
    }
  }

  private formatCommanderInfo(cmdr: CommanderMapEntry, dist: number): string {
    return `${cmdr.cmdrName || 'Unknown'}\nSystem: ${cmdr.systemName ||
      this.formatCoord(cmdr.coordinates)}\nDistance: ${dist.toFixed(1)} light years.`;
  }

  private async onCommanderMoved(event: Move) {
    if (this.trackList.includes(event.entry.user)) {
      const system = await this.edsm.locationToSystem(event.entry.coordinates);
      event.entry.systemName = system;
      this.sayQ(`Tracked commander moved to system: ${event.entry.systemName}`);
    }
    const pos = this.getPosition();
    if (!this.isDeepSpace()) {
      return;
    }

    const dist = distance(EDSMClient.convertEDSMToEDVector(event.entry.coordinates), pos);
    if (dist < this.galaxyMapWatcherCommanderDistance) {
      const system = await this.edsm.locationToSystem(event.entry.coordinates);
      event.entry.systemName = system;
      console.log(event.entry.user);
      this.sayQ(`Nearby Commander ${this.formatCommanderInfo(event.entry, dist)}`);
    }
  }

  private listUnknownEvents(backLog: EDEvent[]) {
    const knownEvents = (this.knownEvents = readFileSync(
      join(__dirname, '../src/EDLog/EDLog.ts'),
      'utf8',
    )
      .trim()
      .split('\n')
      .map(line => line.match(/'event:(.*?)': (.*?);/))
      .filter(match => match)
      .map(match => match![1]));

    const unknown: string[] = [];
    backLog.forEach(ev => {
      if (!knownEvents.includes(ev.event) && !unknown.includes(ev.event)) {
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
    const lastLocation =
      this.log.getLastEvent('event:FSDJump') || this.log.getLastEvent('event:Location');
    if (!lastLocation) {
      throw new Error('position unavailable');
    } else {
      return (this.cachedPosition = lastLocation.StarPos);
    }
  }

  private checkAndStartGalaxyWatcher() {
    const running = this.watcher.isRunning();
    if (running && !this.isDeepSpace()) {
      this.watcher.stop();
      return;
    }
    if (!this.isDeepSpace()) {
      return;
    }
    if (!running) {
      this.sayQ('Starting galaxy watcher');
      this.watcher.start();
    }
  }

  private sayQ(text: string, extra?: object) {
    console.log(new Date().toISOString());
    this.queue.push((cb: (error: Error | undefined) => void) =>
      speak(text, '', 1.5, err => cb(err ? new Error(err) : undefined)),
    );
    console.log(text);
    if (extra) {
      console.log(extra);
    }
  }

  private onLocation(event: BaseLocation) {
    this.cachedPosition = event.StarPos;
  }

  private isDeepSpace(): boolean {
    const minDist = this.galaxyMapWatcherMinPopDistance;
    const pos = this.getPosition();
    return distance(pos, locations.Sol) > minDist && distance(pos, locations.Colonia) > minDist;
  }

  private onFSDJump(event: FSDJump) {
    this.onLocation(event);
    this.checkAndStartGalaxyWatcher();
    const solDistance = distance(event.StarPos, locations.Sol);
    const info = [];
    if (event.SystemAllegiance && !this.isDeepSpace()) {
      info.push(
        `Arrived in ${event.StarSystem}`,
        `Distance to Sol: ${solDistance.toFixed(1)} Light Years`,
      );
      info.push(`Allegiance: ${event.SystemAllegiance}`);
      info.push(`Economy: ${event.SystemEconomy_Localised}`);
      info.push(`Security: ${event.SystemSecurity_Localised.replace('Security', '')}`);
      info.push(`Government: ${event.SystemGovernment_Localised}`);
      info.push(`Faction: ${event.SystemFaction}`);
      info.push(`State: ${event.FactionState || 'None'}`);

      let materials: string[] = [];
      let hasAllegiance = false;
      let hasState = false;
      if (event.SystemAllegiance !== 'None' && byAllegiance[event.SystemAllegiance]) {
        materials.push(...byAllegiance[event.SystemAllegiance]!);
        hasAllegiance = true;
      }
      if (event.FactionState !== 'None' && byState[event.FactionState!]) {
        materials.push(...byState[event.FactionState!]!);
        hasState = true;
      }
      if (hasAllegiance && hasState) {
        materials.push(...(byStateAllegiance[event.FactionState!]![event.SystemAllegiance] || []));
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
    if (event.FuelLevel < this.criticalFuelLevel) {
      info.push('Warning: Check fuel level!');
    }
    if (info.length === 0) {
      return;
    }
    this.sayQ(info.join('\n'));
  }

  private onReceiveText(event: ReceiveText) {
    switch (event.Channel) {
      case 'npc':
        const { settings } = this;
        if (!settings) {
          throw new Error('Settings not loaded');
        }
        if (
          [...settings.blocked].some(entry =>
            (event.From_Localised || event.From || '').includes(entry),
          )
        ) {
          return;
        }
        if (event.Message.startsWith('$COMMS_entered')) {
          return;
        }
        this.sayQ(`Message from ${event.From_Localised || event.From}: ${event.Message_Localised}`);
        break;
      case 'player':
        if (event.From && event.From.startsWith('&')) {
          this.sayQ(`Direct message from ${event.From.substring(1)}: ${event.Message}`);
          return;
        }
        let name: string;
        try {
          const matcher = /^\$cmdr_decorate:#name=(.*?);$/;
          [name] = event.From!.match(matcher)!;
        } catch (e) {
          name = event.From!;
        }
        this.sayQ(`Direct message from ${name}: ${event.Message}`);
        break;
      case 'local':
        if (event.From_Localised && event.From_Localised.startsWith('CMDR')) {
          this.sayQ(
            `Message from ${event.From_Localised.replace('CMDR ', 'Commander')}: ${event.Message}`,
          );
          break;
        }
        this.sayQ(`Message from ${event.From}: ${event.Message}`);
        break;
    }
  }

  private async onSendText(event: SendText) {
    if (event.Message.includes('Potter')) {
      this.sayQ('GODDAMNIT HARRY!');
    }
    if (event.Message.startsWith('/')) {
      const { settings } = this;
      if (!settings) {
        throw new Error('Settings not loaded');
      }
      const [cmd, ...payload] = event.Message.substr(1).split(' ');
      switch (cmd) {
        case 'say':
          this.sayQ('dijufghnodifjghiodufgjdoufghdoifghiods(/%&(&/%/');
          break;
        case 'block':
          settings.blocked.add(payload.join(' '));
          this.storeSettings();
          this.sayQ(`Blocked ${payload.join(' ')} That motherfucker sure was annoying.`);
          break;
        case 'closest':
          if (!this.watcher.hasCycled()) {
            this.sayQ('Warning, watcher has not cycled, result may be incorrect');
          }

          if (payload[0] === 'sphere') {
            const cmdrs = this.watcher.findInSphere(
              edLocationToEDSM(this.getPosition()),
              Number(payload[1]),
            );
            if (cmdrs.length > 10) {
              this.sayQ(`${cmdrs.length} results, please reduce search radius`);
              return;
            }
            cmdrs.sort(([, a], [, b]) => a - b);
            cmdrs.forEach(([cmdr, cDist]) => {
              this.sayQ(
                `${cmdr.cmdrName || 'Unknown'}, ${cDist.toFixed(1)}, ${cmdr.systemName ||
                  'Unknown'}`,
                {
                  edsmId: cmdr.user,
                },
              );
            });
            return;
          }
          const res = await this.watcher.findClosestAutoComplete(edLocationToEDSM(this.getPosition()));
          if (!res) {
            this.sayQ('Nothing found');
            return;
          }
          const [closest, dist] = res;
          this.sayQ(`Closest Commander ${this.formatCommanderInfo(closest, dist)}`, {
            edsmId: closest.user,
            otherPos: closest.coordinates,
            pos: this.getPosition(),
          });
          break;
        case 'track':
          settings.tracked.add(payload[0]);
          this.storeSettings();
          this.sayQ('Tracking');
          break;
        case 'untrack':
          settings.tracked.delete(payload[0]);
          this.sayQ('UnTracking');
          break;
      }
    }
  }

  private onBounty(event: Bounty) {
    this.sayQ(`Killed ${event.Target} for ${event.TotalReward} `);
  }

  private onStartJump(event: StartJump) {
    if (event.JumpType === 'Supercruise') {
      return;
    }
    if (event.StarClass === 'H' || event.StarClass === 'N' || event.StarClass.startsWith('D')) {
      this.sayQ(`Jumping to ${event.StarClass} class star.`);
    }
  }
}

const c = new Client();
c.start();

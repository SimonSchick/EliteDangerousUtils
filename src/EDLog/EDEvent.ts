export interface RawLog {
  timestamp: string;
  event: string;
}

/**
 * Util wrapper for ED events.
 */
export class EDEvent implements EDEvent {
  public timestamp: Date;
  public readonly event: string;
  constructor(rawLog: RawLog) {
    Object.assign(this, rawLog);
    this.event = rawLog.event;
    this.timestamp = new Date(rawLog.timestamp);
  }
}

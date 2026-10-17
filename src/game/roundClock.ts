/** Monotonic active-play clock. Paused/hidden time never consumes a round. */
export class RoundClock {
  elapsed=0
  private last:number|null=null
  constructor(readonly limit:number){}
  resume(now:number){this.last=now}
  tick(now:number){if(this.last===null)return this.elapsed;const delta=Math.max(0,now-this.last);this.elapsed=Math.min(this.limit,this.elapsed+delta);this.last=now;return this.elapsed}
  pause(now:number){this.tick(now);this.last=null}
  get done(){return this.elapsed>=this.limit}
}

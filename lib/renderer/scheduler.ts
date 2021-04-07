import { EventEmitter } from 'events';

class CDomScheduler extends EventEmitter {
  needYield: boolean

  constructor(...args : any[]) {
    super(...args);
    this.needYield = false;
    this.setupYield();
  }

  setupYield() {
    this.on('interrupt', () => {
      this.needYield = true;
    });
    this.on('continue', () => {
      this.needYield = false;
    });
  }

  shouldYield() : boolean {
    return this.needYield;
  }
}

// https://futurama.fandom.com/wiki/Jor-El
const JOREL = new CDomScheduler();

export default JOREL;

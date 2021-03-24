export type Scheduler = () => void;

function createScheduler(callback: () => void, scheduler: (cb: () => void) => void): Scheduler {
  let ticking = false;

  const update = () => {
    ticking = false;
    callback();
  };

  const requestTick = () => {
    if (!ticking) {
      scheduler(update);
    }
    ticking = true;
  };

  return requestTick;
}

export default createScheduler;

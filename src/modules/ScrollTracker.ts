import Rectangle from '../modules/Rectangle';

const PROXIMITY = {
  INSIDE: 'inside',
  OUTSIDE: 'outside',
};

const TRIGGER_CAUSE = {
  INITIAL_POSITION: 'init',
  MOVEMENT: 'movement',
  LIST_UPDATE: 'list-update',
};

function getProximity(condition: ConditionCheck, position) {
  return condition(position.getListRect(), position.getViewportRect())
    ? PROXIMITY.INSIDE
    : PROXIMITY.OUTSIDE;
}

function findCause(prevState, nextState) {
  const isInit = !prevState.proximity && nextState.proximity === PROXIMITY.INSIDE;
  if (isInit) {
    return TRIGGER_CAUSE.INITIAL_POSITION;
  }

  const isMovement =
    prevState.proximity === PROXIMITY.OUTSIDE && nextState.proximity === PROXIMITY.INSIDE;
  if (isMovement) {
    return TRIGGER_CAUSE.MOVEMENT;
  }

  const stay = prevState.proximity === PROXIMITY.INSIDE && nextState.proximity === PROXIMITY.INSIDE;
  if (stay && prevState.listLength !== nextState.listLength) {
    return TRIGGER_CAUSE.LIST_UPDATE;
  }

  return null;
}

type ConditionCheck = (list: Rectangle, viewport: Rectangle) => boolean;

const Condition = {
  nearTop(distance: number): ConditionCheck {
    return (list, viewport) => {
      return viewport.getTop() - list.getTop() <= distance;
    };
  },
  nearBottom(distance: number): ConditionCheck {
    return (list, viewport) => {
      return list.getBottom() - viewport.getBottom() <= distance;
    };
  },
  nearTopRatio(ratio: number): ConditionCheck {
    return (list, viewport) => {
      const viewportHeight = viewport.getHeight();
      const distance = ratio * viewportHeight;
      return viewport.getTop() - list.getTop() <= distance;
    };
  },
  nearBottomRatio(ratio: number): ConditionCheck {
    return (list, viewport) => {
      const viewportHeight = viewport.getHeight();
      const distance = ratio * viewportHeight;
      return list.getBottom() - viewport.getBottom() <= distance;
    };
  },
};

type Zone = {
  condition: ConditionCheck;
  /* tslint:disable-next-line:no-unused */
  callback: ({ triggerCause: string }) => void;
};

class ScrollTracker {
  _handlers: { zone: Zone, state: any }[];

  constructor(zones) {
    this._handlers = zones.map(zone => ({
      zone,
      state: {},
    }));
  }

  handlePositioningUpdate(position) {
    for (const { zone, state } of this._handlers) {
      const { condition, callback } = zone;
      const newProximity = getProximity(condition, position);
      const newListLength = position.getList().length;
      const triggerCause = findCause(state, {
        proximity: newProximity,
        listLength: newListLength,
      });

      state.proximity = newProximity;
      state.listLength = newListLength;

      if (triggerCause) {
        callback({
          triggerCause,
        });
      }
    }
  }
}

export default ScrollTracker;

export { Condition };

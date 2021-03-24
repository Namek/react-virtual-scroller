import React, { ClassicElement } from 'react';
import recomputed from 'recomputed';

import ScrollTracker, { Condition } from '../modules/ScrollTracker';
import Viewport from '../modules/Viewport';

import Updater from './Updater';

const defaultIdentityFunction = (a) => a.id;

const noop = () => null;

type Item = any;

type Props = {
  items: Item[];
  renderItem: (item: Item, pos: number) => ClassicElement<any>;
  viewport: Viewport;

  identityFunction?: (item: Item) => string | number;
  offscreenToViewportRatio?: number;
  assumedItemHeight?: number;
  nearEndProximityRatio?: number;
  nearStartProximityRatio?: number;

  onAtStart?: (info: { triggerCause: string }) => void;
  onNearStart?: (info: { triggerCause: string }) => void;
  onNearEnd?: (info: { triggerCause: string }) => void;
  onAtEnd?: (info: { triggerCause: string }) => void;
};

/* tslint:disable:function-name */
class VirtualScroller extends React.PureComponent<Props, {}> {
  static defaultProps = {
    identityFunction: defaultIdentityFunction,
    offscreenToViewportRatio: 1.8,
    assumedItemHeight: 40,
    nearEndProximityRatio: 1.75,
    nearStartProximityRatio: 0.25,
    onAtStart: noop,
    onNearStart: noop,
    onNearEnd: noop,
    onAtEnd: noop,
  };

  _scrollTracker?: ScrollTracker;
  _updater?: Updater;
  _getList: () => Item[];

  constructor(props) {
    super(props);

    this._getList = recomputed(
      this,
      (props) => props.items,
      (items) => {
        const idMap = {};
        const resultList = [];

        for (const item of items) {
          const id = this.props.identityFunction(item);
          if (idMap.hasOwnProperty(id)) {
            console.warn(
              `Duplicate item id generated in VirtualScroller. Latter item (id = "${id}") will be discarded`
            );
            break;
          }

          resultList.push({
            id,
            data: item,
          });
          idMap[id] = true;
        }

        return resultList;
      }
    );

    this._handleRefUpdate = this._handleRefUpdate.bind(this);
    this._handlePositioningUpdate = this._handlePositioningUpdate.bind(this);
    this._createScrollTracker(props.nearStartProximityRatio, props.nearEndProximityRatio);
  }

  _handleRefUpdate(ref) {
    this._updater = ref;
  }

  _handlePositioningUpdate(position) {
    if (this._scrollTracker) {
      this._scrollTracker.handlePositioningUpdate(position);
    }
  }

  _createScrollTracker(nearStartProximityRatio, nearEndProximityRatio) {
    this._scrollTracker = new ScrollTracker([
      {
        condition: Condition.nearTop(5),
        callback: (info) => {
          return this.props.onAtStart(info);
        },
      },
      {
        condition: Condition.nearTopRatio(nearStartProximityRatio),
        callback: (info) => {
          return this.props.onNearStart(info);
        },
      },
      {
        condition: Condition.nearBottomRatio(nearEndProximityRatio),
        callback: (info) => {
          return this.props.onNearEnd(info);
        },
      },
      {
        condition: Condition.nearBottom(5),
        callback: (info) => {
          return this.props.onAtEnd(info);
        },
      },
    ]);
  }

  // only can scroll to an item of a known height
  scrollToIndex(index) {
    if (this._updater) {
      this._updater.scrollToIndex(index);
    }
  }

  componentWillReceiveProps(nextProps) {
    this._createScrollTracker(nextProps.nearStartProximityRatio, nextProps.nearEndProximityRatio);
  }

  render() {
    const { renderItem, assumedItemHeight, viewport } = this.props;

    return (
      <Updater
        ref={this._handleRefUpdate}
        list={this._getList()}
        renderItem={renderItem}
        assumedItemHeight={assumedItemHeight}
        viewport={viewport}
        onPositioningUpdate={this._handlePositioningUpdate}
      />
    );
  }
}

export default VirtualScroller;

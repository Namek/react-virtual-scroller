import React, { ClassicElement } from 'react';

const nullFunc = () => null;

function defaultGetHeightForDomNode(node) {
  return node ? node.getBoundingClientRect().height : 0;
}

type Item = { id: number | string; data: any; };

type Props = {
  renderItem: (item: Item, pos: number) => ClassicElement<any>;
  list: Item[];
  getHeightForDomNode: (node: HTMLElement) => number;
  blankSpaceAbove: number;
  blankSpaceBelow: number;
};

/* tslint:disable:function-name */
class List extends React.PureComponent<Props, {}> {
  static defaultProps = {
    getHeightForDomNode: defaultGetHeightForDomNode,
  };

  _refs: object;
  _view: any;

  constructor(props: Props) {
    super(props);

    this._refs = {};
    this._handleViewRefUpdate = this._handleViewRefUpdate.bind(this);
  }

  _handleViewRefUpdate(ref) {
    this._view = ref;
  }

  _handleItemRefUpdate(id, ref) {
    if (!ref) {
      delete this._refs[id];
    } else {
      this._refs[id] = ref;
    }
  }

  _renderContent() {
    return this.props.list.map((item, index) => {
      const id = item.id;
      const data = item.data;
      const reactElement = this.props.renderItem(data, index);
      const savedRefFunc = 'function' === typeof reactElement.ref ? reactElement.ref : nullFunc;
      return React.cloneElement(reactElement, {
        key: id,
        ref: r => {
          this._handleItemRefUpdate(id, r);
          savedRefFunc(r);
        },
      });
    });
  }

  getWrapperNode() {
    return this._view;
  }

  getItemHeights() {
    const { list, getHeightForDomNode } = this.props;

    return list.reduce((heightsMap, item) => {
      const id = item.id;
      const node = this._refs[id];

      heightsMap[id] = getHeightForDomNode(node);
      return heightsMap;
    }, {});
  }

  render() {
    const { blankSpaceAbove, blankSpaceBelow } = this.props;

    return (
      <div
        ref={this._handleViewRefUpdate}
        style={{
          paddingTop: blankSpaceAbove,
          paddingBottom: blankSpaceBelow,
        }}
      >
        {this._renderContent()}
      </div>
    );
  }
}

export default List;

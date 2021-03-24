import Rectangle from './Rectangle';

/* tslint:disable:function-name */
class Viewport {
  _scroller: HTMLElement;
  _window: Window;
  _programmaticScrollListeners: any[];
  _offsetTop: number;
  _useWindow: boolean;

  constructor(window, scroller = window) {
    this._scroller = scroller;
    this._window = window;
    this._programmaticScrollListeners = [];
    this._offsetTop = 0;
    this._useWindow = scroller === this._window;
  }

  _getScrollerHeight() {
    if (this._useWindow) {
      return Math.ceil(this._window.document.documentElement.clientHeight);
    }

    return this._scroller.clientHeight;
  }

  _addListener(event, listener, useWindow) {
    const target = useWindow ? this._window : this._scroller;

    const eventCallback = () => {
      return listener();
    };

    target.addEventListener(event, eventCallback);

    return () => {
      target.removeEventListener(event, eventCallback);
    };
  }

  getRectRelativeTo(node) {
    const top = node.getBoundingClientRect().top;
    const scrollerTop = this._useWindow ? 0 : this._scroller.getBoundingClientRect().top;

    return this.getRect().translateBy(0, Math.ceil(scrollerTop - top));
  }

  getOffsetTop() {
    return this._offsetTop;
  }

  setOffsetTop(value) {
    this._offsetTop = Math.ceil(value);
  }

  getRect() {
    const windowHeight = this._getScrollerHeight();
    const height = Math.max(0, windowHeight - this._offsetTop);
    return new Rectangle({ top: this._offsetTop, height });
  }

  // get scroll left
  scrollX() {
    if (this._useWindow) {
      return -1 * this._window.document.body.getBoundingClientRect().left;
    }

    return this._scroller.scrollLeft;
  }

  // get scroll top
  scrollY() {
    if (this._useWindow) {
      return -1 * this._window.document.body.getBoundingClientRect().top;
    }

    return this._scroller.scrollTop;
  }

  scrollBy(vertically) {
    if (this._useWindow) {
      this._window.scrollBy(0, vertically);
    } else {
      this._scroller.scrollTop += vertically;
    }

    this._programmaticScrollListeners.forEach(listener => listener(vertically));
  }

  scrollTo(yPos) {
    if (this._useWindow) {
      this._window.scrollTo(0, yPos);
    } else {
      this._scroller.scrollTop = yPos;
    }

    this._programmaticScrollListeners.forEach(listener => listener(yPos));
  }

  addRectChangeListener(listener) {
    return this._addListener('resize', listener, true);
  }

  addScrollListener(listener) {
    return this._addListener('scroll', listener, false);
  }

  // listener triggered by programmatic scroll
  addProgrammaticScrollListener(listener) {
    if (this._programmaticScrollListeners.indexOf(listener) < 0) {
      this._programmaticScrollListeners.push(listener);
    }
    return () => this.removeProgrammaticScrollListener(listener);
  }

  removeProgrammaticScrollListener(listener) {
    const index = this._programmaticScrollListeners.indexOf(listener);
    if (index > -1) this._programmaticScrollListeners.splice(index, 1);
  }
}

export default Viewport;

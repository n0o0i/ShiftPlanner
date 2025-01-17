/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component, createRef, PureComponent } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Calendar, } from '@fullcalendar/core';
import { CustomRenderingStore, } from '@fullcalendar/core/internal';
const reactMajorVersion = parseInt(String(React.version).split('.')[0]);
const syncRenderingByDefault = reactMajorVersion < 18;
export default class FullCalendar extends Component {
    constructor() {
        super(...arguments);
        this.elRef = createRef();
        this.isUpdating = false;
        this.isUnmounting = false;
        this.state = {
            customRenderingMap: new Map()
        };
        this.requestResize = () => {
            if (!this.isUnmounting) {
                this.cancelResize();
                this.resizeId = requestAnimationFrame(() => {
                    this.doResize();
                });
            }
        };
    }
    render() {
        const customRenderingNodes = [];
        for (const customRendering of this.state.customRenderingMap.values()) {
            customRenderingNodes.push(React.createElement(CustomRenderingComponent, { key: customRendering.id, customRendering: customRendering }));
        }
        return (React.createElement("div", { ref: this.elRef }, customRenderingNodes));
    }
    componentDidMount() {
        const customRenderingStore = new CustomRenderingStore();
        this.handleCustomRendering = customRenderingStore.handle.bind(customRenderingStore);
        this.calendar = new Calendar(this.elRef.current, Object.assign(Object.assign({}, this.props), { handleCustomRendering: this.handleCustomRendering }));
        this.calendar.render();
        let lastRequestTimestamp;
        customRenderingStore.subscribe((customRenderingMap) => {
            const requestTimestamp = Date.now();
            const isMounting = !lastRequestTimestamp;
            const runFunc = (
            // don't call flushSync if React version already does sync rendering by default
            // guards against fatal errors:
            // https://github.com/fullcalendar/fullcalendar/issues/7448
            syncRenderingByDefault ||
                //
                isMounting ||
                this.isUpdating ||
                this.isUnmounting ||
                (requestTimestamp - lastRequestTimestamp) < 100 // rerendering frequently
            ) ? runNow // either sync rendering (first-time or React 16/17) or async (React 18)
                : flushSync; // guaranteed sync rendering
            runFunc(() => {
                this.setState({ customRenderingMap }, () => {
                    lastRequestTimestamp = requestTimestamp;
                    if (isMounting) {
                        this.doResize();
                    }
                    else {
                        this.requestResize();
                    }
                });
            });
        });
    }
    componentDidUpdate() {
        this.isUpdating = true;
        this.calendar.resetOptions(Object.assign(Object.assign({}, this.props), { handleCustomRendering: this.handleCustomRendering }));
        this.isUpdating = false;
    }
    componentWillUnmount() {
        this.isUnmounting = true;
        this.cancelResize();
        this.calendar.destroy();
    }
    doResize() {
        this.calendar.updateSize();
    }
    cancelResize() {
        if (this.resizeId !== undefined) {
            cancelAnimationFrame(this.resizeId);
            this.resizeId = undefined;
        }
    }
    getApi() {
        return this.calendar;
    }
}
FullCalendar.act = runNow; // DEPRECATED. Not leveraged anymore
class CustomRenderingComponent extends PureComponent {
    render() {
        const { customRendering } = this.props;
        const { generatorMeta } = customRendering;
        const vnode = typeof generatorMeta === 'function' ?
            generatorMeta(customRendering.renderProps) :
            generatorMeta;
        return createPortal(vnode, customRendering.containerEl);
    }
}
// Util
// -------------------------------------------------------------------------------------------------
function runNow(f) {
    f();
}
//# sourceMappingURL=index.js.map
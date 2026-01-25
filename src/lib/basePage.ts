import EventEmitter from 'node:events';

import { QWidget } from '@nodegui/nodegui';

class BasePage implements IPage {
    protected statusEventEmitter: EventEmitter;

    constructor() {
        this.statusEventEmitter = new EventEmitter();
    };

    public on(...[ event, handler ]: Parameters<pageEventHandlers>) {
        switch (event) {
            case 'status':
                this.statusEventEmitter.on(event, handler);
                break;
        };
    };

    public off(...[ event, handler ]: Parameters<pageEventHandlers>){
        switch (event) {
            case 'status':
                this.statusEventEmitter.off(event, handler);
                break;
        };
    };

    public getElements = () => new QWidget();
};

export default BasePage;
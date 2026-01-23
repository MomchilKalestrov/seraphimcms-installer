import type { QWidget } from '@nodegui/nodegui';

declare global {
    type pageEventHandlers =
        (event: 'status', handler: (canProceed: boolean) => void) => void;

    interface IPage {
        on: pageEventHandlers;
        off: pageEventHandlers;
        getElements: () => QWidget;
    };
};

export {};
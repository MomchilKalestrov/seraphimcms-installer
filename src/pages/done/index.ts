import {
    QLabel,
    QWidget,
    Direction,
    TextFormat,
    QBoxLayout
} from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';
import locale from '../../lib/texts.ts';

class DonePage extends BasePage {
    private elements: QWidget;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText(locale.pages.done.title);
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setText(locale.pages.done.info);
        //#endregion

        //#region - Elements -
        const layout = new QBoxLayout(Direction.TopToBottom);
        this.elements = new QWidget();
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        layout.addWidget(title);
        layout.addWidget(text);
        //#endregion
    };

    public on(...[ event, handler ]: Parameters<pageEventHandlers>) {
        switch (event) {
            case 'status':
                handler(false);
                break;
            default:
                return super.on(event, handler);
        };
    };

    public off(...[ event, handler ]: Parameters<pageEventHandlers>) {
        return super.off(event, handler);
    };

    public getElements = () => this.elements;
};

export default DonePage;
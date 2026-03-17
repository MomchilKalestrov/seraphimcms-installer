import {
    QLabel,
    QWidget,
    Direction,
    TextFormat,
    QBoxLayout
} from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';
import isRoot from '../../lib/isRoot.ts';
import locale from '../../lib/texts.ts';

class WelcomePage extends BasePage {
    private elements: QWidget;
    private isRoot: boolean = isRoot();
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText(locale.pages.welcome.title);
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setOpenExternalLinks(true);
        if (!this.isRoot)
            text.setText(locale.pages.welcome.sudoRequest);
        else
            text.setText(locale.pages.welcome.welcomeText);
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
                handler(this.isRoot);
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

export default WelcomePage;
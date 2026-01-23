import { Direction, QBoxLayout, QLabel, QSizePolicyPolicy, QWidget, TextFormat } from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';

class WelcomePage extends BasePage {
    private elements: QWidget;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText('SeraphimCMS Installer');
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setOpenExternalLinks(true);
        text.setText(/*html*/
            `<p>
                Welcome to the SeraphimCMS installer wizzard.<br />
                SeraphimCMS is a self-hosted website builder. This tool is<br />
                meant to help the initial setup.
            </p>
            <p>
                The project, along with this installer, is licensed under<br />
                GPLv3. The developers of SeraphimCMS bear no<br />
                responsability for any damages occured during the use of<br />
                SeraphimCMS. You can read the license here:
            </p>
            <p>
                <a href="https://https://www.gnu.org/licenses/gpl-3.0.en.html">https://www.gnu.org/licenses/gpl-3.0.en.html</a>
            </p>`
        );
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
                handler(true);
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
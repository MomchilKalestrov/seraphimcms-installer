import os from 'node:os';
import { spawnSync } from 'node:child_process';

import {
    QLabel,
    QWidget,
    Direction,
    QBoxLayout,
    TextFormat,
    QPushButton,
    AlignmentFlag,
    QSizePolicyPolicy
} from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';

import linux from './linux.ts';
import win32 from './win32.ts';
import locale from '../../lib/texts.ts';

const platforms: Record<string, () => Promise<void>> = { linux, win32 };

class InstallDockerPage extends BasePage {
    private elements: QWidget;
    private installButton: QPushButton;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText(locale.pages.installDocker.title);
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        title.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Minimum);
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setOpenExternalLinks(true);
        text.setText(locale.pages.installDocker.info);
        //#endregion

        //#region - Install Button -
        this.installButton = new QPushButton();
        this.installButton.addEventListener('clicked', this.installDocker);
        this.installButton.setInlineStyle('margin-top: 8px; padding: 4px 8px;');
        if (this.isDockerInstalled()) {
            this.installButton.setText(locale.pages.installDocker.alreadyInstalled);
            this.installButton.setEnabled(false);
        } else {
            this.installButton.setText(locale.pages.installDocker.installPrompt);
        };
        //#region

        //#region - Elements -
        const layout = new QBoxLayout(Direction.TopToBottom);
        this.elements = new QWidget();
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        layout.setStretch(0, 0);
        layout.setStretch(1, 0);
        layout.setStretch(2, 1);
        layout.addWidget(title);
        layout.addWidget(text);
        layout.addWidget(this.installButton, 0, AlignmentFlag.AlignLeft);
        //#endregion
    };

    private isDockerInstalled = (): boolean => {
        if (os.platform() === 'win32')
            return !spawnSync('docker', [ '--version' ]).error;
        
        return !spawnSync('which', [ 'docker' ]).status;
    };

    public on(...[ event, handler ]: Parameters<pageEventHandlers>) {
        switch (event) {
            case 'status':
                if (this.isDockerInstalled())
                    handler(true);
                else
                    super.on(event, handler);
                break;
            default:
                return super.on(event, handler);
        };
    };

    public off(...[ event, handler ]: Parameters<pageEventHandlers>) {
        return super.off(event, handler);
    };

    public getElements = () => this.elements;

    private installDocker = () => {
        this.installButton.setDisabled(true);
        this.installButton.setText(locale.pages.installDocker.wait);
        
        const installer = platforms[ os.platform() ];
        
        installer!()
            .then(() => {
                this.statusEventEmitter.emit('status', true);
                this.installButton.setText(locale.success);
            })
            .catch(error => this.installButton.setText(locale.error + '\n' + (error.message ?? error) + '\nInstall and enable Docker manually.'));
    };
};

export default InstallDockerPage;
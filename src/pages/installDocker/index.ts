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

const platforms: Record<string, () => Promise<void>> = { linux, win32 };

class InstallDockerPage extends BasePage {
    private elements: QWidget;
    private installButton: QPushButton;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText('Install docker');
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        title.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Minimum);
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setOpenExternalLinks(true);
        text.setText(/*html*/
            `<p>
                Firstly you will need to install Docker. The Docker Engine<br />
                is licensed under Apache-2.0:
            </p>
            <p>
                <a href="https://www.apache.org/licenses/LICENSE-2.0.txt">https://www.apache.org/licenses/LICENSE-2.0.txt</a>
            </p>
            <p>
                <span style="font-weight: 500;">Note:</span> Docker Desktop is also required for Windows, for<br />
                which you will need to agree to the Docker Desktop EULA:
            </p>
            <p>
                <a href="https://docs.docker.com/subscription/desktop-license/">https://docs.docker.com/subscription/desktop-license/</a>
            </p>`
        );
        //#endregion

        //#region - Install Button -
        this.installButton = new QPushButton();
        this.installButton.addEventListener('clicked', this.installDocker);
        this.installButton.setInlineStyle('margin-top: 8px; padding: 4px 8px;');
        if (this.isDockerInstalled()) {
            this.installButton.setText('Docker is already installed!');
            this.installButton.setEnabled(false);
        } else {
            this.installButton.setText('Install Docker');
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
        this.installButton.setText('Please wait.');
        
        const installer = platforms[ os.platform() ];
        
        if (!installer) {
            this.installButton.setText('Unrecognized platform!');
            return;
        };

        installer()
            .then(() => {
                this.statusEventEmitter.emit('status', true);
                this.installButton.setText('Done!');
            })
            .catch(error => this.installButton.setText(error + '\nInstall and enable Docker manually.'));
    };
};

export default InstallDockerPage;
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

import {
    QLabel,
    QWidget,
    Direction,
    QBoxLayout,
    QProgressBar,
} from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';
import download from '../../lib/download.ts';
import { OWNER, REPO, IMAGE_FILENAME } from '../../lib/constants.ts';
import enableAutoStartService from './enableAutoStartService.ts';
import exposePort from './exposePort.ts';
import locale from '../../lib/texts.ts';

class SetupContainerPage extends BasePage {
    private elements: QWidget;
    private progress: QProgressBar;
    private status: QLabel;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText('Install container');
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setText(
            'The installer will now download and load the\n' +
            'SeraphimCMS image.'
        );
        //#endregion

        //#region - Progress -
        this.progress = new QProgressBar();
        this.progress.setRange(0, 100);
        //#endregion

        //#region - Status -
        this.status = new QLabel();
        //#endregion

        //#region - Elements -
        const layout = new QBoxLayout(Direction.TopToBottom);
        this.elements = new QWidget();
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        layout.addWidget(title);
        layout.addWidget(text);
        layout.addWidget(this.progress);
        layout.addWidget(this.status);
        //#endregion

        this.startInstall();
    };

    private getDownloadUrl = async () => {
        const response = await fetch(`https://api.github.com/repos/${ OWNER }/${ REPO }/releases/latest`, {
            headers: {
            'Accept': 'application/vnd.github+json',
            }
        });

        if (!response.ok) throw locale.pages.setupContainer.errors.downloadFailed;

        const { assets } = await response.json() as { assets: { name: string; browser_download_url: string; }[]; };

        const { browser_download_url } = assets.find(({ name }) => name.endsWith('.tar'))!;

        return browser_download_url;
    };

    private startInstall = () => {
        this.status.setText(locale.pages.setupContainer.status.downloading);
        this.getDownloadUrl()
            .then(url => download(url, progress => this.progress.setValue(progress)))
            .then(blob => {
                fs.writeFileSync(IMAGE_FILENAME, blob);

                this.status.setText(locale.pages.setupContainer.status.loading);
                spawnSync('docker', [ 'load', '-i', IMAGE_FILENAME ]);
                spawnSync('docker', [ 'run', '-d', `--env-file=${ IMAGE_FILENAME }`, '--restart', 'unless-stopped', 'seraphimcms:latest' ]);

                this.status.setText(locale.pages.setupContainer.status.exposingPort);
                exposePort();
                
                if (os.platform() !== 'win32') {
                    this.status.setText(locale.pages.setupContainer.status.enablingService);
                    enableAutoStartService();
                };
                
                this.status.setText(locale.success);
                this.statusEventEmitter.emit('status', true);
            })
            .catch(error => this.status.setText(locale.error + '\n' + (error.message ?? error)));
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

export default SetupContainerPage;
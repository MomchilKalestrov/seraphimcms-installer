import os from 'node:os';
import { spawnSync } from 'node:child_process';

import {
    QLabel,
    QWidget,
    Direction,
    QBoxLayout,
    QProgressBar,
} from '@nodegui/nodegui';

import locale from '../../lib/texts.ts';
import BasePage from '../../lib/basePage.ts';
import download from '../../lib/download.ts';
import { CONTAINER_NAME, CONTAINER_PATH, CONTAINER_URL, ENV_FILE, DOCKER_NAME, BLOB_FS_PATH } from '../../lib/constants.ts';

import exposePort from './exposePort.ts';
import enableAutoStartService from './enableAutoStartService.ts';

class SetupContainerPage extends BasePage {
    private elements: QWidget;
    private progress: QProgressBar;
    private status: QLabel;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText(locale.pages.setupContainer.title);
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setText(
            locale.pages.setupContainer.info
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
        const response = await fetch(CONTAINER_URL);

        if (!response.ok) throw locale.pages.setupContainer.errors.downloadFailed;

        type release = {
            assets: {
                links: ({
                    name: string;
                    url: string;
                })[]
            };
        };

        const { assets: { links } } = (await response.json() as release[])[ 0 ]!;
        const { url } = links.find(({ name }) => name.endsWith('.tar'))!;

        return url;
    };

    private startInstall = async () => {
        this.status.setText(locale.pages.setupContainer.status.downloading);
        
        try {
            const downloadUrl = await this.getDownloadUrl();
            await download(downloadUrl, CONTAINER_PATH, progress => this.progress.setValue(progress));

            this.status.setText(locale.pages.setupContainer.status.loading);
            spawnSync('docker', [ 'load', '-i', CONTAINER_PATH ]);
            spawnSync('docker', [
                'run',
                '-d',
                '--name', DOCKER_NAME,
                '-v', `${ BLOB_FS_PATH }:/app/public`,
                '-p', '443:3000',
                `--env-file=${ ENV_FILE }`,
                '--restart', 'unless-stopped',
                CONTAINER_NAME,
            ]);
    
            this.status.setText(locale.pages.setupContainer.status.exposingPort);
            exposePort();
            
            if (os.platform() !== 'win32') {
                this.status.setText(locale.pages.setupContainer.status.enablingService);
                enableAutoStartService();
            };
            
            this.status.setText(locale.success);
            this.statusEventEmitter.emit('status', true);
        } catch (error) {
            this.status.setText(locale.error + '\n' + (error instanceof Error ? error.message : error))
        };
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
import fs from 'node:fs';
import crypto from 'node:crypto';

import {
    QLabel,
    QWidget,
    QLineEdit,
    QGridLayout,
    AlignmentFlag,
    QSizePolicyPolicy,
    QCheckBox
} from '@nodegui/nodegui';

import locale from '../../lib/texts.ts';
import BasePage from '../../lib/basePage.ts';
import { ENV_FILE } from '../../lib/constants.ts';
import { ownPath } from '../../lib/utils.ts';

class SetupEnvironmentPage extends BasePage {
    private elements: QWidget;

    // with the inclusion of the FS blob driver, `requiredVariables` needs
    // to work when the FS blob driver is selected, which means there can
    // be different required variables
    private requiredVariables = [
        [ 'MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'BLOB_READ_WRITE_TOKEN', 'NEXT_PUBLIC_BLOB_URL' ],
        [ 'MONGODB_URI', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'FS_DRIVER_SELECTED' ]
    ];
    
    constructor() {
        super();

        global.envVars = {};
        global.envVars.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');

        //#region - Title -
        const title = new QLabel();
        title.setText(locale.pages.setupEnvironment.title);
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion
        
        //#region - FS DRIVER_TOGGLE
        const fsDriverToggle = new QCheckBox();
        fsDriverToggle.setText(locale.pages.setupEnvironment.fsDriver);
        fsDriverToggle.setToolTip(locale.pages.setupEnvironment.fsDriverTooltip);
        fsDriverToggle.addEventListener('toggled', toggled => {
            global.envVars = Object.fromEntries(
                Object.entries(global.envVars)
                    .filter(([ key ]) => this.requiredVariables[ toggled ? 1 : 0 ]!.includes(key)
                )
            );

            if (toggled) {
                blobTokenInput.setText('');
                blobUrlInput.setText('');

                this.setEnvVar('FS_DRIVER_SELECTED', 'true');
            };

            blobTokenInput.setDisabled(toggled);
            blobUrlInput.setDisabled(toggled);
        });
        //#endregion

        //#region - MONGODB_URI -
        const mongoLabel = new QLabel();
        mongoLabel.setText(locale.pages.setupEnvironment.dbUrl);
        const mongoInput = new QLineEdit();
        mongoInput.setPlaceholderText('mongodb+srv://<...>');
        mongoInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        mongoInput.addEventListener('textChanged', text => this.setEnvVar('MONGODB_URI', text));
        //#endregion

        //#region - NEXTAUTH_URL -
        const domainLabel = new QLabel();
        domainLabel.setText(locale.pages.setupEnvironment.domain);
        const domainInput = new QLineEdit();
        domainInput.setPlaceholderText('www.example.com');
        domainInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        domainInput.addEventListener('textChanged', text => this.setEnvVar('NEXTAUTH_URL', text));
        //#endregion

        //#region - BLOB_READ_WRITE_TOKEN -
        const blobTokenLabel = new QLabel();
        blobTokenLabel.setText(locale.pages.setupEnvironment.blobToken);
        const blobTokenInput = new QLineEdit();
        blobTokenInput.setPlaceholderText('...');
        blobTokenInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        blobTokenInput.addEventListener('textChanged', text => this.setEnvVar('BLOB_READ_WRITE_TOKEN', text));
        //#endregion

        //#region - NEXT_PUBLIC_BLOB_URL -
        const blobUrlLabel = new QLabel();
        blobUrlLabel.setText(locale.pages.setupEnvironment.blobUrl);
        const blobUrlInput = new QLineEdit();
        blobUrlInput.setPlaceholderText('https://<...>');
        blobUrlInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        blobUrlInput.addEventListener('textChanged', text => this.setEnvVar('NEXT_PUBLIC_BLOB_URL', text));
        //#endregion

        //#region - Elements -
        const layout = new QGridLayout();
        this.elements = new QWidget();
        this.elements.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Expanding);
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        for (let i = 0; i < 6; i++)
            layout.setRowStretch(i, 0);

        layout.setColumnStretch(0, 0);
        layout.setColumnStretch(1, 1);
        layout.addWidget(title, 0, 0, 1, 2, AlignmentFlag.AlignTop | AlignmentFlag.AlignLeft);
        
        layout.addWidget(mongoLabel, 1, 0, 1, 1);
        layout.addWidget(mongoInput, 1, 1, 1, 1);

        layout.addWidget(domainLabel, 2, 0, 1, 1);
        layout.addWidget(domainInput, 2, 1, 1, 1);
        
        layout.addWidget(blobTokenLabel, 3, 0, 1, 1);
        layout.addWidget(blobTokenInput, 3, 1, 1, 1);
        
        layout.addWidget(blobUrlLabel, 4, 0, 1, 1);
        layout.addWidget(blobUrlInput, 4, 1, 1, 1);

        layout.addWidget(fsDriverToggle, 5, 0, 1, 2, AlignmentFlag.AlignTop | AlignmentFlag.AlignLeft);
        //#endregion
    };

    public on(...[ event, handler ]: Parameters<pageEventHandlers>) {
        switch (event) {
            default:
                return super.on(event, handler);
        };
    };

    public off(...[ event, handler ]: Parameters<pageEventHandlers>) {
        return super.off(event, handler);
    };

    private canProceed = (): boolean => {
        const iterableEnvVars = Object.entries(globalThis.envVars);

        return this.requiredVariables.some(set => {
            set.every(envVar => iterableEnvVars.find(([ key ]) => envVar === key))
        });
    };
    
    private toEscapedValue = (value: string): string => {
        let out = '';

        for (const ch of value) {
            switch (ch) {
                case '\\': out += '\\\\'; break;
                case ' ': out += '\\ '; break;
                case '\n': out += '\\n'; break;
                case '\r': out += '\\r'; break;
                case '\t': out += '\\t'; break;
                default:
                    out += /^[A-Za-z0-9_./:@%+=,-]$/.test(ch)
                    ?   ch
                    :   `\\${ ch }`;
                    break;
            };
        };

        return out;
    };
    
    private writeEnvFile = () => {
        fs.writeFileSync(
            ENV_FILE,
            Object
                .entries(global.envVars)
                .map(([ key, value ]) => `${ key }=${ this.toEscapedValue(value!) }`)
                .join('\n')
        );
        ownPath(ENV_FILE);
    };

    private setEnvVar = (key: keyof typeof global.envVars, value: string) => {
        global.envVars[ key ] = value;
        const canProceed = this.canProceed();
        if (canProceed) this.writeEnvFile();
        this.statusEventEmitter.emit('status', canProceed);
    };

    public getElements = () => this.elements;
};

export default SetupEnvironmentPage;
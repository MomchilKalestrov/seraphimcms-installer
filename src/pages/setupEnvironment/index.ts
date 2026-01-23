import { AlignmentFlag, QGridLayout, QLabel, QLineEdit, QSizePolicyPolicy, QTextEdit, QWidget } from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';

class SetupEnvironmentPage extends BasePage {
    private elements: QWidget;
    
    constructor() {
        super();

        //#region - Title -
        const title = new QLabel();
        title.setText('Setup Environment');
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - MONGODB_URI -
        const mongoLabel = new QLabel();
        mongoLabel.setText('DB URL:');
        const mongoInput = new QLineEdit();
        mongoInput.setPlaceholderText('mongodb+srv://<...>');
        mongoInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        //#endregion

        //#region - NEXTAUTH_URL -
        const domainLabel = new QLabel();
        domainLabel.setText('Domain:');
        const domainInput = new QLineEdit();
        domainInput.setPlaceholderText('www.example.com');
        domainInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        //#endregion

        //#region - BLOB_READ_WRITE_TOKEN -
        const blobTokenLabel = new QLabel();
        blobTokenLabel.setText('Blob Token:');
        const blobTokenInput = new QLineEdit();
        blobTokenInput.setPlaceholderText('vercel_blob_rw_<...>');
        blobTokenInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        //#endregion

        //#region - NEXT_PUBLIC_BLOB_URL -
        const blobUrlLabel = new QLabel();
        blobUrlLabel.setText('Blob URL:');
        const blobUrlInput = new QLineEdit();
        blobUrlInput.setPlaceholderText('https://<...>.public.blob.vercel-storage.com');
        blobUrlInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        //#endregion

        //#region - Elements -
        const layout = new QGridLayout();
        this.elements = new QWidget();
        this.elements.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Expanding);
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        for (let i = 0; i < 5; i++)
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

export default SetupEnvironmentPage;
import crypto from 'node:crypto';

import {
    QLabel,
    QWidget,
    QLineEdit,
    QGridLayout,
    AlignmentFlag,
    QSizePolicyPolicy,
    QPushButton,
    EchoMode,
    TextFormat
} from '@nodegui/nodegui';

import BasePage from '../../lib/basePage.ts';
import createOwnerUser from './createOwnerUser.ts';

class CreateUserPage extends BasePage {
    private elements: QWidget;
    private username: string | undefined;
    private password: string | undefined;
    private generateUserButton: QPushButton;

    constructor() {
        super();

        global.envVars = {};
        global.envVars.NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');

        //#region - Title -
        const title = new QLabel();
        title.setText('Setup Environment');
        title.setInlineStyle('font-size: 24px; font-weight: 600;');
        //#endregion

        //#region - Text -
        const text = new QLabel();
        text.setTextFormat(TextFormat.RichText);
        text.setInlineStyle('margin-bottom: 8px;')
        text.setText(/*html*/
            `<p>Set the administator's username and password.</p>
            <p>- The username must include only alphabetical characters.</p>
            <p>
                - The password must be 8 characters long, 2 alphabetical<br />
                characters and 1 special character.
            </p>`
        );
        //#endregion

        //#region - Username -
        const usernameLabel = new QLabel();
        usernameLabel.setText('Username:');
        const usernameInput = new QLineEdit();
        usernameInput.setPlaceholderText('admin');
        usernameInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        usernameInput.addEventListener('textChanged', text => this.username = text);
        //#endregion

        //#region - Password -
        const passwordLabel = new QLabel();
        passwordLabel.setText('Password:');
        const passwordInput = new QLineEdit();
        passwordInput.setPlaceholderText('Ab12345/');
        passwordInput.setEchoMode(EchoMode.Password);
        passwordInput.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Fixed);
        passwordInput.addEventListener('textChanged', text => this.password = text);
        //#endregion

        //#region - Generate User -
        this.generateUserButton = new QPushButton();
        this.generateUserButton.setText('Create User');
        this.generateUserButton.setInlineStyle('padding: 4px 8px;');
        this.generateUserButton.addEventListener('clicked', this.addUser);
        //#endregion

        //#region - Elements -
        const layout = new QGridLayout();
        this.elements = new QWidget();
        this.elements.setSizePolicy(QSizePolicyPolicy.Expanding, QSizePolicyPolicy.Expanding);
        this.elements.setLayout(layout);
        this.elements.setContentsMargins(8, 8, 8, 8);
        for (let i = 0; i < 3; i++)
            layout.setRowStretch(i, 0);
        layout.setColumnStretch(0, 0);
        layout.setColumnStretch(1, 1);
        layout.addWidget(title, 0, 0, 1, 2, AlignmentFlag.AlignTop | AlignmentFlag.AlignLeft);
        
        layout.addWidget(text, 1, 0, 1, 2, AlignmentFlag.AlignTop | AlignmentFlag.AlignLeft);

        layout.addWidget(usernameLabel, 2, 0, 1, 1);
        layout.addWidget(usernameInput, 2, 1, 1, 1);

        layout.addWidget(passwordLabel, 3, 0, 1, 1);
        layout.addWidget(passwordInput, 3, 1, 1, 1);

        layout.addWidget(this.generateUserButton, 4, 0, 1, 2, AlignmentFlag.AlignLeft);
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

    private validName = (name: string = ''): boolean =>
    /^[A-Za-z_]+$/.test(name);

    private validPassword = (password: string = ''): boolean => {
        if (password.length < 8) return false;

        const letterMatches = password.match(/[A-Za-z]/g) || [];
        if (letterMatches.length < 2) return false;

        const specialMatches = password.match(/[^A-Za-z0-9]/g) || [];
        if (specialMatches.length < 1) return false;

        return true;
    };
    
    private addUser = () => {
        if (
            !this.validName(this.username) ||
            !this.validPassword(this.password)
        ) return;

        this.generateUserButton.setDisabled(true);

        createOwnerUser(this.username!, this.password!)
            .then(() => {
                this.generateUserButton.setText('Done!');
                this.statusEventEmitter.emit('status', true);
            })
            .catch(() => this.generateUserButton.setText('Failed!'));
    };

    public getElements = () => this.elements;
};

export default CreateUserPage;
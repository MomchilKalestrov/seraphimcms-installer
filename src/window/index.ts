import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    Shape,
    QFrame,
    QLabel,
    Shadow,
    QPixmap,
    QWidget,
    QGridLayout,
    QMainWindow,
    QPushButton,
    AlignmentFlag,
    QIcon,
    QApplication
} from '@nodegui/nodegui';

import pages from '../pages/index.ts';
import type BasePage from '../lib/basePage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Window {
    private window: QMainWindow;
    private centralWidget: QWidget;
    private nextButton: QPushButton;
    private layout: QGridLayout;

    private currentPageIndex: number = 0;
    private currentPageInstance: BasePage | undefined;
    private currentPageWidget: QWidget | undefined;
    
    constructor () {
        //#region - Window -
        this.window = new QMainWindow();
        this.window.setWindowTitle('SeraphimCMS Installer');
        const iconPath = path.resolve(__dirname, '..', 'assets', 'icon.ico');
        const iconPixmap = new QPixmap();
        iconPixmap.load(iconPath);
        this.window.setWindowIcon(new QIcon(iconPixmap));
        this.window.setFixedSize(600, 400);
        this.centralWidget = new QWidget();
        this.window.setCentralWidget(this.centralWidget);
        const font = this.window.font();
        font.setPointSize(11);
        this.window.setFont(font);
        //#endregion

        //#region - Banner -
        const banner = new QLabel();
        const bannerPath = path.resolve(__dirname, '..', 'assets', 'banner.png');
        const bannerPixmap = new QPixmap();
        bannerPixmap.load(bannerPath);
        banner.setPixmap(bannerPixmap);
        banner.setFixedSize(150, 400);
        banner.move(0, 0);
        //#endregion

        //#region - Separator -
        const separator = new QFrame();
        separator.setFrameShape(Shape.HLine);
        separator.setFrameShadow(Shadow.Sunken)
        separator.setContentsMargins(0, 0, 0, 0);
        separator.setInlineStyle('border-bottom: 1px solid #888888;');
        //#endregion

        //#region - Next Button -
        this.nextButton = new QPushButton();
        this.nextButton.setText('Next');
        this.nextButton.setInlineStyle('margin: 8px; padding: 4px 8px;')
        this.nextButton.setDisabled(true);
        this.nextButton.addEventListener('clicked', this.onNextPageButtonClicked)
        //#endregion

        //#region - Layout -
        this.layout = new QGridLayout();
        this.centralWidget.setLayout(this.layout);
        this.layout.addWidget(banner, 0, 0, 2, 1, AlignmentFlag.AlignCenter);
        this.layout.addWidget(separator, 1, 1, 1, 1);
        this.layout.addWidget(this.nextButton, 2, 1, 1, 1, AlignmentFlag.AlignBottom | AlignmentFlag.AlignRight);
        this.layout.setColumnStretch(0, 0);
        this.layout.setColumnStretch(1, 1);
        this.layout.setRowStretch(0, 1);
        this.layout.setRowStretch(1, 0);
        this.layout.setRowStretch(2, 0);
        this.layout.setContentsMargins(0, 0, 0, 0);
        this.layout.setSpacing(0);
        //#endregion

        this.changePage(0);

        this.window.show();
    };

    changePage = (index: number) => {
        this.currentPageIndex = index;
        
        //this.nextButton.setEnabled(false);
        
        if (this.currentPageWidget) {
            this.layout.removeWidget(this.currentPageWidget);
            this.currentPageWidget.hide();
            this.currentPageWidget.close();
            this.currentPageWidget = undefined;
        };

        this.currentPageInstance?.off('status', this.onNextPageButtonStateChanged);
        this.currentPageInstance = new pages[ this.currentPageIndex ]!();
        this.currentPageInstance.on('status', this.onNextPageButtonStateChanged);

        this.currentPageWidget = this.currentPageInstance.getElements();
        this.currentPageWidget.setFixedWidth(450);
        this.layout.addWidget(this.currentPageWidget, 0, 1, 1, 1, AlignmentFlag.AlignTop | AlignmentFlag.AlignLeft);
        this.currentPageWidget.show();
    };

    onNextPageButtonStateChanged = (canProceed: boolean) =>
        this.nextButton.setEnabled(canProceed);
    
    onNextPageButtonClicked = () =>
        this.changePage(this.currentPageIndex + 1);
};

export default Window;
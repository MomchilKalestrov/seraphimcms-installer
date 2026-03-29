interface Locale {
    error: string;
    success: string;
    next: string;
    title: string;
    pages: {
        welcome: {
            title: string;
            sudoRequest: string;
            welcomeText: string;
        };
        setupEnvironment: {
            title: string;
            dbUrl: string;
            blobUrl: string;
            blobToken: string;
            domain: string;
        };
        setupContainer: {
            title: string;
            info: string;
            errors: {
                unsupportedInit: string;
                downloadFailed: string;
            };
            status: {
                downloading: string;
                loading: string;
                exposingPort: string;
                enablingService: string;
            };
        };
        installDocker: {
            title: string;
            info: string;
            alreadyInstalled: string;
            installPrompt: string;
            wait: string;
            errors: {
                unsupportedPackageManager: string;
                unsupportedInit: string;
            };
        };
        createUser: {
            title: string;
            info: string;
            username: string;
            password: string;
            createUser: string;
        };
        done: {
            title: string;
            info: string;
        };
    };
};

const locales: Record<string, Locale> = {
    'en-US': {
        error: 'Error: ',
        success: 'Done!',
        next: 'Next',
        title: 'SeraphimCMS Installer',
        pages: {
            welcome: {
                title: 'SeraphimCMS Installer',
                sudoRequest: /* html */
                    `<p>
                        Sorry, but this program requires elevated privilidges.<br />
                        Please try running as administrator if you're on Windows<br />
                        or with sudo if you're on Linux.
                    </p>`,
                welcomeText: /* html */
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
            },
            setupEnvironment: {
                title: 'Setup Environment',
                dbUrl: 'DB URL:',
                domain: 'Domain:',
                blobToken: 'Blob Token:',
                blobUrl: 'Blob URL:'
            },
            setupContainer: {
                title: 'Install container',
                info: 'The installer will now download and load the\nSeraphimCMS image.',
                status: {
                    downloading: 'Downloading...',
                    loading: 'Loading Docker image...',
                    exposingPort: 'Exposing port...',
                    enablingService: 'Enabling service...'
                },
                errors: {
                    downloadFailed: 'Failed to download SeraphimCMS Docker container.',
                    unsupportedInit: 'Unsupported init.'
                }
            },
            installDocker: {
                title: 'Install Docker',
                info: /* html */
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
                    </p>`,
                alreadyInstalled: 'Docker is already installed!',
                installPrompt: 'Install Docker',
                wait: 'Please wait...',
                errors: {
                    unsupportedPackageManager: 'Unsupported package manager!',
                    unsupportedInit: 'Unsupported init.'
                }
            },
            createUser: {
                title: 'Add owner user',
                username: 'Username:',
                password: 'Password:',
                info: /* html */
                    `<p>Set the administrator's username and password.</p>
                    <p>- The username must include only alphabetical characters.</p>
                    <p>
                        - The password must be 8 characters long, 2 alphabetical<br />
                        characters and 1 special character.
                    </p>`,
                createUser: 'Create user'
            },
            done: {
                title: 'Done',
                info: /* html */
                    `<p>The installation is complete.</p>
                    <p>You may now close this window.</p>`
            }
        }
    },
    'bg-BG': {
        error: 'Грешка: ',
        success: 'Готово!',
        next: 'Напред',
        title: 'Инсталатор на SeraphimCMS',
        pages: {
            welcome: {
                title: 'Инсталатор на SeraphimCMS',
                sudoRequest: /* html */
                    `<p>
                        Съжаляваме, но тази програма изисква повишени права.<br />
                        Моля, опитайте да я стартирате като администратор, ако сте на Windows<br />
                        или със sudo, ако сте на Linux.
                    </p>`,
                welcomeText: /* html */
                    `<p>
                        Добре дошли в съветника за инсталиране на SeraphimCMS.<br />
                        SeraphimCMS е self-hosted конструктор на уебсайтове. Този инструмент е<br />
                        предназначен да помогне с първоначалната настройка.
                    </p>
                    <p>
                        Проектът, заедно с този инсталатор, е лицензиран под<br />
                        GPLv3. Разработчиците на SeraphimCMS не носят<br />
                        отговорност за щети, възникнали по време на използването на<br />
                        SeraphimCMS. Можете да прочетете лиценза тук:
                    </p>
                    <p>
                        <a href="https://https://www.gnu.org/licenses/gpl-3.0.en.html">https://www.gnu.org/licenses/gpl-3.0.en.html</a>
                    </p>`
            },
            setupEnvironment: {
                title: 'Настройка на средата',
                dbUrl: 'URL на БД:',
                domain: 'Домейн:',
                blobToken: 'Blob Token:',
                blobUrl: 'Blob URL:'
            },
            setupContainer: {
                title: 'Инсталиране на контейнера',
                info: 'Инсталаторът сега ще изтегли и зареди\nизображението на SeraphimCMS.',
                status: {
                    downloading: 'Изтегляне...',
                    loading: 'Зареждане на Docker изображение...',
                    exposingPort: 'Отваряне на порт...',
                    enablingService: 'Активиране на услугата...'
                },
                errors: {
                    downloadFailed: 'Неуспешно изтегляне на Docker контейнера на SeraphimCMS.',
                    unsupportedInit: 'Неподдържан init.'
                }
            },
            installDocker: {
                title: 'Инсталиране на Docker',
                info: /* html */
                    `<p>
                        Първо трябва да инсталирате Docker. Docker Engine<br />
                        е лицензиран под Apache-2.0:
                    </p>
                    <p>
                        <a href="https://www.apache.org/licenses/LICENSE-2.0.txt">https://www.apache.org/licenses/LICENSE-2.0.txt</a>
                    </p>
                    <p>
                        <span style="font-weight: 500;">Забележка:</span> Docker Desktop също е необходим за Windows, за<br />
                        което ще трябва да се съгласите с EULA на Docker Desktop:
                    </p>
                    <p>
                        <a href="https://docs.docker.com/subscription/desktop-license/">https://docs.docker.com/subscription/desktop-license/</a>
                    </p>`,
                alreadyInstalled: 'Docker е вече инсталиран!',
                installPrompt: 'Инсталирай Docker',
                wait: 'Моля, изчакайте...',
                errors: {
                    unsupportedPackageManager: 'Неподдържан мениджър на пакети!',
                    unsupportedInit: 'Неподдържан init.'
                }
            },
            createUser: {
                title: 'Добавяне на потребител собственик',
                username: 'Потребителско име:',
                password: 'Парола:',
                info: /* html */
                    `<p>Задайте потребителското име и паролата на администратора.</p>
                    <p>- Потребителското име трябва да съдържа само букви.</p>
                    <p>
                        - Паролата трябва да е дълга 8 знака, 2 букви<br />
                        и 1 специален знак.
                    </p>`,
                createUser: 'Създай потребител'
            },
            done: {
                title: 'Done',
                info: /* html */
                    `<p>Инсталацията е готова.</p>
                    <p>Може да затворите този прозорец.</p>`
            }
        }
    }
};

const getLocale = (): Locale => {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    
    if (locale == 'fr-FR') throw 'French is not supported and never will :)';

    return locales[ locale ] ?? locales[ 'en-US' ]!;
};

export { locales };
export default getLocale();
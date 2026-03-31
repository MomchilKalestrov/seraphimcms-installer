***WARNING***: The repository has moved from GitHub to GitLab. The git repo will be moved to [here](https://gitlab.com/Momchil_Kalestrov/seraphimcms-installer.git).
For the near future, the GitHub repo will act as a mirror.

## SeraphimCMS Installer

This is the install wizard to configure and start SeraphimCMS. To find the main project, go [here](https://gitlab.com/Momchil_Kalestrov/seraphimcms.git).

## Building

### Requirements

It's important to use `npm`. I have tried to use `pnpm`, but `qode.js` and `nodegui` bug out and so does `pnpm`. Also, there is a `postInstall` script that replaces the `qode.js` module in the `node_modules`.

You will also need `gcc` if you're building for Linux and `mingw32` for Windows.

### Installing the dependencies

After you run `npm i`/ `npm install`, you will be prompted to select the platform you will be building for. The current options are Linux and Windows. This step replaces the `nodegui` and `qode.js` binaries with newer versions, since the ones hosted on the `npm` repo are extremely outdated.

### Building

If you are building for Windows use `npm run publish:win32`, or for Linux - `npm run publish:linux`.
***WARNING***: The repository has moved from GitHub to GitLab. The git repo will be moved to [here](https://gitlab.com/Momchil_Kalestrov/seraphimcms-installer.git).
For the near future, the GitHub repo will act as a mirror.

## SeraphimCMS Installer

This is the install wizard to configure and start SeraphimCMS. To find the main project, go [here](https://gitlab.com/Momchil_Kalestrov/seraphimcms.git).

## Building

### Requirements

It's important to use `npm`. I have tried to use `pnpm`, but the packages for `qode.js` and `nodegui` crash the install process.

Currently, Linux can compile both for Linux (using `gcc`) and Windows (using `x86_64-w64-mingw32-gcc`).
Unfortunately, Windows can only compile for Windows. To compile for Linux, use WSL2.

### Installing the dependencies

After you run `npm i`/ `npm install`, you will be prompted to select the platform you will be building for.
The current options are Linux and Windows. This step replaces the `nodegui` and `qode.js` binaries with the ones for
the target platform you've selected.

To change the target platform, run `npm i`/ `npm install` again and select a different platform.

### Building

Run `npm run publish`.
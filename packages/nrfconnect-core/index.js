/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

 'use strict';

const VERSION = '1.1';

const os = require('os');
const fs = require('fs');
const path = require('path');
const electron = require('electron');
const app = electron.app;

app.setPath('userData', path.join(app.getPath('appData'), 'nrfconnect'));
const settings = require('./settings');

global.keymap = path.join(app.getPath('userData'), 'keymap.cson');
global.userDataDir = app.getPath('userData');
global.appPath = app.getAppPath();

app.on('window-all-closed', function () {
    app.quit();
});

function createSplashScreen() {
    let splashScreen = new electron.BrowserWindow({
        width: 400,
        height: 223,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        transparent: true
    });
    splashScreen.loadURL('file://' + __dirname + '/resources/splashScreen.html');
    splashScreen.on('closed', function () {
        splashScreen = null;
    });
    splashScreen.show();
    return splashScreen;
}

function createBrowserWindow(options) {
    const lastWindowState = settings.loadLastWindow();
    const mergedOptions = Object.assign({
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        minWidth: 308,
        minHeight: 499,
        show: false,
        autoHideMenuBar: true,
    }, options);
    let browserWindow = new electron.BrowserWindow(mergedOptions);

    let splashScreen;
    if (options.splashScreen) {
        splashScreen = createSplashScreen();
    }

    browserWindow.loadURL(options.url);

    browserWindow.on('close', function () {
        if (options.keepWindowSettings !== false) {
            settings.storeLastWindow(browserWindow);
        }
    });

    browserWindow.on('closed', function () {
        browserWindow = null;
    });

    browserWindow.webContents.on('did-finish-load', function () {
        if (splashScreen && !splashScreen.isDestroyed()) {
            splashScreen.close();
        }

        if (lastWindowState.maximized) {
            browserWindow.maximize();
        }

        if (options.menu) {
            _createDefaultMenu();
        }

        let title = 'nRF Connect v' + VERSION;
        if (options.title) {
            title += ' - ' + options.title;
        }
        browserWindow.setTitle(title);
        browserWindow.show();
    });

    return browserWindow;
}

function _createDefaultMenu() {
    let template = [
        {
            label: '&File',
            submenu: [
                {
                    label: '&Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function () {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
            ],
        },
        {
            label: '&View',
            submenu: [
                {
                    label: '&Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    },
                },
                {
                    label: 'Toggle &Full Screen',
                    accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    },
                },
                {
                    label: 'Toggle &Developer Tools',
                    accelerator: process.platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    },
                },
            ],
        },
    ];

    if (process.platform == 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit();
                    },
                },
            ],
        });
    }

    let Menu = electron.Menu;
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


module.exports = {
    createBrowserWindow: createBrowserWindow
};

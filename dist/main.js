"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const electron_1 = require("electron");
const rxdb_1 = require("rxdb");
const leveldown_1 = __importDefault(require("leveldown"));
const nanoid_1 = require("nanoid");
const todoitems_schema_1 = require("./todoitems_schema");
// eslint-disable-next-line @typescript-eslint/no-var-requires
rxdb_1.addRxPlugin(require('pouchdb-adapter-leveldb'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
rxdb_1.addRxPlugin(require('pouchdb-adapter-http')); // enable syncing over http
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronConnect = require('electron-connect');
const syncServer = 'http://localhost';
let mainWindow;
let rxdb;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
electron_1.ipcMain.handle('persistent-store-dispatch', (event, action) => {
    switch (action.type) {
        case 'todoitem-put':
            action.payload.id = nanoid_1.nanoid();
            rxdb.collections.todoitems.atomicUpsert(action.payload);
            break;
        case 'todoitem-delete':
            rxdb.collections.todoitems.findOne().where('id').eq(action.payload.id).remove();
            break;
        default:
            break;
    }
});
const initRenderer = async () => {
    mainWindow.show();
    rxdb = await initDb();
    // load initial data
    const documents = (await rxdb.collections.todoitems.find().exec());
    documents.forEach(doc => {
        mainWindow.webContents.send('persistent-store-updated', doc.toJSON());
    });
    /*
    db.collections.todoitems.insert({
      id: nanoid(),
      title: 'Rip my CDs',
      completed: false,
    });
    */
};
const initDb = async () => {
    const collections = [
        {
            name: 'todoitems',
            schema: todoitems_schema_1.todoItemsRxSchema,
            sync: true,
        },
    ];
    const syncURL = `${syncServer}:10102/`;
    console.log('host: ' + syncURL);
    console.log('DatabaseService: creating database..');
    const db = await rxdb_1.createRxDatabase({
        name: 'persistent_data/todoitemsdb',
        adapter: leveldown_1.default,
    });
    console.log('DatabaseService: created database');
    // create collections
    console.log('DatabaseService: create collections');
    // Create all collections by one line
    await Promise.all(collections.map(colData => db.collection(colData)));
    // hooks
    console.log('DatabaseService: add hooks');
    /*  db.collections.todoitems.preInsert(docObj => {
      const { color } = docObj;
      return db.collections.heroes
        .findOne()
        .where('color')
        .eq(color)
        .exec()
        .then(has => {
          if (has != null) {
            throw new Error('color already there');
          }
          return db;
        })
        .catch(e => console.error(e));
    }, false);
  */
    db.collections.todoitems.$.subscribe(changeEvent => {
        // insert, update, delete
        if (changeEvent.operation === 'INSERT') {
            const payload = changeEvent.documentData;
            mainWindow.webContents.send('persistent-store-updated', payload);
        }
        else if (changeEvent.operation === 'DELETE') {
            mainWindow.webContents.send('persistent-store-deleted', changeEvent.documentData.id);
        }
    });
    // sync
    console.log('DatabaseService: sync');
    // Set sync() to all collections by one line
    collections
        .filter(col => col.sync)
        .map(col => col.name)
        .map(colName => db[colName].sync({
        remote: syncURL + colName + '/',
    }));
    return db;
};
const init = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            sandbox: true,
            contextIsolation: true,
        },
        height: 600,
        width: 800,
        show: false,
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // hot reload
    if (!electron_1.app.isPackaged && process.env.NODE_ENV === 'development') {
        electronConnect.client.create(mainWindow);
        mainWindow.webContents.openDevTools();
    }
    mainWindow.once('ready-to-show', initRenderer);
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on('ready', init);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        init();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
//# sourceMappingURL=main.js.map
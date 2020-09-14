import * as path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { addRxPlugin, createRxDatabase, RxDatabase, RxDocument } from 'rxdb';
import leveldown from 'leveldown';
import { nanoid } from 'nanoid';
import { todoItemsRxSchema } from './todoitems_schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
addRxPlugin(require('pouchdb-adapter-leveldb'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
addRxPlugin(require('pouchdb-adapter-http')); // enable syncing over http
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electronConnect = require('electron-connect');

const syncServer = 'http://localhost';

let mainWindow: BrowserWindow;
let rxdb: RxDatabase;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

ipcMain.handle('persistent-store-dispatch', (event, action) => {
  switch (action.type) {
    case 'todoitem-put':
      action.payload.id = nanoid();
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
  const documents = (await rxdb.collections.todoitems.find().exec()) as RxDocument[];
  documents.forEach(doc => {
    mainWindow.webContents.send('persistent-store-updated', doc.toJSON());
  });
};

const initDb = async (): Promise<RxDatabase> => {
  const collections = [
    {
      name: 'todoitems',
      schema: todoItemsRxSchema,
      sync: true, // flag whether using http sync or not
    },
  ];
  const syncURL = `${syncServer}:10102/`;
  console.log('host: ' + syncURL);

  console.log('DatabaseService: creating database..');
  const db = await createRxDatabase({
    name: 'persistent_data/todoitemsdb',
    adapter: leveldown,
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
    .map(colName =>
      db[colName].sync({
        remote: syncURL + colName + '/',
      })
    );

  return db;
};

const init = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    electronConnect.client.create(mainWindow);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', initRenderer);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    init();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

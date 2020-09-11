interface WindowWithAPI extends Window {
  api: {
    persistentStoreDispatch: (action: any) => Promise<void>;
  };
}
declare const window: WindowWithAPI;
export default window;

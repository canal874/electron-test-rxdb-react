interface WindowWithAPI extends Window {
  api: {
    fromRenderer: (message: string) => Promise<void>;
  };
}
declare const window: WindowWithAPI;
export default window;

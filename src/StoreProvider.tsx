import * as React from 'react';
import { TodoItemsState } from './todoitems_schema';
import window from './window';
import { PersistentStoreAction } from './store.types';

// 'TodoItemsState' is used both Main process and this Renderer process.
// ! Notice that it is not shared with Main and Renderer processes by reference,
// ! but individually bound to each process.
export type GlobalProvider = [TodoItemsState, (action: PersistentStoreAction) => void];
export const GlobalContext = React.createContext<TodoItemsState | any>(
  {} as TodoItemsState
);

/**
 * StoreProvider
 */
export const StoreProvider = (props: { children: React.ReactNode }) => {
  const [todoItemsState, localDispatch] = React.useState({} as TodoItemsState);
  // ! Proxy
  // Dispatcher to Main process
  const persistentStoreDispatch = (action: PersistentStoreAction) => {
    // IPC
    window.api.persistentStoreDispatch(action);
  };

  React.useEffect(() => {
    // Add listener that is invoked when global store in Main process is changed
    const dispatch = (event: MessageEvent) => {
      if (event.source !== window || !event.data.command) return;
      const id = event.data.payload.id;
      const payload = event.data.payload;
      const newState = JSON.parse(JSON.stringify(todoItemsState));
      switch (event.data.command) {
        case 'persistent-store-updated':
          // Copy persistentStoreState from Main process to this Renderer process
          newState[id] = payload;
          localDispatch(newState);
          break;
        default:
          break;
      }
    };
    // Receive message from Main process via preload
    window.addEventListener('message', dispatch);
    const cleanup = () => {
      window.removeEventListener('message', dispatch);
    };
    return cleanup;
  }, []);

  return (
    <GlobalContext.Provider value={[todoItemsState, persistentStoreDispatch]}>
      {props.children}
    </GlobalContext.Provider>
  );
};

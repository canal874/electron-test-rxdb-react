import * as React from 'react';
import { TodoItemsState } from '../modules_common/todoitems_schema';
import window from './window';
import { PersistentStoreAction } from '../modules_common/store.types';

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

  // ! Use localDispatch(latestState => newState) to refer latest state.
  // If not so, todoItemState is not updated.
  React.useEffect(() => {
    const dispatch = (event: MessageEvent) => {
      if (event.source !== window || !event.data.command) return;
      const id = event.data.payload.id;
      const payload = event.data.payload;
      switch (event.data.command) {
        case 'persistent-store-updated':
          // Copy persistentStoreState from Main process to this Renderer process
          localDispatch(latestState => {
            const newState = { ...latestState };
            newState[id] = payload;
            return newState;
          });
          break;
        case 'persistent-store-deleted':
          // Copy persistentStoreState from Main process to this Renderer process
          localDispatch(latestState => {
            const newState = { ...latestState };
            delete newState[payload];
            return newState;
          });
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

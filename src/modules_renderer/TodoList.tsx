import * as React from 'react';
import './App.css';
import { GlobalContext, GlobalProvider } from './StoreProvider';

export interface AppProps {
  title: string;
  author: string;
}

export const TodoList = () => {
  const [todoItemsState, persistentStoreDispatch] = React.useContext(
    GlobalContext
  ) as GlobalProvider;
  const handleClickNewButton = () => {
    persistentStoreDispatch({
      type: 'todoitem-put',
      payload: {
        id: '',
        title: 'Rip my CD ',
        updatedAt: Date.now(),
        completed: false,
      },
    });
  };
  const handleClickDeleteButton = (id: string) => {
    persistentStoreDispatch({
      type: 'todoitem-delete',
      payload: id,
    });
  };
  const list = Object.keys(todoItemsState).map(item => {
    return (
      <li>
        {todoItemsState[item].title}({todoItemsState[item].id}){' '}
        <button
          onClick={() => {
            handleClickDeleteButton(todoItemsState[item].id);
          }}
        >
          delete
        </button>
      </li>
    );
  });
  return (
    <div>
      Todo List
      <br />
      <ul>{list}</ul>
      <div>
        Insert New
        <br />
        <button onClick={handleClickNewButton}>New</button>
      </div>
    </div>
  );
};

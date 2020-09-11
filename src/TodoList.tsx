import * as React from 'react';
import './App.css';
import { GlobalContext, GlobalProvider } from './StoreProvider';

export interface AppProps {
  title: string;
  author: string;
}

export const TodoList = () => {
  const [todoItemsState, globalDispatch] = React.useContext(
    GlobalContext
  ) as GlobalProvider;
  const list = Object.keys(todoItemsState).map(item => {
    return <li>{todoItemsState[item].title}</li>;
  });
  return (
    <div>
      Todo List
      <br />
      <ul>{list}</ul>
    </div>
  );
};

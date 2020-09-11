import * as React from 'react';
import './App.css';
import { StoreProvider } from './StoreProvider';
import { TodoList } from './TodoList';

export const App = () => {
  return (
    <div styleName='app'>
      <StoreProvider>
        <TodoList></TodoList>
      </StoreProvider>
    </div>
  );
};

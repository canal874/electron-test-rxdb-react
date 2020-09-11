import { TodoItemsState } from './todoitems_schema';

export type TodoItemPutAction = {
  type: 'todoitem-put';
  payload: TodoItemsState;
};

export type TodoItemTitlePutAction = {
  type: 'todoitem-put';
  payload: string;
};

export type TodoItemCompletedPutAction = {
  type: 'todoitem-completed-put';
  payload: boolean;
};

export type PersistentStoreAction =
  | TodoItemPutAction
  | TodoItemTitlePutAction
  | TodoItemCompletedPutAction;

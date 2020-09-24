import { TodoItem } from './todoitems_schema';

export type TodoItemPutAction = {
  type: 'todoitem-put';
  payload: TodoItem;
};

export type TodoItemDeleteAction = {
  type: 'todoitem-delete';
  payload: string;
};

export type PersistentStoreAction = TodoItemPutAction | TodoItemDeleteAction;

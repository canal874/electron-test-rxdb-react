export type TodoItem = {
  id: string;
  title: string;
  updatedAt: number;
  completed: boolean;
};

export type TodoItemsState = Record<string, TodoItem>;

export const todoItemsRxSchema = {
  title: 'todoitems schema',
  description: 'RxSchema for todo list items',
  version: 0,
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true,
    },
    title: {
      type: 'string',
    },
    completed: {
      type: 'boolean',
    },
    updatedAt: {
      type: 'number',
    },
  },
  required: ['title', 'completed'],
};

export const graphQLGenerationInput = {
  todo: {
    schema: todoItemsRxSchema,
    feedKeys: ['id', 'updatedAt'],
    deletedFlag: 'deleted',
  },
};

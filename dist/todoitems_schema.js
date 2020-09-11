"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoItemsRxSchema = void 0;
exports.todoItemsRxSchema = {
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
    },
    required: ['title', 'completed'],
};
//# sourceMappingURL=todoitems_schema.js.map
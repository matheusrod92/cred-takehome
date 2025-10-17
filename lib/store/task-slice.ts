import type { StateCreator } from "zustand";
import type { Action, Task } from "../types";
import type { ColumnSlice } from "./column-slice";

export type TaskSlice = {
  tasks: Record<string, Task>;
  maxTaskOrder: Record<string, number>;
  addTask: (columnId: string, title: string, description?: string) => void;
  updateTaskTitle: (taskId: string, title: string) => void;
  updateTaskDescription: (taskId: string, description: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newOrder: number,
  ) => void;
  deleteTasksInColumn: (columnId: string) => void;
  reorderTask: (columnId: string, taskId: string, newOrder: number) => void;
};

const createAction = (
  type: Action["type"],
  columnId?: string,
  columnTitle?: string,
  fromColumnId?: string,
  fromColumnTitle?: string,
): Action => ({
  id: crypto.randomUUID(),
  type,
  timestamp: new Date(),
  columnId,
  columnTitle,
  fromColumnId,
  fromColumnTitle,
});

export const createTaskSlice: StateCreator<
  TaskSlice & ColumnSlice,
  [],
  [],
  TaskSlice
> = (set) => ({
  tasks: {},
  maxTaskOrder: {
    "5947800a-0d6e-41c8-9f4e-4e8b0fa24a41": 0,
    "574d7a0d-da2d-47b4-9747-6ffa22a3c807": 0,
    "14055358-d551-460f-aac5-57ad791d7775": 0,
  },

  addTask: (columnId: string, title: string, description?: string) => {
    set((state) => {
      const column = state.columns[columnId];
      if (!column) return state;

      const taskId = crypto.randomUUID();
      const now = new Date();

      const newTask: Task = {
        id: taskId,
        title,
        description,
        columnId,
        actions: [createAction("CREATE", columnId, column.title)],
        order: state.maxTaskOrder[columnId] + 1,
        createdAt: now,
      };

      return {
        tasks: {
          ...state.tasks,
          [taskId]: newTask,
        },
        maxTaskOrder: {
          ...state.maxTaskOrder,
          [columnId]: state.maxTaskOrder[columnId] + 1,
        },
      };
    });
  },

  updateTaskTitle: (taskId: string, title: string) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const now = new Date();
      const updatedTask: Task = {
        ...task,
        title,
        actions: [...task.actions, createAction("UPDATE_TITLE")],
        updatedAt: now,
      };

      return {
        tasks: {
          ...state.tasks,
          [taskId]: updatedTask,
        },
      };
    });
  },

  updateTaskDescription: (taskId: string, description: string) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const now = new Date();
      const updatedTask: Task = {
        ...task,
        description,
        actions: [...task.actions, createAction("UPDATE_DESCRIPTION")],
        updatedAt: now,
      };

      return {
        tasks: {
          ...state.tasks,
          [taskId]: updatedTask,
        },
      };
    });
  },

  deleteTask: (taskId: string) => {
    set((state) => {
      const remainingTasks = { ...state.tasks };
      delete remainingTasks[taskId];

      return {
        tasks: remainingTasks,
      };
    });
  },

  moveTask: (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newOrder: number,
  ) => {
    set((state) => {
      const fromColumn = state.columns[fromColumnId];
      const toColumn = state.columns[toColumnId];
      if (!fromColumn || !toColumn) return state;

      const task = state.tasks[taskId];
      if (!task) return state;

      const now = new Date();

      const toColumnTasks = Object.values(state.tasks).filter(
        (t) => t.columnId === toColumnId && t.id !== taskId,
      );

      const adjustedTasks: Record<string, Task> = {};
      for (const t of toColumnTasks) {
        if (t.order >= newOrder) {
          adjustedTasks[t.id] = { ...t, order: t.order + 1 };
        } else {
          adjustedTasks[t.id] = t;
        }
      }

      const movedTask: Task = {
        ...task,
        columnId: toColumnId,
        order: newOrder,
        actions: [
          ...task.actions,
          createAction(
            "MOVED_TO_COLUMN",
            toColumnId,
            toColumn.title,
            fromColumnId,
            fromColumn.title,
          ),
        ],
        updatedAt: now,
      };

      const newMaxTaskOrder = {
        ...state.maxTaskOrder,
      };

      if (newOrder > newMaxTaskOrder[toColumnId]) {
        newMaxTaskOrder[toColumnId] = newOrder;
      }

      return {
        tasks: {
          ...state.tasks,
          ...adjustedTasks,
          [taskId]: movedTask,
        },
        maxTaskOrder: newMaxTaskOrder,
      };
    });
  },

  deleteTasksInColumn: (columnId: string) => {
    set((state) => {
      const remainingTasks = { ...state.tasks };
      const tasks = Object.values(remainingTasks).filter(
        (task) => task.columnId === columnId,
      );

      for (const task of tasks) {
        delete remainingTasks[task.id];
      }

      return {
        tasks: remainingTasks,
      };
    });
  },

  reorderTask: (columnId: string, taskId: string, newOrder: number) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const oldOrder = task.order;
      if (oldOrder === newOrder) return state;

      const columnTasks = Object.values(state.tasks).filter(
        (t) => t.columnId === columnId,
      );

      const adjustedTasks: Record<string, Task> = {};
      for (const t of columnTasks) {
        if (t.id === taskId) {
          adjustedTasks[t.id] = { ...t, order: newOrder };
        } else if (oldOrder < newOrder) {
          if (t.order > oldOrder && t.order <= newOrder) {
            adjustedTasks[t.id] = { ...t, order: t.order - 1 };
          } else {
            adjustedTasks[t.id] = t;
          }
        } else {
          if (t.order >= newOrder && t.order < oldOrder) {
            adjustedTasks[t.id] = { ...t, order: t.order + 1 };
          } else {
            adjustedTasks[t.id] = t;
          }
        }
      }

      const newMaxTaskOrder = {
        ...state.maxTaskOrder,
      };

      if (newOrder > newMaxTaskOrder[columnId]) {
        newMaxTaskOrder[columnId] = newOrder;
      }

      return {
        tasks: {
          ...state.tasks,
          ...adjustedTasks,
        },
        maxTaskOrder: newMaxTaskOrder,
      };
    });
  },
});

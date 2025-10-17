import type { StateCreator } from "zustand";
import type { Column } from "../types";
import type { TaskSlice } from "./task-slice";

export type ColumnSlice = {
  columns: Record<string, Column>;
  maxColumnOrder: number;
  addColumn: (title: string) => void;
  deleteColumn: (columnId: string) => void;
};

export const createColumnSlice: StateCreator<
  ColumnSlice & TaskSlice,
  [],
  [],
  ColumnSlice
> = (set, get) => ({
  columns: {
    "5947800a-0d6e-41c8-9f4e-4e8b0fa24a41": {
      id: "5947800a-0d6e-41c8-9f4e-4e8b0fa24a41",
      title: "To-Do",
      order: 0,
      createdAt: new Date(),
    },
    "574d7a0d-da2d-47b4-9747-6ffa22a3c807": {
      id: "574d7a0d-da2d-47b4-9747-6ffa22a3c807",
      title: "In Progress",
      order: 1,
      createdAt: new Date(),
    },
    "14055358-d551-460f-aac5-57ad791d7775": {
      id: "14055358-d551-460f-aac5-57ad791d7775",
      title: "Done",
      order: 2,
      createdAt: new Date(),
    },
  },

  maxColumnOrder: 2,

  addColumn: (title: string) => {
    set((state) => {
      const columnId = crypto.randomUUID();
      const now = new Date();

      const newColumn: Column = {
        id: columnId,
        title,
        order: state.maxColumnOrder + 1,
        createdAt: now,
      };

      return {
        columns: {
          ...state.columns,
          [columnId]: newColumn,
        },
        maxColumnOrder: state.maxColumnOrder + 1,
        maxTaskOrder: { ...state.maxTaskOrder, [columnId]: 0 },
      };
    });
  },

  deleteColumn: (columnId: string) => {
    set((state) => {
      const remainingColumns = { ...state.columns };
      delete remainingColumns[columnId];
      get().deleteTasksInColumn(columnId);

      return {
        columns: remainingColumns,
      };
    });
  },
});

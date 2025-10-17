import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ColumnSlice, createColumnSlice } from "./column-slice";
import { createTaskSlice, type TaskSlice } from "./task-slice";

type StoreState = ColumnSlice & TaskSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createColumnSlice(...a),
      ...createTaskSlice(...a),
    }),
    {
      name: "kanban-board-storage",
    },
  ),
);

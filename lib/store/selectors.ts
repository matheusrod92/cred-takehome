import type { Task } from "../types";
import { useStore } from "./index";

export const useColumnTasks = (columnId: string): Task[] => {
  const tasks = useStore((state) => state.tasks);

  return Object.values(tasks)
    .filter((task) => task.columnId === columnId)
    .sort((a, b) => a.order - b.order);
};

export const useTask = (taskId: string): Task | undefined => {
  const tasks = useStore((state) => state.tasks);
  return tasks[taskId];
};

export const useSearchTasks = (keyword: string): Task[] => {
  const tasks = useStore((state) => state.tasks);
  if (!keyword.trim()) return [];

  const lowerKeyword = keyword.toLowerCase();

  return Object.values(tasks).filter(
    (task) =>
      task.title.toLowerCase().includes(lowerKeyword) ||
      task.description?.toLowerCase().includes(lowerKeyword),
  );
};

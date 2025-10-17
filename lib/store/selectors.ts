import type { Task } from "../types";
import { useStore } from "./index";

export const useColumnTasks = (
  columnId: string,
  searchKeyword?: string,
): Task[] => {
  const tasks = useStore((state) => state.tasks);

  return Object.values(tasks)
    .filter((task) => task.columnId === columnId)
    .filter((task) => {
      if (!searchKeyword) return true;
      const lowerKeyword = searchKeyword.toLowerCase();
      return (
        task.title.toLowerCase().includes(lowerKeyword) ||
        task.description?.toLowerCase().includes(lowerKeyword)
      );
    })
    .sort((a, b) => a.order - b.order);
};

export const useTask = (taskId: string): Task | undefined => {
  const tasks = useStore((state) => state.tasks);
  return tasks[taskId];
};

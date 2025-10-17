"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useColumnTasks } from "@/lib/store/selectors";
import type { Column as ColumnType } from "@/lib/types";
import { AddTaskDialog } from "./add-task-dialog";
import { Task } from "./task";

type ColumnProps = {
  column: ColumnType;
  activeTaskColumnId: string | null;
  searchKeyword?: string;
};

export function Column({
  column,
  activeTaskColumnId,
  searchKeyword,
}: ColumnProps) {
  const deleteColumn = useStore((state) => state.deleteColumn);
  const tasks = useColumnTasks(column.id, searchKeyword);

  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.id}`,
  });

  const handleDeleteColumn = () => {
    deleteColumn(column.id);
    toast.success("Column deleted");
  };

  const isDraggingFromDifferentColumn =
    !!activeTaskColumnId && activeTaskColumnId !== column.id;
  const showDropIndicator = isOver && isDraggingFromDifferentColumn;

  const taskIds = tasks.map((task) => `${task.id}:${column.id}`);

  return (
    <Card className="flex w-60 md:w-80 flex-shrink-0 flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{column.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleDeleteColumn}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div ref={setNodeRef} className="flex-1 space-y-2 overflow-y-auto">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                columnId={column.id}
                isDraggingFromDifferentColumn={isDraggingFromDifferentColumn}
              />
            ))}
          </SortableContext>
          {showDropIndicator && (
            <div className="h-1 w-full rounded-full bg-blue-500" />
          )}
        </div>
        <AddTaskDialog columnId={column.id}>
          <Button variant="outline" className="w-full">
            Add Task
          </Button>
        </AddTaskDialog>
      </CardContent>
    </Card>
  );
}

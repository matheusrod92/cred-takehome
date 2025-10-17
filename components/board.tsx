"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { Task as TaskType } from "@/lib/types";

import { AddColumnDialog } from "./add-column-dialog";
import { Column } from "./column";
import { Task } from "./task";

export function Board() {
  const columns = useStore((state) => state.columns);
  const tasks = useStore((state) => state.tasks);
  const maxTaskOrder = useStore((state) => state.maxTaskOrder);
  const moveTask = useStore((state) => state.moveTask);
  const reorderTask = useStore((state) => state.reorderTask);

  const [activeTask, setActiveTask] = useState<{
    task: TaskType;
    columnId: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const sortedColumns = Object.values(columns).sort(
    (a, b) => a.order - b.order,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const [taskId, columnId] = (active.id as string).split(":");

    const task = tasks[taskId];
    if (!task) return;

    setActiveTask({ task, columnId });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const [activeTaskId, activeColumnId] = (active.id as string).split(":");
    const overId = over.id as string;

    if (overId.startsWith("column:")) {
      const overColumnId = overId.replace("column:", "");

      if (activeColumnId !== overColumnId) {
        const newOrder = maxTaskOrder[overColumnId] + 1;

        moveTask(activeTaskId, activeColumnId, overColumnId, newOrder);
      }
    } else {
      const [overTaskId, overColumnId] = overId.split(":");
      const overTask = tasks[overTaskId];

      if (activeColumnId === overColumnId) {
        if (activeTaskId !== overTaskId) {
          reorderTask(overColumnId, activeTaskId, overTask.order);
        }
      } else {
        moveTask(activeTaskId, activeColumnId, overColumnId, overTask.order);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen w-full gap-4 overflow-x-auto p-8">
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            activeTaskColumnId={activeTask?.columnId ?? null}
          />
        ))}
        <div className="flex-shrink-0">
          <AddColumnDialog>
            <Button variant="outline" className="w-80">
              Add Column
            </Button>
          </AddColumnDialog>
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-50">
            <Task
              task={activeTask.task}
              columnId={activeTask.columnId}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

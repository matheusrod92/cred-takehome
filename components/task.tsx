"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import type { Task as TaskType } from "@/lib/types";
import { TaskDetailsDialog } from "./task-details-dialog";

type TaskProps = {
  task: TaskType;
  columnId: string;
  isDragging?: boolean;
  isDraggingFromDifferentColumn?: boolean;
};

export function Task({
  task,
  columnId,
  isDragging = false,
  isDraggingFromDifferentColumn = false,
}: TaskProps) {
  const updateTaskTitle = useStore((state) => state.updateTaskTitle);
  const deleteTask = useStore((state) => state.deleteTask);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
    isOver,
  } = useSortable({
    id: `${task.id}:${columnId}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      updateTaskTitle(task.id, editedTitle.trim());
      toast.success(`New title: "${editedTitle.trim()}"`);
    } else {
      setEditedTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleCardClick = () => {
    if (!isEditingTitle) {
      setDetailsOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
    toast.success("Task deleted successfully");
  };

  if (isDragging) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{task.title}</CardTitle>
          {task.description && (
            <CardDescription className="text-xs">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    );
  }

  const showDropIndicator = isOver && isDraggingFromDifferentColumn;

  return (
    <>
      {showDropIndicator && (
        <div className="h-1 w-full rounded-full bg-blue-500" />
      )}
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            {isEditingTitle ? (
              <Input
                ref={inputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <CardTitle
                className="cursor-text text-sm"
                onClick={handleTitleClick}
              >
                {task.title}
              </CardTitle>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {task.description && (
            <CardDescription className="text-xs">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
      <TaskDetailsDialog
        key={task.title}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        taskId={task.id}
      />
    </>
  );
}

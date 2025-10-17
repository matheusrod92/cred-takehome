"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

type TaskDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
};

export function TaskDetailsDialog({
  open,
  onOpenChange,
  taskId,
}: TaskDetailsDialogProps) {
  const task = useStore((state) => state.tasks[taskId]);
  const updateTaskTitle = useStore((state) => state.updateTaskTitle);
  const updateTaskDescription = useStore(
    (state) => state.updateTaskDescription,
  );

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    if (title.trim() !== task.title) {
      updateTaskTitle(task.id, title.trim());
    }

    if (description.trim() !== (task.description || "")) {
      updateTaskDescription(task.id, description.trim());
    }

    onOpenChange(false);
  };

  const lastFiveActions = task.actions.slice(-5).reverse();

  const formatActionText = (action: Task["actions"][0]) => {
    switch (action.type) {
      case "CREATE":
        return action.columnTitle
          ? `Created in ${action.columnTitle}`
          : "Created";
      case "UPDATE_TITLE":
        return "Title updated";
      case "UPDATE_DESCRIPTION":
        return "Description updated";
      case "MOVED_TO_COLUMN":
        if (action.fromColumnTitle && action.columnTitle) {
          return `Moved from ${action.fromColumnTitle} to ${action.columnTitle}`;
        }
        return "Moved to another column";
      case "DELETE":
        return "Deleted";
      default:
        return action.type;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Recent Actions (Last 5)</Label>
            <ScrollArea className="h-40 rounded-md border p-4">
              {lastFiveActions.length > 0 ? (
                <div className="space-y-2">
                  {lastFiveActions.map((action) => (
                    <div key={action.id} className="text-sm">
                      <div className="font-medium">
                        {formatActionText(action)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(action.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No actions recorded
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

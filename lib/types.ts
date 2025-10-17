export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type ActionType =
  | "CREATE"
  | "UPDATE_DESCRIPTION"
  | "UPDATE_TITLE"
  | "DELETE";

export type Action = {
  id: UUID;
  type: ActionType;
  timestamp: Date;
};

export type Task = {
  id: UUID;
  title: string;
  description?: string;
  actions: Action[];
  order: number;
  createdAt: Date;
  updatedAt?: Date;
};

export type Column = {
  id: UUID;
  title: string;
  tasks: Record<Task["id"], Task>;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
};

export type Board = {
  id: UUID;
  columns: Record<Column["id"], Column>;
  createdAt: Date;
  updatedAt?: Date;
};

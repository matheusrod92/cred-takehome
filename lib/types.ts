export type ActionType =
  | "CREATE"
  | "UPDATE_DESCRIPTION"
  | "UPDATE_TITLE"
  | "MOVED_TO_COLUMN"
  | "DELETE";

export type Action = {
  id: string;
  type: ActionType;
  timestamp: Date;
  columnId?: string;
  columnTitle?: string;
  fromColumnId?: string;
  fromColumnTitle?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  actions: Action[];
  order: number;
  createdAt: Date;
  updatedAt?: Date;
};

export type Column = {
  id: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
};

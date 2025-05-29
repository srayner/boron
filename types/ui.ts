export type DeletableType = "project" | "task" | "milestone" | "cost";

interface DeletableItem {
  id: string;
  name: string;
}

export interface DeleteInfo {
  type: DeletableType;
  item: DeletableItem;
}

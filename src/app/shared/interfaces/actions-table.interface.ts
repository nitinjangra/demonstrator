import { Priority } from "../enums/priority.enum";

export interface ActionTableRow {
  id: number;
  entityName: string;
  entityId: string;
  dueDate: Date | string | null;
  priority?: Priority;
}

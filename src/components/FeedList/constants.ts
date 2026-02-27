import type { Feed } from "../../api/types";
import type { ColumnDefinition } from "./types";

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  {
    id: "id",
    label: "ID",
    comparator: (a: Feed, b: Feed) => {
      if (a.id > b.id) {
        return 1;
      } else if (a.id < b.id) {
        return -1;
      }
      return 0;
    },
  },
  {
    id: "name",
    label: "Name",
    comparator: (a: Feed, b: Feed) => a.name.localeCompare(b.name),
  },
  {
    id: "created",
    label: "Created",
    comparator: (a: Feed, b: Feed) =>
      new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime(),
  },
  {
    id: "creator",
    label: "Creator",
    comparator: (a: Feed, b: Feed) =>
      a.owner_username.localeCompare(b.owner_username),
  },
  {
    id: "status",
    label: "Status",
    /**
     * Cannot sort by progress since details are loaded at row level
     */
    comparator: (_a: Feed, _b: Feed) => 0,
  },
];

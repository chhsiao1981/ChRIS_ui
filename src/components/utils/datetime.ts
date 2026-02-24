import { format } from "date-fns";
import type { Datetime } from "../../api/types";

export const formatDate = (theDate: Datetime) => {
  return format(new Date(theDate), "dd MMM yyyy, HH:mm");
};

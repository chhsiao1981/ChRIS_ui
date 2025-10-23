import { useQuery } from "@tanstack/react-query";
import fetchFeedForPath from "./fetchFeedForPath";

export default (folderPath: string) => {
  return useQuery({
    queryKey: ["associatedData", folderPath],
    queryFn: async () => {
      const data = await fetchFeedForPath(folderPath);
      if (!data) {
        return null;
      }
      return data.name;
    },
  });
};

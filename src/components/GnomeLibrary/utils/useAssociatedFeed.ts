import fetchFeedForPath from "./fetchFeedForPath";

export default async (folderPath: string) => {
  const data = await fetchFeedForPath(folderPath);
  if (!data) {
    return;
  }
  return data?.name;
};

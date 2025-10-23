import { getData } from "../../../api/serverApi";

export default async (path: string) => {
  const dataMatches = path.match(/feed_(\d+)/);
  const idStr = dataMatches ? dataMatches[1] : "";

  if (!idStr) {
    return null;
  }

  const id = parseInt(idStr);
  const { status, data, errmsg } = await getData(id);
  if (!data) throw new Error("Failed to fetch the feed");
  return data;
};

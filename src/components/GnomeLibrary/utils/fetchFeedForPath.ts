import { getData } from "../../../api/serverApi";

export default async (path: string) => {
  const dataMatches = path.match(/feed_(\d+)/);
  const id = dataMatches ? parseInt(dataMatches[1]) : null;

  if (!id) {
    return null;
  }

  const { status, data, errmsg } = await getData(id);
  if (!data) throw new Error("Failed to fetch the feed");
  return data;
};

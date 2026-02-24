import type { ID } from "../api/types";

export const collectionJsonToJson = (
  theData: any,
  isLink = false,
  isList = false,
  prompt = "",
) => {
  try {
    if (isLink) {
      return collectionJsonLinkToJson(theData.collection.links);
    }
    const ret = theData.collection.items.map(collectionJsonItemToJson);
    if (isList) {
      const next = collectionJsonGetNext(theData);
      return { list: ret, count: theData.collection.total, next: next };
    }

    return typeof theData.collection.total === "undefined" ? ret[0] : ret;
  } catch (error) {
    console.error("collectionJsonToJson: error: prompt:", prompt, "e:", error);
  }
};

const collectionJsonItemToJson = (item: any) =>
  item.data.reduce((r: any, x: any) => {
    const { name, value } = x;
    r[name] = value;
    return r;
  }, {});

const collectionJsonLinkToJson = (links: any[]) => {
  return links.reduce((r: any, x: any) => {
    const key = x.rel;
    const link = x.href;
    r[key] = link;
    return r;
  }, {});
};

const collectionJsonGetNext = (theData: any): ID => {
  const theLink = collectionJsonLinkToJson(theData.collection.links);
  const nextURL = theLink.next || "";
  if (!nextURL) {
    return "";
  }
  const theMatch = nextURL.match(/offset=(\d+)/);
  if (!theMatch) {
    return "";
  }
  // biome-ignore lint/correctness/useParseIntRadix: no need to parseIntRadix
  return Number.parseInt(theMatch[1]);
};

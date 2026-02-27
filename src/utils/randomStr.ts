import { parse as uuidparse, v4 as uuidv4 } from "uuid";

export const randomStr = () => {
  const theBytes = uuidparse(uuidv4());
  return theBytes.toBase64().slice(0, 22);
};

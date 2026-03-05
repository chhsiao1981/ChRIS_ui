import { parse as uuidparse, v4 as uuidv4 } from "uuid";

export const randomStr = () => {
  while (true) {
    const theStr = randomStrCore();
    if (
      theStr[0] !== "." &&
      theStr[21] !== "." &&
      theStr[0] !== "_" &&
      theStr[21] !== "_"
    ) {
      return theStr;
    }
  }
};

const randomStrCore = () => {
  const theBytes = uuidparse(uuidv4());
  return theBytes.toBase64().slice(0, 22).replace("/", "_").replace("+", ".");
};

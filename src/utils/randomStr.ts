import { parse as uuidparse, v4 as uuidv4 } from "uuid";

export const randomStr = (n: number = 22) => {
  while (true) {
    const theStr = randomStrCore(n);
    if (
      theStr[0] !== "." &&
      theStr[n - 1] !== "." &&
      theStr[0] !== "_" &&
      theStr[n - 1] !== "_"
    ) {
      return theStr;
    }
  }
};

const randomStrCore = (n: number) => {
  const theBytes = uuidparse(uuidv4());
  return theBytes.toBase64().slice(0, n).replace("/", "_").replace("+", ".");
};

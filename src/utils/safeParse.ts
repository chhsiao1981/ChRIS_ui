export const safeParseInt = (x: any, theDefault: number = 0) => {
  const result = parseInt(x, 10);
  const finalResult = Number.isNaN(result) ? theDefault : result;

  return finalResult;
};

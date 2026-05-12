// from: https://github.com/jaredLunde/react-hook/tree/master/packages/resize-observer#quick-start

import useResizeObserver from "@react-hook/resize-observer";
import { type MutableRefObject, type RefObject, useState } from "react";

type Props =
  | MutableRefObject<HTMLDivElement | SVGSVGElement | HTMLCanvasElement>
  | RefObject<SVGGElement | HTMLDivElement | SVGSVGElement | HTMLCanvasElement>;

export default (target: Props) => {
  // size is of type DOMRectReadOnly or undefined initially
  const [theSize, setSize] = useState<DOMRectReadOnly | undefined>();

  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return theSize;
};

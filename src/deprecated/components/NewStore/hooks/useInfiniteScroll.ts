import { type RefObject, useEffect } from "react";

type UseInfiniteScrollOptions = {
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  threshold?: number;
};

/**
 * useInfiniteScroll
 * Attaches an IntersectionObserver to the given `ref`.
 * When the observed element is in view and `hasNextPage` is true,
 * calls `fetchNextPage`.
 */

export const useInfiniteScroll = (
  ref: RefObject<HTMLElement>,
  options: UseInfiniteScrollOptions,
) => {
  const { fetchNextPage, hasNextPage, threshold: propsThreshold } = options;
  const threshold = propsThreshold ?? 0.5;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, fetchNextPage, hasNextPage, threshold]);
};

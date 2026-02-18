import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { getFileName } from "../../../api/common";
import { createFeedWithFilepaths, getFeed } from "../../../api/serverApi";
import * as DoCart from "../../../reducers/cart";
import type { SelectionPayload } from "../../../store/cart/types";
import { type OriginState, useOperationsContext } from "../context";

type TDoCart = ThunkModuleToFunc<typeof DoCart>;

const useFeedOperations = (
  origin: OriginState,
  api: any,
  useCart: UseThunk<DoCart.State, TDoCart>,
) => {
  const { handleOrigin, invalidateQueries } = useOperationsContext();

  const [classStateCart, _doCart] = useCart;
  const cart = getState(classStateCart) || DoCart.defaultState;
  const { selectedPaths } = cart;

  const giveMePaths = useMemo(() => {
    return selectedPaths.map((payload: SelectionPayload) => payload.path);
  }, [selectedPaths]);

  const handleDuplicate = async () => {
    handleOrigin(origin);
    const paths = giveMePaths;
    const feedList = paths.map(async (path) => {
      // cube does not accept forward slashes in the feed name
      const filePath = getFileName(path);
      const idMatch = filePath.match(/feed_(\d+)/);
      const id = idMatch ? idMatch[1] : null;
      let pathToFeed = getFileName(path);
      if (id) {
        // this is feed duplicate
        const { status, data: feed, errmsg } = await getFeed(id);
        if (feed) {
          pathToFeed = feed.name;
        }
      }
      const {
        status,
        data: feed,
        errmsg,
      } = await createFeedWithFilepaths([path], `Copy of ${pathToFeed}`);

      if (!feed) {
        return;
      }
      return feed;
    });
    return feedList;
  };

  const handleMerge = async () => {
    handleOrigin(origin);
    const paths = giveMePaths;
    const sanitizedPaths = await Promise.all(
      paths.map(async (path) => {
        const filePath = getFileName(path);
        const idMatch = filePath.match(/feed_(\d+)/);
        const id = idMatch ? idMatch[1] : null;
        let pathToFeed = getFileName(path);

        if (id) {
          // this is a feed merge
          const { status, data: feed, errmsg } = await getFeed(id);
          if (feed) {
            pathToFeed = feed.name;
          }
        }

        // Return the sanitized path (with slashes replaced by underscores)
        return pathToFeed.replace(/\//g, "_");
      }),
    );

    // Join the sanitized paths with ", " and replace any slashes with underscores
    const feedName = sanitizedPaths.join(", ");

    // Create the merged feed with the final sanitized feed name
    const {
      status,
      data: feed,
      errmsg,
    } = await createFeedWithFilepaths(paths, `Merge of ${feedName}`);
    if (!feed) {
      return;
    }
    return feed;
  };

  const handleDuplicateMutation = useMutation({
    mutationFn: () => handleDuplicate(),
    onSuccess: () => {
      api.success({
        message: "Feed copied successfully",
      });
      invalidateQueries();
    },
    onError: (e) => {
      api.error({
        message: "Error while copying",
        description: e.message,
      });
    },
  });

  const handleMergeMutation = useMutation({
    mutationFn: () => handleMerge(),
    onSuccess: () => {
      api.success({
        message: "Feed merged successfully",
      });
      invalidateQueries();
    },
    onError: (e) => {
      api.error({
        message: "Error while merging the feeds",
        description: e.message,
      });
    },
  });

  return {
    handleDuplicateMutation,
    handleMergeMutation,
  };
};

export default useFeedOperations;

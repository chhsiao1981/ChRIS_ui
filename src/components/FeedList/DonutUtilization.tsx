import { ChartDonutUtilization } from "@patternfly/react-charts";
import { Skeleton, Tooltip } from "@patternfly/react-core";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo } from "react";
import type { Feed } from "../../api/types";
import { ThemeContext } from "../DarkTheme/useTheme";
import styles from "./DonutUtilization.module.css";
import {
  getPluginInstanceDetails,
  type PluginInstanceDetails,
} from "./utilties";

type Props = {
  feed: Feed;
  type: string;
  onProgressUpdate: (progress: number | null, error: boolean) => void;
};

export default (props: Props) => {
  const { feed, type, onProgressUpdate } = props;
  const { isDarkTheme } = useContext(ThemeContext);

  /**
   * Calculate initial details synchronously and check if feed is completed
   */
  const initialDetails = useMemo(() => getPluginInstanceDetails(feed), [feed]);
  const feedCompleted = useMemo(
    () => isFeedCompleted(initialDetails),
    [initialDetails],
  );

  /**
   * Notify parent of initial progress status
   */
  useEffect(() => {
    onProgressUpdate(
      initialDetails.progress,
      Boolean(initialDetails.foundError),
    );
  }, [initialDetails, onProgressUpdate]);

  /**
   * Only fetch updates for feeds that aren't completed
   */
  const {
    data: fetchedDetails,
    isLoading,
    status,
  } = useQuery({
    queryKey: ["feedDetails", feed.id, type],
    queryFn: () => fetchFeedDetails(feed.id, type),
    refetchInterval: (query) => {
      // Check data from the current query state
      const data = query.state.data;
      if (!data) return false;

      // Stop polling if feed is completed or has error
      if (isFeedCompleted(data)) {
        return false;
      }

      // Continue polling every 5 seconds
      return 5000;
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    enabled: !feedCompleted,
  });

  /**
   * Use fetched details for active feeds, initial details for completed feeds
   */
  const details = fetchedDetails || initialDetails;

  /**
   * Notify parent of status updates for active feeds
   */
  useEffect(() => {
    if (feedCompleted) {
      // Already handled via initial details
      return;
    }

    if (status === "success" && fetchedDetails) {
      onProgressUpdate(
        fetchedDetails.progress,
        Boolean(fetchedDetails.foundError),
      );
    } else if (status === "error") {
      onProgressUpdate(null, true);
    }
  }, [status, fetchedDetails, feedCompleted, onProgressUpdate]);

  const mode = isDarkTheme ? "dark" : "light";

  if (isLoading) {
    return <Skeleton height="40px" width="40px" />;
  }

  if (!details) {
    /**
     * Show a greyed out donut labeled "N/A" when no details available
     */
    return (
      <Tooltip content="No feed progress data available">
        <div className={`chart ${mode}`}>
          <ChartDonutUtilization
            ariaTitle="Unknown Status"
            data={{ x: "Analysis", y: 0 }}
            labels={() => null}
            title="?"
            thresholds={[{ value: 100, color: "#d2d2d2" }]}
            width={125}
            height={125}
          />
        </div>
      </Tooltip>
    );
  }

  /**
   * Extract progress and error state with safe defaults
   */
  const { progress = 0, feedProgressText = "" } = details;
  const foundError = details.foundError === true;

  /**
   * Decide the donut color & label based on progress and error state
   */
  let title = `${progress}%`;
  /**
   * Default color for the donut
   */
  let color = "#0066cc";
  let threshold = 100;

  if (foundError) {
    /**
     * PF Red-100 for error state
     */
    color = "#c9190b";
    threshold = progress;
  } else if (progress === 100) {
    title = "✓";
  } else {
    /**
     * PF Blue-400 for partial progress
     */
    color = "#06c";
    threshold = progress;
  }

  const skeletonClassName = isLoading ? undefined : styles.hide;
  const noFeedClassName =
    !isLoading && !details ? `chart ${mode}` : styles.hide;
  const contentClassName =
    !isLoading && details ? `chart ${mode}` : styles.hide;
  return (
    <>
      <Skeleton className={skeletonClassName} height="40px" width="40px" />
      <Tooltip content="No feed progress data available">
        <div className={noFeedClassName}>
          <ChartDonutUtilization
            ariaTitle="Unknown Status"
            data={{ x: "Analysis", y: 0 }}
            labels={() => null}
            title="?"
            thresholds={[{ value: 100, color: "#d2d2d2" }]}
            width={125}
            height={125}
          />
        </div>
      </Tooltip>
      <Tooltip content={feedProgressText}>
        <div className={contentClassName}>
          <ChartDonutUtilization
            ariaTitle={feedProgressText}
            data={{ x: "Analysis", y: progress }}
            labels={() => null}
            title={title}
            thresholds={[{ value: threshold, color }]}
            width={125}
            height={125}
          />
        </div>
      </Tooltip>
    </>
  );
};

const isFeedCompleted = (details: PluginInstanceDetails | null): boolean => {
  if (!details) return false;
  return details.progress === 100 || Boolean(details.foundError);
};

import { Button } from "antd";
import type { Feed } from "../../api/types";

type Props = {
  feed: Feed;
  onClick: (feed: Feed) => void;
};
export default (props: Props) => {
  const { feed, onClick } = props;
  return (
    <Button
      variant="link"
      onClick={(e) => {
        e.stopPropagation();
        onClick(feed);
      }}
      style={{ padding: 0 }}
      aria-label={`View details for ${feed.name}`}
    >
      {feed.name}
    </Button>
  );
};

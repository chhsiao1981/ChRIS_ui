import { Input, Select, Space } from "antd";
import type { FeedSearchType } from "../../api/types/feed";

const { Search } = Input;

const options = [
  {
    value: "name",
    label: "Name",
  },
  {
    value: "id",
    label: "ID",
  },
  {
    value: "name_exact",
    label: "Exact Match",
  },

  {
    value: "name_startsWith",
    label: "Match Starts With",
  },
];

type Props = {
  search: string;
  searchType: FeedSearchType;
  onChange: (search: string, searchType: FeedSearchType) => void;
  loading: boolean;
};
export default (props: Props) => {
  const { search, searchType, onChange, loading } = props;
  return (
    <Space size="middle">
      <Select
        onChange={(value: FeedSearchType) => {
          onChange(search, value);
        }}
        value={searchType}
        options={options}
      />
      <Search
        onChange={(e) => {
          onChange(e.target.value, searchType);
        }}
        value={search}
        loading={loading && search.length > 0}
        enterButton="Search"
        placeholder="Search in Analyses"
      />
    </Space>
  );
};

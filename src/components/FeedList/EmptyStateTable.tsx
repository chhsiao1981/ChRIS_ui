import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import type { CSSProperties } from "react";
import { Typography } from "../Antd";
import { COLUMN_DEFINITIONS } from "./constants";

const { Paragraph } = Typography;

type Props = {
  className?: string;
  style?: CSSProperties;
};

export default (props: Props) => {
  const { className, style } = props;
  return (
    <Table
      className={className}
      style={style}
      variant="compact"
      aria-label="Empty Table"
    >
      <Thead>
        <Tr>
          <Th />
          {COLUMN_DEFINITIONS.map(({ label }) => (
            <Th scope="col" key={label}>
              {label}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td colSpan={COLUMN_DEFINITIONS.length + 1}>
            <EmptyState variant={EmptyStateVariant.full}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h4" size="lg">
                No Data Available
              </Title>
              <Paragraph>
                There are no data to display at this time. Please check back
                later or adjust your filters.
              </Paragraph>
            </EmptyState>
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
};

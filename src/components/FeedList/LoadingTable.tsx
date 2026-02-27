import { Skeleton } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import type { CSSProperties } from "react";
import { COLUMN_DEFINITIONS } from "./constants";

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
      aria-label="Loading Table"
    >
      <Thead>
        <Tr>
          <Th screenReaderText="loading data" />
          {COLUMN_DEFINITIONS.map(({ label }) => (
            <Th key={label}>{label}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: 20 }).map((_, index) => (
          /**
           * Using index as key is acceptable for static skeleton rows
           */

          <Tr key={index}>
            <Td colSpan={COLUMN_DEFINITIONS.length + 1}>
              <Skeleton width="100%" height="40px" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

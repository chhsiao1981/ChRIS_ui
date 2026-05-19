import { Th, Thead, Tr } from "@patternfly/react-table";

type ColumnName = {
  label: string;
  arialLabel: string;
  width?: 20 | 40;
};

const COLUMN_NAMES: ColumnName[] = [
  {
    label: "",
    arialLabel: "file-selection-checkbox",
  },
  {
    label: "Name",
    arialLabel: "file-name",
    width: 40,
  },
  {
    label: "Created",
    arialLabel: "file-created",
    width: 20,
  },
  {
    label: "Size",
    arialLabel: "file-size",
    width: 20,
  },
];

export default () => {
  return (
    <Thead aria-label="file-browser-table">
      <Tr>
        {COLUMN_NAMES.map((each) => {
          return (
            <Th
              key={each.label}
              aria-label={each.arialLabel}
              width={each.width}
            >
              {each.label}
            </Th>
          );
        })}
      </Tr>
    </Thead>
  );
};

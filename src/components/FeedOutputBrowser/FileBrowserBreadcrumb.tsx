import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import type { MouseEvent } from "react";
import type { FileBrowserBreadCrumb } from "../../reducers/types";

type Props = {
  breadcrumbs: FileBrowserBreadCrumb[];
};
export default (props: Props) => {
  const { breadcrumbs } = props;

  const onClick = (e: MouseEvent, breadcrumb: FileBrowserBreadCrumb) => {};

  return (
    <Breadcrumb>
      {breadcrumbs.map((each, index) => (
        <BreadcrumbItem
          showDivider={true}
          key={index}
          target={each.value}
          to={each.isSelectedInstancePath ? "#" : undefined}
          onClick={(e) => onClick(e, each)}
        />
      ))}
    </Breadcrumb>
  );
};

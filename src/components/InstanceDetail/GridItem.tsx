import { GridItem } from "@patternfly/react-core";
import styles from "./GridItem.module.css";

type Props = {
  title: string;
  children: React.ReactNode;
  isHide?: boolean;
};
export default (props: Props) => {
  const { title, children, isHide } = props;
  const classNameTitle = isHide ? styles.hide : "title";
  const classNameValue = isHide ? styles.hide : "value";
  return (
    <>
      <GridItem
        className={classNameTitle}
        span={2}
        style={{ marginBottom: "1em" }}
      >
        {title}
      </GridItem>
      <GridItem className={classNameValue} span={10}>
        {children}
      </GridItem>
    </>
  );
};

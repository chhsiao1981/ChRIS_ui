import { Input, Switch } from "antd";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import styles from "./Control.module.css";
import type { Orientation, OverlayScaleType } from "./types";

type Props = {
  orientation: Orientation;
  setOrientation: Dispatch<SetStateAction<Orientation>>;

  isToggleLabel: boolean;
  setIsToggleLabel: Dispatch<SetStateAction<boolean>>;

  is3D: boolean;
  setIs3D: Dispatch<SetStateAction<boolean>>;

  isScaleEnabled: boolean;
  setIsScaleEnabled: Dispatch<SetStateAction<boolean>>;

  scaleType: OverlayScaleType;
  setScaleType: Dispatch<SetStateAction<OverlayScaleType>>;

  isSearch: boolean;
  setIsSearch: Dispatch<SetStateAction<boolean>>;

  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
};
export default (props: Props) => {
  const {
    orientation,
    setOrientation,

    isToggleLabel,
    setIsToggleLabel,

    is3D,
    setIs3D,

    isScaleEnabled,
    setIsScaleEnabled,

    scaleType,
    setScaleType,

    isSearch,
    setIsSearch,

    search,
    setSearch,
  } = props;

  /*
  const styleScaleType: CSSProperties = {};
  if (!isScaleEnabled) {
    styleScaleType.display = "none";
  }
  */

  const styleSearch: CSSProperties = {};
  if (!isSearch) {
    styleSearch.display = "none";
  }

  return (
    <div className={styles.control}>
      <Switch
        checked={isToggleLabel}
        onChange={() => setIsToggleLabel(!isToggleLabel)}
        checkedChildren="Labels On"
        unCheckedChildren="Labels Off"
      />
      {/*
      <Switch
        checked={is3D}
        onChange={() => setIs3D(!is3D)}
        checkedChildren="3D"
        unCheckedChildren="2D"
      />
      */}
      {/*
      <Switch
        checked={isScaleEnabled}
        onChange={() => setIsScaleEnabled(!isScaleEnabled)}
        checkedChildren="Node Scale On"
        unCheckedChildren="Node Scale Off"
      />*/}
      {/*
      <select
        value={scaleType}
        onChange={(e) => setScaleType(e.target.value as OverlayScaleType)}
        style={styleScale}
      >
        <option value="time">Time</option>
        <option value="cpu">CPU</option>
        <option value="memory">Memory</option>
      </select>
      */}
      {/*
      <Switch
        checked={isSearch}
        onChange={() => setIsSearch(!isSearch)}
        checkedChildren="Search On"
        unCheckedChildren="Search Off"
      />
      */}
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styleSearch}
      />
    </div>
  );
};

import {
  getState,
  type ThunkModuleToFunc,
  type UseThunk,
} from "@chhsiao1981/use-thunk";
import { Button, Form, FormGroup, TextArea } from "@patternfly/react-core";
import { type ChangeEvent, useEffect, useState } from "react";
import { fetchNote } from "../../api/common";
import * as DoFeed from "../../reducers/feed";
import styles from "./FeedNote.module.css";

type TDoFeed = ThunkModuleToFunc<typeof DoFeed>;

type Props = {
  useFeed: UseThunk<DoFeed.State, TDoFeed>;
  isHide: boolean;
};
export default (props: Props) => {
  const { useFeed, isHide } = props;
  const [classFeed, _] = useFeed;
  const feed = getState(classFeed) || DoFeed.defaultState;
  const { data: feedData } = feed;

  const [value, setValue] = useState("");

  useEffect(() => {
    fetchNote(feedData).then((note) => {
      setValue(note?.data.content);
    });
  }, [feedData]);

  const [typing, setTyping] = useState(false);
  const handleChange = (
    _event: ChangeEvent<HTMLTextAreaElement>,
    value: string,
  ) => {
    setValue(value);
  };

  const onSave = async () => {
    setTyping(true);
    try {
      const note = await fetchNote(feedData);
      await note?.put({
        title: "Description",
        content: value,
      });
      setTimeout(() => {
        setTyping(false);
      }, 1000);
    } catch (error) {
      setTyping(false);
    }
  };

  const classNameForm = isHide ? styles.hide : "";
  const classNameWrap = isHide ? styles.hide : styles.wrap;

  return (
    <>
      <Form className={classNameForm}>
        <FormGroup type="string" fieldId="selection">
          <TextArea
            className="feed-details__textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={async (event: any) => {
              if (event.key === "Enter") {
                onSave();
              }
            }}
            isRequired
            aria-label="invalid text area example"
          />
        </FormGroup>
      </Form>
      <div className={classNameWrap}>
        <Button className={styles.btn} variant="primary" onClick={onSave}>
          Save
        </Button>
        {typing && "Saving your note..."}
      </div>
    </>
  );
};

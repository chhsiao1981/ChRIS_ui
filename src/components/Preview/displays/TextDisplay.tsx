import Papa from "papaparse"; // Import PapaParse for CSV parsing
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { getFileBlob } from "../../../api/serverApi";
import useSize from "../../FeedTree/useSize";
import type { DisplayProps } from "./types";

export default (props: DisplayProps) => {
  const { selectedFile, isHide } = props;
  const divRef = useRef<HTMLDivElement>(null);
  useSize(divRef);

  const [content, setContent] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);

  useEffect(() => {
    if (isHide) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    const displayContent = async () => {
      const blob = await getFileBlob(selectedFile);
      if (!blob) {
        return;
      }

      const reader = new FileReader();

      reader.addEventListener(
        "load",
        () => {
          const result = reader.result as string;
          const fileName = selectedFile.fname || "";
          const isCSVFile = fileName.endsWith(".csv");

          if (isCSVFile) {
            // Parse CSV
            const parsed = Papa.parse(result, { header: false });
            setCsvData(parsed.data);
            setContent(null);
          } else {
            setContent(result);
            setCsvData(null);
          }
        },
        false,
      );

      reader.readAsText(blob);
    };

    displayContent();
  }, [selectedFile, isHide]);

  const style: CSSProperties = {
    display: "block",
    overflow: "hidden", // Hide scrollbars on the outer container
    width: "100%",
    height: "100%",
  };
  if (isHide) {
    style.display = "none";
  }

  return (
    <div ref={divRef} style={style}>
      {csvData ? (
        // Wrap table in a div to manage overflow
        <div
          style={{
            overflow: "auto", // Enable vertical and horizontal scrolling
            width: "100%",
            height: "100%",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              width: "max-content", // Allow table to take natural width
              minWidth: "100%", // Ensure table fills the container width initially
            }}
          >
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{ border: "1px solid #ccc", padding: "4px" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Render text content
        <pre
          style={{
            fontFamily: "monospace",
            color: "white",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {content}
        </pre>
      )}
    </div>
  );
};

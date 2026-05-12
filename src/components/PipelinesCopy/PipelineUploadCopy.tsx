import { Button } from "@patternfly/react-core";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import axios from "axios";
import { isEmpty } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { getComputeResources } from "../../api/serverApi/computeResource";
import type { ComputeResource, Plugin } from "../../api/types";
import { envOptions } from "../NewStore/hooks/useFetchPlugins";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import { extractPluginInfo, uploadPipelineSourceFile } from "./utils";

interface Notification {
  type: "warning" | "info" | "error" | undefined;
  description: string;
}

export interface PluginsResponse {
  count: number;
  results: Plugin[];
}

const COOKIE_NAME = "storeCreds";

type Props = {
  fetchPipelinesAgain: () => void;
};

export default (props: Props) => {
  const { fetchPipelinesAgain } = props;
  const [cookies] = useCookies([COOKIE_NAME]);
  const fileInput = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<Notification>({
    type: undefined,
    description: "",
  });
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!notification.type && !lastSuccess) return;
    const t = window.setTimeout(() => {
      setNotification({ type: undefined, description: "" });
      setLastSuccess(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [notification.type, lastSuccess]);

  async function installPlugin(name: string, version: string, token: string) {
    setNotification({
      type: "info",
      description: `Installing package: ${name} version: ${version}…`,
    });
    let pluginMeta: Plugin | null = null;

    for (const baseUrl of Object.values(envOptions)) {
      try {
        const url = `${baseUrl}/search/?name=${encodeURIComponent(name)}&version=${encodeURIComponent(version)}`;
        const resp = await axios.get<PluginsResponse>(url, { timeout: 5000 });
        if (resp.data.results.length) {
          pluginMeta = resp.data.results[0];
          break;
        }
      } catch (err: any) {
        setNotification({
          type: "warning",
          description: `Store ${baseUrl} unreachable: ${err.message}`,
        });
      }
    }
    if (!pluginMeta)
      throw new Error(`Package "${name}"@${version} not found in any store.`);

    const crResp = await getComputeResources();
    const crList = (crResp.getItems() as ComputeResource[]) || [];
    if (!crList.length) throw new Error("No compute resources available.");

    const authHeader: string | null = null;
    /*
    if (isStaff) authHeader = `Token ${token}`;
    else if (cookies[COOKIE_NAME]) authHeader = `Basic ${cookies[COOKIE_NAME]}`;
    if (!authHeader)
      throw new Error("Please configure admin credentials in the Store first.");
    */

    await handleInstallPlugin(authHeader, pluginMeta, crList);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        let retry = true;
        while (retry) {
          try {
            await uploadPipelineSourceFile(file);
            setLastSuccess("Package uploaded successfully");
            fetchPipelinesAgain();
            retry = false;
          } catch (err) {
            retry = false;
            if (axios.isAxiosError(err)) {
              const data = err.response?.data as any;
              if (!isEmpty(data?.name)) {
                setNotification({
                  type: "error",
                  description: `Error: ${data.name[0]}`,
                });
              } else if (!isEmpty(data?.plugin_tree)) {
                const info = extractPluginInfo(data.plugin_tree[0]);
                if (info) {
                  setNotification({
                    type: "error",
                    description: `Requires ${info.name}@${info.version}, installing…`,
                  });
                  try {
                    await installPlugin(info.name, info.version);
                    retry = true;
                  } catch (installErr: any) {
                    setNotification({
                      type: "error",
                      description: `Failed to install ${info.name}@${info.version}: ${installErr.message}`,
                    });
                  }
                } else {
                  setNotification({
                    type: "error",
                    description: data.plugin_tree[0],
                  });
                }
              } else {
                setNotification({
                  type: "error",
                  description: "An unexpected error occurred",
                });
              }
            } else {
              setNotification({
                type: "error",
                description: "An unexpected error occurred",
              });
            }
          }
        }
      } catch (fileErr: any) {
        setNotification({
          type: "error",
          description: fileErr.message || "Upload/install failed for this file",
        });
      }
    }

    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div style={{ marginTop: 16, position: "relative" }}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => fileInput.current?.click()}
      >
        Upload a Package
      </Button>

      {lastSuccess ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginLeft: "12px",
            color: "#3E8635",
          }}
        >
          <CheckCircleIcon />
          &nbsp;{lastSuccess}
        </div>
      ) : (
        !isEmpty(notification.type) && (
          <span style={{ marginLeft: "12px" }}>{notification.description}</span>
        )
      )}

      <input
        ref={fileInput}
        style={{ display: "none" }}
        type="file"
        accept=".json,.yml,.yaml"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};

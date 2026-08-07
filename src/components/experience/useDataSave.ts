import { useEffect, useState } from "react";

type NetworkInformationLike = {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function readSaveData(): boolean {
  const conn = (
    navigator as Navigator & {
      connection?: NetworkInformationLike;
    }
  ).connection;
  return Boolean(conn?.saveData);
}

/** Live Save-Data / Data Saver flag for Android Chrome and Chromium. */
export function useDataSave(): boolean {
  const [save, setSave] = useState(readSaveData);

  useEffect(() => {
    const conn = (
      navigator as Navigator & {
        connection?: NetworkInformationLike;
      }
    ).connection;
    if (!conn?.addEventListener) return;
    const update = () => setSave(Boolean(conn.saveData));
    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener?.("change", update);
  }, []);

  return save;
}

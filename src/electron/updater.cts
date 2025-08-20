import { autoUpdater } from "electron-updater";
import { dialog } from "electron";
import log from "electron-log";

export function setupAutoUpdater() {
  autoUpdater.logger = log;
  (autoUpdater.logger as any).transports.file.level = "info";

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: "A new version is downloading...",
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Update Ready",
        message: "Update downloaded. Restart now?",
      })
      .then((result) => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on("error", (err) => {
    log.error("Update error:", err);
  });

  autoUpdater.checkForUpdatesAndNotify();
}

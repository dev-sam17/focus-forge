# Step 5: Build & Publish to GitHub Releases (Detailed Guide)

Alright Sam — deep dive on **Step 5: Build & Publish to GitHub Releases**. This is the part where `electron-builder` packages your app, creates a GitHub Release (with the right tag), uploads binaries + update metadata, and your app’s `autoUpdater` starts seeing it.

---

## 0) Pre-flight checklist (don’t skip)
- **Bump version** in `package.json` (semver). Each release = new tag. Reusing a version causes GitHub 422 errors.
- **GH_TOKEN** in env:
  - Windows (PowerShell): `setx GH_TOKEN your_pat_here`
  - macOS/Linux (bash/zsh): `export GH_TOKEN=your_pat_here`
  - PAT scope: `repo` (classic token). 2FA’s fine; PAT bypasses it.
- **Repo visibility**: Public is easiest. Private works for publishing, but **clients cannot download updates** without auth — not recommended for OTA. If you need private, use S3/Spaces later.
- **Build OS on the OS**: mac builds on mac; Windows on Windows. Cross-platform is… pain.

---

## 1) What the command actually does
```bash
npx electron-builder --publish always
```
- **Packages** your app for the current OS.
- **Creates/updates a Git tag** (defaults to `v${version}`).
- **Creates a GitHub Release** (release type: release/prerelease/draft — see below).
- **Uploads assets**: e.g. `YourApp-1.2.3.exe/.dmg/.AppImage`, `latest.yml` / `latest-mac.yml`, and `.blockmap` files (for differential updates).
- Your running app’s `autoUpdater` fetches `latest*.yml` and decides whether to download.

If you have `"publish": [{ "provider":"github", "owner":"you", "repo":"your-repo" }]` in `package.json > build`, you don’t need any extra flags beyond `--publish`.

---

## 2) Publish policies (how & when it uploads)

**A) Publish on every build (fastest to ship)**
```bash
npx electron-builder --publish always
```

**B) Publish only when you create a tag**
```bash
git tag v1.2.3
git push origin v1.2.3
npx electron-builder --publish onTag
```

**C) Publish on tag or a pre-existing draft**
```bash
npx electron-builder --publish onTagOrDraft
```

---

## 3) Release types (stable vs beta vs draft)

**Stable release**
- `version`: `1.2.3`

**Prerelease (beta/alpha/rc)**
- `version`: `1.3.0-beta.1` or `1.3.0-rc.0`

**Draft**
- Hidden release while you QA.

---

## 4) Typical scripts you’ll use (CTS / TypeScript)
```json
{
  "scripts": {
    "build:ts": "tsc -p .",
    "dist": "npm run build:ts && electron-builder",
    "publish:always": "npm run build:ts && electron-builder --publish always",
    "publish:tag": "npm run build:ts && electron-builder --publish onTag",
    "publish:beta": "npm run build:ts && electron-builder --publish always -c.extraMetadata.version=1.3.0-beta.1"
  }
}
```

---

## 5) Platform targets & examples

**Windows**
```bash
npx electron-builder --win --x64 --publish always
```

**macOS**
```bash
npx electron-builder --mac dmg --publish always
```

**Linux**
```bash
npx electron-builder --linux AppImage --publish always
```

---

## 6) What gets uploaded
- `latest*.yml`
- `.blockmap`
- Installers/binaries

---

## 7) Release notes
```ts
autoUpdater.on("update-downloaded", async (info) => {
  const res = await dialog.showMessageBox({
    type: "info",
    buttons: ["Restart", "Later"],
    title: `Update ${info.version} Ready`,
    message: "Restart to install now?",
    detail:
      typeof info.releaseNotes === "string"
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
        ? info.releaseNotes.map(n => `• ${n.version}\n${n.note}`).join("\n\n")
        : ""
  });
  if (res.response === 0) autoUpdater.quitAndInstall();
});
```

---

## 8) Common failure modes
- **401** → GH_TOKEN missing/expired.
- **422** → Tag/version already used.
- **Cannot detect repository** → Missing `owner` & `repo`.
- **Private repo OTA** → not supported easily.
- **SmartScreen/Notarization issues** → codesign.

---

## 9) Real-world flows

**Flow A: Stable ship on tag**
```bash
git tag v1.2.3
git push origin main --tags
npx electron-builder --publish onTag
```

**Flow B: Beta channel**
```json
{ "version": "1.3.0-beta.1" }
```
```ts
autoUpdater.channel = "beta";
```
```bash
npx electron-builder --publish always
```

---

## 10) Quality-of-life tips
- Only check updates in production:
```ts
if (app.isPackaged) setupAutoUpdater();
```
- Debug logs: 
```bash
DEBUG=electron-builder npm run publish:always
```

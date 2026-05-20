# Google Apps Script — Student Tracker

This is the tiny backend that receives student results from `js/tracker.js` and writes them to a Google Sheet. It runs free on Google's infrastructure — no server, no DB, no maintenance.

## What it does

When a student finishes a test, `tracker.js` POSTs `{name, test, score, date}` here. The script appends a row to a Google Sheet:

| Timestamp | Name | Test | Score |
| --- | --- | --- | --- |
| 2026-05-20 21:14 | Aziza | Trainer 2 Test 5 Listening | 32 |

---

## Setup — one-time, ~5 minutes

### 1. Create the Google Sheet

1. Open [sheets.new](https://sheets.new) — this creates a blank sheet.
2. Rename it whatever you like (e.g. `IELTS Hub — Results`).
3. **Don't add headers manually.** The script creates a `Results` tab with proper headers on the first write.

### 2. Open the Apps Script editor

1. In the sheet, click **Extensions → Apps Script**.
2. Delete the default `function myFunction() {}` boilerplate.
3. Open [`Code.gs`](./Code.gs) from this repo and copy its full contents.
4. Paste into the Apps Script editor.
5. Save: 💾 icon or **⌘ + S**. Name the project (e.g. `IELTS Tracker`).

### 3. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear ⚙️ next to **Select type** → choose **Web app**.
3. Fill in the form:
   - **Description**: anything (e.g. `v1`)
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**  ← required for the browser to reach it
4. Click **Deploy**.
5. **First time only**: Google asks for authorization.
   - Click **Authorize access** → pick your account.
   - You'll see "Google hasn't verified this app". Click **Advanced** → **Go to … (unsafe)** → **Allow**.
   - This is normal — it's *your* script, on *your* account. The "unsafe" warning is shown for every personal Apps Script.
6. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb…/exec
   ```

### 4. Wire it into `tracker.js`

1. Open `js/tracker.js` in this repo.
2. At the top, find:

   ```js
   var WEB_APP_URL = '';
   ```

3. Paste your URL between the quotes:

   ```js
   var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycb…/exec';
   ```

4. Commit and push. GitHub Pages redeploys in ~30s.

### 5. Test the end-to-end flow

1. Open any test page that includes `tracker.js` (see [main README](../README.md#student-tracker)).
2. The modal asks for your name → type something → **Continue**.
3. Finish the test so the page calls `IELTSTracker.sendResult('Test name', score)`.
4. A small "Result saved ✓" toast appears in the bottom of the screen.
5. Open your Google Sheet — a new row appears in the **Results** tab. ✨

You can also sanity-check the URL by opening it in a browser. You should see:

```json
{ "status": "ok", "service": "IELTS Hub Tracker" }
```

---

## Updating the script later

If you change `Code.gs`, you need to ship a new version:

1. **Deploy → Manage deployments** → ✏️ Edit on your existing deployment.
2. **Version** dropdown → **New version** → optional description.
3. **Deploy**.

The Web app URL **stays the same**, so `tracker.js` doesn't need to change.

---

## Troubleshooting

**"No row appears in the sheet."**
Open the test page in your browser, hit **F12 → Console**, and look for `[IELTS Tracker]` log lines. The script always logs the payload it sent, even when it can't reach the server.

**Console shows `Failed to fetch` or CORS error.**
- Make sure the deployment is **Who has access: Anyone**. If it's set to "Only me", browsers get blocked.
- `tracker.js` deliberately uses `Content-Type: text/plain` to avoid CORS preflight. Don't change it.

**The sheet writes the wrong tab name.**
`SHEET_NAME` at the top of `Code.gs` controls it. Edit, save, and redeploy a new version (see "Updating" above).

**My students see the name modal on every refresh.**
Their browser is clearing localStorage between sessions (private/incognito mode, strict cookie settings). The script falls back gracefully — they just enter the name each time.

**I want to clear my own name during development.**
In the browser console on a test page:

```js
IELTSTracker.changeName();
```

Or wipe everything:

```js
localStorage.removeItem('ielts_student_name'); location.reload();
```

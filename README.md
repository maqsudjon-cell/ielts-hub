# IELTS Practice Hub

A static, single-page site that lists IELTS practice tests grouped by category. Hosted on GitHub Pages.

**Live site:** https://maqsudjon-cell.github.io/ielts-hub/

---

## Adding a new test

You don't need to touch any code. All test data lives in **[`tests.json`](./tests.json)** at the root of this repo. Edit that file — even from the GitHub mobile app — and the site updates within ~30 seconds.

### From the GitHub web/mobile interface

1. Open https://github.com/maqsudjon-cell/ielts-hub/blob/main/tests.json
2. Tap the pencil ✏️ icon (top-right) to edit
3. Add a new entry to the `tests` array (see schema below)
4. Scroll down → write a short commit message → **Commit changes**
5. Wait ~30s for GitHub Pages to redeploy, then refresh the site

### Entry schema

```json
{
  "title":      "Test name shown on the card",
  "category":   "Listening | Reading | Writing | Speaking",
  "url":        "https://...",
  "date":       "YYYY-MM-DD",
  "difficulty": "Band 6-7"
}
```

| Field        | Required | Notes                                                          |
| ------------ | -------- | -------------------------------------------------------------- |
| `title`      | yes      | Shown as the card heading. Max 2 lines on the card.            |
| `category`   | yes      | Must be one of: `Listening`, `Reading`, `Writing`, `Speaking`. |
| `url`        | yes      | Opens in a new tab when the card is clicked.                   |
| `date`       | yes      | ISO format (`YYYY-MM-DD`). Used for sorting and "Last updated". |
| `difficulty` | no       | Free text (e.g. `Band 6-7`, `Band 7+`). Shown as a pill.        |

### Example

```json
{
  "tests": [
    {
      "title": "Mocklab Essential Test 5",
      "category": "Listening",
      "url": "https://maqsudjon-cell.github.io/mocklabtest5listening/mocklab-essential-test5-listening.html",
      "date": "2026-05-19",
      "difficulty": "Band 6-7"
    },
    {
      "title": "Cambridge IELTS 18 — Reading Test 1",
      "category": "Reading",
      "url": "https://example.com/cambridge-18-r1",
      "date": "2026-06-01",
      "difficulty": "Band 7+"
    }
  ]
}
```

> ⚠️ **JSON is strict.** Commas between entries, double quotes around all keys and strings, no trailing comma after the last entry. If the site shows "Could not load tests", paste the file into [jsonlint.com](https://jsonlint.com) to find the syntax error.

---

## Adding a new test **page** (the HTML file students take)

Test pages live in their own GitHub repos (e.g. `ctna5`, `CDI`, …). When you create a new one, paste **one line** before `</body>`:

```html
<script src="https://maqsudjon-cell.github.io/ielts-hub/js/test-page-auto.js" defer></script>
```

That single tag automatically:

- Loads **`tracker.js`** → name modal on first visit, "Hi, {name} · Change" pill thereafter
- Loads **`footer.js`** → premium Telegram contact footer
- Detects the test title from the page's `<h1>` (or `<title>`)
- Watches the page's result modal — when it opens, reads the displayed score and calls `IELTSTracker.sendResult(title, score)` for you

**No per-page configuration needed.** If the auto-detector somehow misses your custom modal, drop these meta tags in `<head>`:

```html
<meta name="test-title"          content="Custom Test Name">
<meta name="test-modal-selector" content="#myResultsModal.show">
<meta name="test-score-selector" content="#myScoreText">
```

**Sanity-check in DevTools console:**

```js
IELTSAuto.diagnose();
// → { title: "...", score: null|"...", sent: false, patterns: [...] }
```

---

## Tech

- Single `index.html` — embedded CSS + vanilla JS, no build step, no frameworks
- `tests.json` fetched at runtime
- Inter + JetBrains Mono from Google Fonts
- Light / dark theme with system-preference detection and `localStorage` persistence
- GitHub Pages deploys from `main` / root automatically

## Local preview

```bash
cd ielts-hub
python3 -m http.server 8000
# open http://localhost:8000
```

# Danny Bosak — Engineering Portfolio

Live site: https://dan007b.github.io

Plain HTML, CSS and JavaScript, hosted on GitHub Pages. No build step:
edit the files, then commit and push.

## Updating the CSS/JS version tag (important)

Every page loads the stylesheet and script with a version tag on the end:

```html
<link rel="stylesheet" href="style.css?v=20260927">
<script src="script.js?v=20260927"></script>
```

Browsers keep saved copies of `style.css` and `script.js`. If you change either
file but keep the same tag, returning visitors may keep using their old copy,
and pages can look broken (for example, the resume preview once showed up tiny
on desktop because of an old cached stylesheet).

**Whenever you change `style.css` or `script.js`, bump the tag on every page:**

1. Pick a new tag. Using the date is easiest, e.g. `v=20261015`.
2. In VS Code, open the portfolio folder and press **Ctrl+Shift+H**
   (Find and Replace in Files).
3. Find: `v=20260927` (the current tag, see below).
   Replace with the new tag, e.g. `v=20261015`, then click **Replace All**.
4. Check it changed on `index.html`, `resume.html` and every page in `projects/`.
5. Update the "Current tag" line below, then commit and push.

The tag only needs to change when `style.css` or `script.js` change.
Editing HTML, adding images or replacing the resume PDF does not need a new tag.

**Current tag:** `v=20260927`

## Publishing changes

In a terminal inside this folder:

```
git add .
git commit -m "Describe what you changed"
git push
```

The live site updates about a minute later. Press Ctrl+F5 to see it.

# History Clearance

A minimal Chrome extension to review and delete history by site or keyword, with a black-and-burgundy interface.

## Add to Google Chrome

This extension is installed locally, not through the Chrome Web Store. Use desktop Google Chrome; no build step or Node.js installation is needed to use it.

### 1. Download the extension

- On GitHub, click **Code → Download ZIP**, then extract the ZIP into a folder you will keep on your computer.
- Or clone the repository:

  ```sh
  git clone https://github.com/udyan-upal/history-clearance.git
  ```

### 2. Load it in Chrome

1. Type `chrome://extensions` into Chrome's address bar and press Enter.
2. Turn on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the extracted or cloned `history-clearance` folder. Choose the folder that contains `manifest.json`, not the ZIP file or its parent folder.
5. Check that **History Clearance** appears and is enabled. Chrome may describe its history permission as access to your browsing history; this is required to search and delete entries.

### 3. Open the extension

1. Click Chrome's **Extensions** button (the puzzle-piece icon beside the address bar).
2. Optionally click the pin beside **History Clearance** to keep it on the toolbar.
3. Click **History Clearance** to open its search page in a new tab.

Keep the extension folder in place. Moving or deleting it can stop the extension from loading.

### Update or remove

- **Update:** download and extract the latest files into the same folder, or run `git pull` inside the cloned folder. Then open `chrome://extensions`, click the extension's **Reload** button, and close and reopen its search tab.
- **Remove:** open `chrome://extensions` and click **Remove** on **History Clearance**. Removing the extension does not restore deleted history.

### Troubleshooting

- **“Manifest file is missing or unreadable”:** select the folder containing `manifest.json`. For ZIP downloads, extract the archive first; the folder may be named `history-clearance-main`.
- **Extension not visible on the toolbar:** open the puzzle-piece menu and pin it.
- **Changes not appearing:** reload the extension on `chrome://extensions`, then reopen its tab.
- **Developer mode or Load unpacked is unavailable:** your browser may be managed by an organization. Ask your administrator whether local extensions are allowed.

## Use

Enter `facebook.com` (or a full URL), or a keyword such as `recipes`, in the same search box. Domains and URLs automatically use site search; other text uses keyword search. Click **Find history**, review the matching pages, then click **Delete all matches** and confirm. The extension opens in a tab so the list has room and deletion isn't interrupted by closing a popup. Keep the tab open until deletion finishes.

- Site search includes the domain and all its subdomains, not similarly named sites or URLs that merely mention the domain.
- Keyword search matches a literal substring or phrase in page titles or URLs, ignoring case, across all websites. It does not search page contents. Only HTTP/HTTPS pages are included.
- A leading `www.` is ignored. Enter a specific subdomain, such as `m.facebook.com`, to narrow the search.
- Searches all history Chrome still retains, not only the last day. Results are unique URLs with their latest visit, not individual visits. **Show more** displays another 100 pages; deletion applies to every matched page, including those not yet displayed.
- Use **Delete** beside any result to remove only that page's history, or **Delete all matches** to remove the full search result. Both ask for confirmation.
- Deletion is permanent and removes all visits for each matching URL. It does not clear cookies, cache, passwords, bookmarks, or activity stored separately by websites or your Google account. Chrome Sync may propagate history deletions to other devices.
- Only the `history` permission is requested. Nothing is uploaded or tracked. No host permissions, content scripts, or runtime network requests. Styles and fonts are bundled; no build step is needed to install the extension.

## Styling and development

The interface uses **Tailwind CSS v4** and **Manrope** from Google Fonts. Both are served locally: Manifest V3 blocks the Tailwind browser/CDN script, and bundling the font avoids external requests. Manrope's license is included in `assets/Manrope-OFL.txt`.

`style.css` is the committed, generated stylesheet. To change the design, edit `src/style.css` or the utility classes in `index.html`, then rebuild with Node.js 20 or later:

```sh
npm ci
npm run build:css
```

Reload the extension and reopen its tab to see the changes. The page intentionally uses a dark black-and-burgundy palette regardless of system theme. Runtime JavaScript remains dependency-free.

## Tests

With Node.js 18 or later:

```sh
node --test tests/*.test.mjs
```

These test domain normalization, automatic search detection, safe hostname matching, and individual/bulk deletion flows with mocked browser APIs and UI elements. Verify actual history access and deletion in Chrome after loading the extension.

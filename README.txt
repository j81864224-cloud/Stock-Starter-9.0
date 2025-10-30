LIVE YAHOO FINANCE STOCK SCREENER (No edits required)
--------------------------------------------------------
This ZIP is ready to upload to GitHub Pages and publish immediately. It fetches Yahoo Finance data
through a public CORS proxy (api.allorigins.win) so no server or Cloudflare Worker is required.

Files included:
- index.html
- main.js
- README.txt

How to use:
1. Create a new public GitHub repository.
2. Upload the files to the repository root (do not place them in a nested folder).
3. In the repo Settings -> Pages, set Source to the main branch and root folder, then Save.
4. Visit: https://your-username.github.io/your-repo-name/ and click "Refresh prices" if needed.

Important notes:
- Public proxies may be rate-limited or occasionally slow/unavailable. For heavy or long-term use, consider deploying the Cloudflare Worker version for reliability.
- The site shows a curated watchlist of US large-caps, small-caps, and ETFs. You can edit main.js later if you want to change the symbols.

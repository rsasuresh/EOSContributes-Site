# EoS landing page

Static site — HTML, CSS and JavaScript only. No database, PHP or build step
is needed on the server.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The page |
| `404.html` | "Page not found" page |
| `.htaccess` | Apache config: HTTPS redirect, compression, caching, security headers, 404 |
| `robots.txt` | Lets search engines index the site |
| `assets/css/style.css` | Design tokens (top of file) and components |
| `assets/css/tailwind.css` | Tailwind 3.4.16, precompiled (prefix `tw-`, no preflight) |
| `assets/js/main.js` | Theme toggle, animations, copy buttons, live GitHub star/fork counts |
| `assets/img/favicon.svg` | Logo / favicon |

Bootstrap 5.3.3, Bootstrap Icons 1.11.3 and the Inter / JetBrains Mono fonts
load from jsDelivr and Google Fonts. The Bootstrap files carry SRI hashes, so a
tampered CDN copy is refused by the browser.

## Deploy to HostGator (cPanel)

1. **Turn on SSL first.** cPanel → *SSL/TLS Status* → *Run AutoSSL*. Wait until
   your domain shows a valid certificate. (`.htaccess` redirects every visit to
   HTTPS, so without a certificate visitors get an error.)
2. cPanel → *File Manager* → open `public_html`.
3. Click *Settings* (top right) and tick **Show Hidden Files (dotfiles)** so you
   can see `.htaccess` after upload.
4. If `public_html` already has an `index.html`, `index.php` or `default.html`
   from HostGator, delete or rename it — Apache serves `index.php` before
   `index.html` on some setups.
5. *Upload* → choose `eos-website-hostgator.zip`.
6. Back in `public_html`, right-click the zip → *Extract* → extract into
   `/public_html`. The files land directly in `public_html` (the zip has no
   wrapping folder).
7. Delete the zip from `public_html`.
8. Visit `https://yourdomain.com` and hard-refresh (Ctrl/Cmd + Shift + R).

**Alternative (FTP):** cPanel → *FTP Accounts* gives the host, user and port.
In FileZilla, enable *Server → Force showing hidden files*, then upload the
*contents* of the extracted folder into `public_html`.

**Installing in a subfolder** (e.g. `yourdomain.com/eos/`): upload into
`public_html/eos/`, then in `.htaccess` change `ErrorDocument 404 /404.html`
to `ErrorDocument 404 /eos/404.html`, and in `404.html` change the two `/`
paths (`/assets/img/favicon.svg` and `href="/"`) to start with `/eos/`.

## Check after going live

- `http://yourdomain.com` redirects to `https://`.
- `https://yourdomain.com/does-not-exist` shows the 404 page.
- Star and Fork buttons show counts (they come from the GitHub API at page load;
  if GitHub is unreachable the counts from build time stay).
- Browser DevTools → Console shows no errors.

## Before going live

- **Donate link.** The Donate modal links to
  `https://github.com/sponsors/embeddedos-org`. That page only exists once
  GitHub Sponsors is enabled for the org. Search `index.html` for
  `sponsors/embeddedos-org` to change it.
- **Numbers.** Board, profile, example and footprint figures are from the EoS
  README at v0.5.0 — update the `data-count` attributes when they change.

## Changing Tailwind classes

`assets/css/tailwind.css` only contains the `tw-` classes the page uses. If you
add new ones, rebuild it:

```bash
npx tailwindcss@3.4.16 -c tailwind.config.js -i input.css -o assets/css/tailwind.css --minify
```

with `tailwind.config.js`:

```js
module.exports = {
  content: ['./**/*.html', './assets/js/**/*.js'],
  prefix: 'tw-',
  corePlugins: { preflight: false },
};
```

and `input.css` containing the three `@tailwind base; @tailwind components;
@tailwind utilities;` lines.

# 180ind.com — William Melendez Portfolio

This repo serves your personal portfolio at **https://180ind.com**.

It's a single static HTML file hosted on GitHub Pages. No build step, no framework, no deploy script — push to `main` and the site updates in ~1 minute.

---

## Where to edit the site

| Want to change… | Edit this file | Where it lives locally |
|---|---|---|
| Anything visible on the site (text, layout, colors, images) | `index.html` | `~/Documents/GitHub/180ind.com/index.html` |
| The custom domain | `CNAME` | `~/Documents/GitHub/180ind.com/CNAME` |
| The hero / about photos | the three `.jpeg`/`.png` files | same folder |

Everything is in **one HTML file** (`index.html`). CSS is inline at the top in a `<style>` block. Images are base64-embedded inside the HTML (which is why the file is ~526 KB). To replace an image, encode the new file to base64 and swap the `data:image/...;base64,...` string in the HTML.

---

## How to preview your changes locally

```bash
cd ~/Documents/GitHub/180ind.com
open index.html
```

That opens the file in your browser — what you see is what the live site will show. No server needed.

---

## How to publish your changes

```bash
cd ~/Documents/GitHub/180ind.com
git add index.html
git commit -m "describe what you changed"
git push
```

GitHub Pages rebuilds automatically. Wait ~1 minute, then refresh https://180ind.com.

---

## DNS setup (one-time, has to happen at your domain registrar)

For `https://180ind.com` to actually resolve to this GitHub Pages site, you need DNS records at whoever you bought the domain from. Look up "wm215 180ind.com" in your password manager or check email receipts to find the registrar (commonly GoDaddy, Namecheap, Google Domains, etc.). Then add these records:

**Apex domain (180ind.com):** four A records pointing to GitHub's IPs

| Type | Host | Value |
|---|---|---|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |

**Optional www subdomain (www.180ind.com → 180ind.com):**

| Type | Host | Value |
|---|---|---|
| CNAME | www | `wm215.github.io` |

DNS propagation takes anywhere from 5 minutes to 48 hours. Once it resolves, GitHub will auto-provision an HTTPS certificate.

**Until DNS is configured**, the site is also reachable at the GitHub-default URL: https://wm215.github.io/180ind.com/

---

## What's NOT here

- No build tools (no npm, no webpack, no Tailwind compiler)
- No deploy pipeline beyond `git push`
- No analytics, no contact form backend, no CMS

If you want to add any of those later, that's a "next phase" decision — for now the site is intentionally a single editable file.

---

## Need to redo the whole site?

Two options:

1. **Edit in place** — work on `index.html` directly. Good for tweaks.
2. **Start over from a template** — pick a portfolio template (a few good free ones: [Astro Resume](https://github.com/withastro/astro/tree/main/examples/portfolio), [Jekyll Resume Theme](https://jekyllrb.com/), [HTML5 UP](https://html5up.net/)), replace `index.html` with the new template's output, commit, push.

Ask Claude Code: "help me redo this portfolio site, I want X" and point it at this folder. It'll know what to do.

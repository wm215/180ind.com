// Structural safety checks for index.html.
//
// These guard against the failure modes this site has actually hit or could
// realistically hit: a truncated / cut-off file, broken navigation links, and
// malformed markup. They parse the real index.html — no copies, no mocks — so
// what passes here is what actually ships.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, it, expect, beforeAll } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

let document;
beforeAll(() => {
  document = new JSDOM(html).window.document;
});

describe('file is complete (not truncated)', () => {
  // Commit 1a58b97 fixed a truncated index.html that had lost its closing tags
  // and scroll-reveal JS. These assertions fail loudly if that happens again.
  it('ends with a closing </html> tag', () => {
    expect(html.trimEnd().endsWith('</html>')).toBe(true);
  });

  it('has a non-empty <title>', () => {
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.textContent.trim().length).toBeGreaterThan(0);
  });

  it('has a <body> with content', () => {
    expect(document.body).not.toBeNull();
    expect(document.body.children.length).toBeGreaterThan(0);
  });

  it('still contains the contact-form and scroll-reveal JS', () => {
    // The past truncation cut off the trailing <script>. Assert its key pieces
    // are present so a repeat is caught immediately.
    expect(html).toContain('function sendContactForm');
    expect(html).toContain('DOMContentLoaded');
    expect(html).toContain('IntersectionObserver');
  });
});

describe('navigation links resolve', () => {
  it('every in-page #anchor points at an element that exists', () => {
    const anchors = [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => href && href.length > 1); // ignore bare "#"

    const broken = anchors.filter((href) => {
      const id = href.slice(1);
      return document.getElementById(id) === null;
    });

    expect(broken, `broken anchor links: ${broken.join(', ')}`).toEqual([]);
  });
});

describe('markup hygiene', () => {
  it('has no duplicate id attributes', () => {
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    const seen = new Set();
    const dupes = new Set();
    for (const id of ids) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
    expect([...dupes], `duplicate ids: ${[...dupes].join(', ')}`).toEqual([]);
  });

  it('every image has an alt attribute (accessibility)', () => {
    const imgsWithoutAlt = [...document.querySelectorAll('img')].filter(
      (img) => !img.hasAttribute('alt')
    );
    expect(imgsWithoutAlt.length, 'images missing alt text').toBe(0);
  });

  it('declares a language and character encoding', () => {
    expect(document.documentElement.getAttribute('lang')).toBeTruthy();
    expect(document.querySelector('meta[charset]')).not.toBeNull();
  });
});

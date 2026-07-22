// Behavior tests for the contact form's Send Message button.
//
// This exercises the REAL sendContactForm() defined inline in index.html: the
// file is loaded into a browser-like environment with its own <script> executed,
// exactly as it runs for a visitor. That covers the validation branches and the
// mailto: link construction — the one piece of real logic on the site, and the
// piece most likely to break silently and lose an inbound message.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

let window;
let document;
let openMock;

beforeEach(() => {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    // Silence jsdom's "Not implemented: navigation" noise from the mailto fallback.
    virtualConsole: undefined,
  });
  window = dom.window;
  document = window.document;
  openMock = vi.fn(() => ({})); // pretend the mail client opened
  window.open = openMock;
});

function fillForm({ name = '', email = '', subject = '', message = '' }) {
  document.getElementById('cf-name').value = name;
  document.getElementById('cf-email').value = email;
  document.getElementById('cf-subject').value = subject;
  document.getElementById('cf-message').value = message;
}

describe('validation', () => {
  it('blocks sending when required fields are empty', () => {
    fillForm({ name: '', email: '', message: '' });
    window.sendContactForm();

    const status = document.getElementById('cf-status');
    expect(status.style.display).toBe('block');
    expect(status.textContent.toLowerCase()).toContain('please fill');
    expect(openMock).not.toHaveBeenCalled();
  });

  it('blocks sending when only some required fields are filled', () => {
    fillForm({ name: 'Jane', email: '', message: 'Hi' });
    window.sendContactForm();
    expect(openMock).not.toHaveBeenCalled();
  });
});

describe('mailto construction', () => {
  it('opens a mailto link with the visitor details when valid', () => {
    fillForm({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Speaking invite',
      message: 'Would you speak at our event?',
    });
    window.sendContactForm();

    expect(openMock).toHaveBeenCalledTimes(1);
    const url = openMock.mock.calls[0][0];
    expect(url.startsWith('mailto:wmelendez215@gmail.com')).toBe(true);

    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Speaking invite');
    expect(decoded).toContain('Jane Doe');
    expect(decoded).toContain('jane@example.com');
    expect(decoded).toContain('Would you speak at our event?');
  });

  it('falls back to a default subject when none is given', () => {
    fillForm({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    window.sendContactForm();

    const url = openMock.mock.calls[0][0];
    expect(decodeURIComponent(url)).toContain('Portfolio Inquiry');
  });

  it('safely encodes special characters so the link is not corrupted', () => {
    // An unescaped & or newline would truncate the mailto parameters and drop
    // part of the message. Encoding must survive a round-trip.
    fillForm({
      name: 'A & B Corp',
      email: 'team@ab.com',
      subject: 'R&D + growth',
      message: 'Line one\nLine two & more',
    });
    window.sendContactForm();

    const url = openMock.mock.calls[0][0];
    // Raw ampersands only ever separate real parameters, never appear in values.
    expect(url).toContain('%26'); // encoded &
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('A & B Corp');
    expect(decoded).toContain('R&D + growth');
    expect(decoded).toContain('Line one\nLine two & more');
  });

  it('shows a confirmation message after opening the mail client', () => {
    fillForm({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    window.sendContactForm();

    const status = document.getElementById('cf-status');
    expect(status.style.display).toBe('block');
    expect(status.textContent.length).toBeGreaterThan(0);
  });
});

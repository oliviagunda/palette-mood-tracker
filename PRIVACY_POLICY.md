# Privacy Policy

**Palette - Mood Tracker**
Last updated: June 7, 2026

---

## Overview

Palette - Mood Tracker is a Chrome extension that helps you log your daily mood using colors and short notes. Your privacy is important to us. This policy explains clearly what data is collected, how it is stored, and what we do with it.

**Short version: everything stays on your device. We collect nothing.**

---

## Data Collection

Palette - Mood Tracker does **not** collect, transmit, or share any personal data. We have no servers, no databases, and no analytics.

The only data the extension stores are:

- The mood color you assign to a day
- The optional note you write for that day

---

## Data Storage

All mood entries are stored **locally on your device** using Chrome's built-in `chrome.storage.local` API. This means:

- Your data never leaves your browser
- It is not synced to any external server
- It is not shared with any third party
- It is not accessible to the developer or anyone else

---

## Third-Party Services

The extension loads the Google Fonts stylesheet (`fonts.googleapis.com`) to display custom typography. This is a standard font request — no mood data or personal information is included in this request. You can review Google's privacy policy at [https://policies.google.com/privacy](https://policies.google.com/privacy).

No other third-party services, SDKs, or APIs are used.

---

## Permissions

The extension requests the following Chrome permission:

| Permission | Why it's needed |
|---|---|
| `storage` | To save your mood entries locally on your device |

No other permissions are requested.

---

## Data Deletion

To delete all your mood data, you can:

- Remove the extension from Chrome, which clears all locally stored data
- Or clear your Chrome extension storage via `chrome://settings/clearBrowserData`

---

## Children's Privacy

This extension is not directed at children under the age of 13 and does not knowingly collect any information from them.

---

## Changes to This Policy

If this privacy policy changes in the future, the updated version will be posted in this repository with a revised "Last updated" date.

---

## Contact

If you have any questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/oliviagunda/palette-mood-tracker).

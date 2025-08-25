# Credential Redirector Extension

A Chrome extension that automatically detects password input fields on web pages and redirects users for enhanced security purposes.

## Features

- **Real-time Detection**: Monitors web pages for password input fields (`<input type="password">`)
- **SPA Support**: Works with Single Page Applications (React, Vue, Angular)
- **Dynamic Content**: Detects password fields that appear after page load
- **Advanced Selectors**: Catches fields with password-related names, IDs, placeholders, and attributes
- **Instant Redirect**: Immediately redirects when credential forms are detected
- **Lightweight**: Minimal performance impact with efficient DOM monitoring

## Installation

### From Source
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **"Developer mode"** (top right toggle)
4. Click **"Load unpacked"**
5. Select the extension folder
6. The extension will be active immediately


## Configuration

### Redirect URL
By default, the extension redirects to my portfolio. To change this:

1. Open `content.js`
2. Find line: `window.location.replace("https://example.com");`
3. Replace with your desired URL
4. Reload the extension in Chrome

### Detection Sensitivity
The extension checks for password fields using multiple selectors:
- `input[type='password']`
- `input[name*='password']`
- `input[id*='password']`
- `input[placeholder*='password']`
- `input[autocomplete='current-password']`
- `input[autocomplete='new-password']`

##  How It Works

1. **Injection**: Content script runs on all web pages at `document_start`
2. **Monitoring**: Uses MutationObserver to watch for DOM changes
3. **Detection**: Scans for password-related input elements continuously
4. **Response**: Immediately redirects when password fields are found
5. **SPA Handling**: Monitors URL changes and history API for single-page applications

## Use Cases

### Primary Use Case: Sandbox Security Analysis
This extension was developed for **automated sandbox environments** that analyze unkown URLs received from suspicious sources (emails, messages, etc.). 

**How it works in sandbox:**
1. **URL Submission**: Sandbox receives potentially malicious URLs from email attachments or suspicious messages
2. **Automated Browser**: Sandbox opens URLs in controlled browser environment with this extension installed
3. **Credential Detection**: Extension monitors for password submission forms on the loaded pages
4. **Flag Generation**: When password fields are detected, extension redirects to a pre-configured "malicious" flag URL
5. **Analysis Result**: Sandbox interprets the redirect as "URL contains credential harvesting forms" - marking it as potentially malicious

**Example Flow:**
```
Suspicious Email URL → Sandbox Browser → Extension Detects Password Form → 
Redirects to http://sandbox-flag.internal/credential-detected → 
Sandbox marks URL as "Credential Harvesting Threat"
```

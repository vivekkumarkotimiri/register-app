# IT Asset Maintenance Register

A webpage for logging computer part replacements: computer ID, old/damaged
part, replacement part, date, and the technician who did the work — with
PDF export and a login gate for adding/deleting entries.

This version has a real backend, so the register is shared and accessible
from **any computer on the office network**, not just the one it was
entered on.

## Folder structure

```
register-app/
├── server/                 ← the backend (run this)
│   ├── server.js
│   ├── package.json
│   ├── .gitignore
│   └── data/
│       └── register.json   ← created automatically, holds all entries
├── public/                  ← the webpage (served by the backend)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── config.js
│       ├── api.js           ← talks to the backend
│       ├── ui.js
│       └── app.js
└── README.md
```

## 1. Requirements

Install **Node.js** (version 18 or newer) on ONE computer in the office —
this will act as the server everyone else connects to. Download it from
nodejs.org if it isn't already installed.

## 2. Set up and run the server

Open a terminal in the `server` folder and run:

```bash
npm install
npm start
```

You should see something like:

```
IT Asset Maintenance Register server is running.
  On this computer:   http://localhost:3000
  On the office LAN:  http://<this computer's IP address>:3000
```

Leave this terminal window open — closing it stops the server. (For
a more permanent setup, this computer should ideally stay on, and you
can look into running it as a background service later.)

## 3. Find this computer's address on the network

- **Windows**: open Command Prompt, run `ipconfig`, look for "IPv4 Address"
  (something like `192.168.1.23`).
- **Mac**: System Settings → Wi-Fi/Network → Details, or run `ifconfig`
  in Terminal and look for `inet` under your active network adapter.
- **Linux**: run `hostname -I` or `ip addr`.

## 4. Open it from any computer in the office

On the server computer itself: `http://localhost:3000`

On every other computer (same office network): `http://<that IP>:3000`
— for example, `http://192.168.1.23:3000`

Everyone sees and edits the same shared register, kept in
`server/data/register.json`.

> If another computer can't connect, check that the server computer's
> firewall allows incoming connections on port 3000.

## 5. Change the shared password

By default the password is `admin123`. Before sharing this with your
team, set a real one. Either:

- Edit the default directly in `server/server.js`, or
- (Recommended) set an environment variable when starting the server:
  ```bash
  ADMIN_PASSWORD=yourNewPassword npm start
  ```

Anyone who knows this password can sign in (top right of the page) to
add or delete entries. Without it, the register is view-only.

## Exporting to PDF

Click **Export PDF** on the page — this opens the browser's print
dialog with a clean printout of just the register table. Choose
"Save as PDF" as the destination.

## Backing up your data

All entries live in `server/data/register.json`. Back this file up
occasionally (copy it somewhere safe) in case the server computer has
problems.

## Future upgrades (optional, not required)

- Swap the JSON file for a real database (e.g. SQLite) if the register
  grows very large or you want more robust concurrent writes.
- Run the server automatically on startup (Windows Task Scheduler, a
  `systemd` service on Linux, etc.) so no one has to manually start it.
- Give each technician their own login instead of one shared password.

Ask if you'd like help with any of these later.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/hero-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/hero-light.svg">
    <img src="assets/readme/hero-dark.svg" width="880" alt="pi-documentation: a command-line tool that writes one HTML page per user documenting every Node-RED service under PM2. Example of the generated page with one service expanded.">
  </picture>
</p>

<p align="center">
  <strong>One HTML page per user that documents every Node-RED service running under PM2.</strong><br>
  <sub>Node.js, axios, Mustache and a Bash wrapper. It reads the PM2 ecosystem file and queries each instance's admin API.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-343A40?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Node--RED-343A40?style=flat-square&logo=nodered&logoColor=white" alt="Node-RED">
  <img src="https://img.shields.io/badge/Bash-343A40?style=flat-square&logo=gnubash&logoColor=white" alt="Bash">
  <img src="https://img.shields.io/badge/License-MIT-343A40?style=flat-square" alt="License: MIT">
</p>

<!-- TODO: demo link or video -->

---

When several Node-RED services run side by side under PM2, there is no single place to see what each one is running. This tool reads the PM2 `ecosystem.config.js`, calls the admin API of every service listed in it, and writes one HTML page per user. The page lists each service's IP, port, Node-RED version and Node.js version, plus every flow and subflow with its status and the notes written in its info field.

## How it works

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/how-it-works-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/how-it-works-light.svg">
    <img src="assets/readme/how-it-works-dark.svg" width="880" alt="How it works: ecosystem.config.js, gatherServiceData calls /flows, /settings and /diagnostics, serviceData.json, renderTemplate fills template.mustache and writes username.html.">
  </picture>
</p>

The tool runs in two steps. `gatherServiceData` collects data from every service and writes it to `serviceData.json`. `renderTemplate` then fills `template.mustache` with that JSON and writes `<username>.html`. Keeping the JSON on disk means the raw data can be checked separately from the rendered page.

- Services come from the PM2 `ecosystem.config.js`, not a hand-maintained list. Each app's `env` supplies `IP` (defaults to `localhost`), `PORT` and `TOKEN`.
- The three calls per service (`/flows`, `/settings`, `/diagnostics`) go out together with `Promise.all` and a bearer token.
- Only tabs and subflows are listed. Disabled flows are marked, and each flow's info text becomes its description.
- Services are handled one after another inside a `try/catch`. A failed service is logged and left off the page, and the rest still render.

| Area | Tools |
|---|---|
| Runtime | Node.js |
| HTTP | axios |
| Templating | Mustache |
| Wrapper | Bash (`document.sh`) |
| Target | Node-RED admin HTTP API, PM2 ecosystem files |

## Two modes

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/readme/modes-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/readme/modes-light.svg">
    <img src="assets/readme/modes-dark.svg" width="880" alt="Two modes: local documents one user; full runs as nodereddev, noderedtest and noderedprod and writes a page for each.">
  </picture>
</p>

`local` documents one user from one ecosystem file. `full` documents separate dev, test and prod instances in one run: it runs the script once per environment as that environment's system user through `sudo -u`, so each gets its own page from its own ecosystem file.

## Getting started

Requires Node.js and network access to the Node-RED instances. Each app in `ecosystem.config.js` needs `PORT` and `TOKEN` (a Node-RED admin API bearer token) in its `env` block, and can set `IP`.

```js
// ecosystem.config.js
module.exports = {
  apps: [
    { name: 'flows-dev', env: { IP: 'localhost', PORT: 1880, TOKEN: '<admin token>' } },
  ],
};
```

Install and run from the repo root. The script reads `template.mustache` and writes its output in the current directory.

```sh
npm install

# one user, one ecosystem file
./document.sh local <username> <path/to/ecosystem.config.js>

# dev, test and prod instances, each run as its own system user
./document.sh full <dev ecosystem.config.js> <test ecosystem.config.js> <prod ecosystem.config.js>
```

You can also call the script directly with `node nodeRedDocumentation.js <username> <path/to/ecosystem.config.js>`. Output is `serviceData.json` and `<username>.html`.

## License

MIT

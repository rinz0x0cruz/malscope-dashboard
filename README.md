# malscope-dashboard

Public, static build of the [malscope](https://github.com/rinz0x0cruz/malscope)
malware-analysis dashboard — a Nuxt 4 SPA that renders **redacted, defanged**
report manifests (`reports.json` + `intel.json`). The malscope tool itself stays
private; only this dashboard and its published data are public.

- **Live site:** https://rinz0x0cruz.github.io/malscope-dashboard/
- Every indicator is defanged (`hxxp`, `[.]`); no live samples, hashes-only.
- Ships with sample data; real data is generated in the private tool via
  `malscope index --emit-json` + `malscope correlate --emit-json` and committed
  under `public/data/`.

## Develop

```pwsh
npm install
npm run dev        # http://localhost:3000
npm run generate   # static build -> .output/public
```

Deploys automatically to GitHub Pages on push to `main` (see
`.github/workflows/deploy.yml`).

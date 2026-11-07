import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const production = { ...(pkg.dependencies ?? {}) };

const rows = Object.entries(production).map(([name, requestedVersion]) => {
  const manifestPath = path.join(root, "node_modules", ...name.split("/"), "package.json");
  let installedVersion = "not resolved";
  let license = "UNVERIFIED";
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    installedVersion = manifest.version ?? installedVersion;
    license = typeof manifest.license === "string" ? manifest.license : "UNVERIFIED";
  } catch {}
  return { name, requestedVersion, installedVersion, license };
}).sort((a, b) => a.name.localeCompare(b.name));

const counts = rows.reduce((map, row) => {
  map.set(row.license, (map.get(row.license) ?? 0) + 1);
  return map;
}, new Map());

const markdown = [
  "# Zynvori AI Production Dependency License Inventory",
  "",
  `Generated from the installed production dependencies on ${new Date().toISOString()}. This is an engineering inventory, not legal clearance. Review any UNVERIFIED entry, all notices, and the full license text before launch.`,
  "",
  "## Summary",
  "",
  "| Declared license | Package count |",
  "|---|---:|",
  ...[...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([license, count]) => `| ${license} | ${count} |`),
  "",
  "## Production dependencies",
  "",
  "| Package | Requested | Installed | Declared license |",
  "|---|---|---|---|",
  ...rows.map(row => `| ${row.name} | ${row.requestedVersion} | ${row.installedVersion} | ${row.license} |`),
  "",
];

fs.writeFileSync(path.join(root, "THIRD_PARTY_LICENSE_INVENTORY.md"), markdown.join("\n"));
console.log(`Wrote ${rows.length} production dependencies to THIRD_PARTY_LICENSE_INVENTORY.md`);

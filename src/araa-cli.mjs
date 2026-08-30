#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { analyzeAraaEvidence } from "./araa-core.js";

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath || inputPath === "--help") {
    console.error("Usage: npm run analyze -- ./evidence.json [./report.json]");
    process.exit(inputPath === "--help" ? 0 : 2);
  }
  const raw = await fs.readFile(inputPath, "utf8");
  const evidence = JSON.parse(raw);
  const report = analyzeAraaEvidence(evidence);
  const outputPath = process.argv[3];
  if (outputPath) await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
  else process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}

main().catch((error) => {
  console.error(`A Core Raa input error: ${error.message}`);
  process.exitCode = 1;
});

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "data", "coding");
const outFile = path.join(outDir, "coding-internet-000001.jsonl");
const version = "0.3.0";

const topics = [
  ["html", "https://developer.mozilla.org/en-US/docs/Web/HTML", "semantic structure, document metadata, forms, links, media, tables, and embedded content"],
  ["css", "https://developer.mozilla.org/en-US/docs/Web/CSS", "layout, cascade, specificity, responsive styling, and visual states"],
  ["javascript", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "events, modules, promises, errors, state, and browser APIs"],
  ["typescript", "https://www.typescriptlang.org/docs/", "types, interfaces, narrowing, modules, and compiler diagnostics"],
  ["accessibility", "https://www.w3.org/WAI/standards-guidelines/wcag/", "keyboard access, names, roles, focus, contrast, and user feedback"],
  ["web-performance", "https://web.dev/learn/performance", "loading, rendering, caching, image delivery, and responsiveness"],
  ["http", "https://developer.mozilla.org/en-US/docs/Web/HTTP", "methods, status codes, headers, caching, negotiation, and transport behavior"],
  ["https", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", "secure transport, certificates, mixed content, and origin boundaries"],
  ["cors", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", "cross-origin requests, preflight, credentials, and allowed origins"],
  ["api", "https://www.rfc-editor.org/rfc/rfc9110", "request contracts, validation, errors, pagination, and idempotency"],
  ["json", "https://www.rfc-editor.org/rfc/rfc8259", "serialization, encoding, schema shape, and malformed input handling"],
  ["websocket", "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", "connection lifecycle, messages, reconnects, and close handling"],
  ["service-worker", "https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API", "install, activate, cache strategies, updates, and offline behavior"],
  ["pwa", "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps", "manifest, installability, offline resources, and app-shell behavior"],
  ["browser-storage", "https://developer.mozilla.org/en-US/docs/Web/API/Storage_API", "cookies, local storage, indexed storage, quotas, and expiration"],
  ["security", "https://owasp.org/www-project-top-ten/", "injection, access control, configuration, dependency, and data exposure risks"],
  ["content-security-policy", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP", "script sources, nonce/hash policy, reporting, and unsafe fallback"],
  ["authentication", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication", "login challenges, sessions, token handling, and logout behavior"],
  ["oauth", "https://www.rfc-editor.org/rfc/rfc6749", "authorization flow, redirect validation, scopes, and token lifecycle"],
  ["dns", "https://www.cloudflare.com/learning/dns/what-is-dns/", "records, propagation, resolution, and hostname routing"],
  ["tls", "https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security", "certificate validity, protocol negotiation, and trust chains"],
  ["url-uri", "https://www.rfc-editor.org/rfc/rfc3986", "encoding, paths, query parameters, fragments, and canonicalization"],
  ["git", "https://git-scm.com/docs", "commits, branches, merges, remotes, and history recovery"],
  ["github", "https://docs.github.com/en/repositories", "repository permissions, pull requests, Actions, and release workflow"],
  ["github-actions", "https://docs.github.com/en/actions", "workflow triggers, jobs, artifacts, caching, and secret handling"],
  ["npm", "https://docs.npmjs.com/", "package metadata, lockfiles, scripts, registries, and dependency resolution"],
  ["testing", "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Testing", "unit, integration, browser, regression, and fixture coverage"],
  ["debugging", "https://developer.chrome.com/docs/devtools/", "console errors, network traces, source maps, and runtime inspection"],
  ["database", "https://www.postgresql.org/docs/current/ddl.html", "schema, constraints, transactions, indexes, and query correctness"],
  ["observability", "https://opentelemetry.io/docs/", "logs, metrics, traces, correlation, and alertable failures"],
  ["deployment", "https://12factor.net/", "configuration, processes, logs, release, rollback, and environment parity"],
  ["containers", "https://docs.docker.com/get-started/docker-overview/", "images, containers, networks, volumes, and health checks"],
  ["scraping", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API", "lawful retrieval, rate limits, robots policy, parsing, and failure handling"],
  ["media", "https://developer.mozilla.org/en-US/docs/Web/Media", "formats, preload, streaming, controls, and browser compatibility"],
  ["web-crypto", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API", "randomness, hashing, signatures, key handling, and secure context requirements"],
];

const issues = [
  ["fails to load", "inspect the browser network record, confirm the request URL and status, then fix the smallest failing dependency"],
  ["behaves differently across browsers", "reduce the case to a standards-based feature, check compatibility data, and provide a tested fallback"],
  ["returns an unexpected result", "log the input and normalized state, validate assumptions, and add a regression test for the observed case"],
  ["is rejected by a validator", "read the reported field or token, correct the document or payload, and rerun the validator"],
  ["becomes slow under normal use", "measure the critical path, identify the largest cost, and verify the optimization with before-and-after timings"],
  ["loses state after navigation", "identify the state owner and lifecycle boundary, then persist only the minimum required data"],
  ["produces an opaque error", "preserve a safe correlation identifier, record actionable diagnostics server-side, and return a stable public error"],
  ["breaks after a dependency update", "compare lockfile and release notes, isolate the changed interface, and pin or upgrade deliberately"],
  ["exposes data or behavior unexpectedly", "apply least privilege, validate untrusted input, and add a test that proves the boundary"],
  ["cannot be reproduced reliably", "capture the environment, inputs, timing, and relevant logs before changing the implementation"],
];

const contexts = [
  "a static landing page", "a responsive dashboard", "a server-rendered document", "a single-page application", "a form submission", "a navigation menu", "a modal dialog", "a data table", "a media gallery", "a game resource page", "an API client", "a webhook receiver", "a background sync", "a cache-first page", "a login flow", "a file upload", "a search result page", "a localization variant", "a CI deployment", "a production incident"
];

function slug(value) { return value.replace(/[^a-z0-9]+/gi, "-").toLowerCase(); }
function makeRecord(number, topic, issue, context) {
  const [topicName, source, scope] = topic;
  const [issueName, remedy] = issue;
  const symptom = `${topicName} ${issueName}`;
  return {
    id: `WEB-CODE-${String(number).padStart(5, "0")}`,
    domain: "coding",
    tags: ["internet", "web", topicName, slug(context), slug(symptom)],
    problem: `${topicName} ${issueName} in ${context}; the relevant scope is ${scope}.`,
    solution: `${remedy}. For this case, verify the ${topicName} contract and keep the change limited to ${context}.`,
    example: `Reproduce the ${topicName} case in ${context}, record the observed symptom, apply the smallest fix, and rerun the check.`,
    source,
    confidence: 0.72,
    version,
    tests: [`Reproduce: ${symptom} in ${context}.`, `Verify the relevant ${topicName} behavior in at least one supported browser or runtime.`, "Add a regression check for the original symptom."]
  };
}

const records = [];
let number = 1;
for (const topic of topics) for (const issue of issues) for (const context of contexts) records.push(makeRecord(number++, topic, issue, context));
if (records.length !== 7000) throw new Error(`Expected 7000 records, got ${records.length}`);
await mkdir(outDir, { recursive: true });
await writeFile(outFile, records.map((item) => JSON.stringify(item)).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ output: path.relative(root, outFile), records: records.length, topics: topics.length, issues: issues.length, contexts: contexts.length, version }, null, 2));

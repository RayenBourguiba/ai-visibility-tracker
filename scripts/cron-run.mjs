const base = process.env.BASE_URL || "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET missing");
  process.exit(1);
}

const engine = process.argv[2] || "OPENAI";
const promptSetKey = process.argv[3] || "";

const res = await fetch(`${base}/api/cron/run`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-cron-secret": secret,
  },
  body: JSON.stringify({ engine, promptSetKey: promptSetKey || undefined }),
});

const json = await res.json();
console.log(json);
import "dotenv/config";
import fetch from "node-fetch";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;
const CLIENT_ID = process.env.CLIENT_ID!;
const CLIENT_SECRET = process.env.CLIENT_SECRET!;
const EMAIL = process.env.EMAIL!;
const NAME = process.env.NAME!;
const ROLL_NO = process.env.ROLL_NO!;
const ACCESS_CODE = process.env.ACCESS_CODE!;

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function getToken(): Promise<string> {
  const res = await fetch(`${AUTH_BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: EMAIL,
      name: NAME,
      rollNo: ROLL_NO,
      accessCode: ACCESS_CODE,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  });
  const data = (await res.json()) as any;
  return `${data.token_type} ${data.access_token}`;
}

async function main() {
  const token = await getToken();
  console.log("Token fetched ✓");

  const res = await fetch(`${AUTH_BASE_URL}/notifications`, {
    headers: { Authorization: token },
  });
  const data = (await res.json()) as any;
  const notifications = data.notifications;

  const now = Date.now();

  const scored = notifications.map((n: any) => {
    const typeWeight = TYPE_WEIGHT[n.Type] ?? 0;
    const ageMs = now - new Date(n.Timestamp).getTime();
    const recencyScore = 1 / (1 + ageMs / 1000 / 60);
    const score = typeWeight + recencyScore;
    return { ...n, score };
  });

  const top10 = scored
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 10);

  console.log("\n=== TOP 10 PRIORITY NOTIFICATIONS ===\n");
  top10.forEach((n: any, i: number) => {
    console.log(`${i + 1}. [${n.Type}] ${n.Message} | ${n.Timestamp}`);
  });
}

main();
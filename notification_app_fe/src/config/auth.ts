// import { Log, setLogToken } from "../../../logging_middleware/src";

// type AuthResponse = {
//   token_type: string;
//   access_token: string;
//   expires_in: number;
// };

// const AUTH_BASE_URL = "http://4.224.186.213/evaluation-service";

// const CLIENT_ID = "881b2b88-b5d0-43c6-9bf1-0a0cd7707ba6";
// const CLIENT_SECRET = "zDPdryGAdnbEgHrW";
// const EMAIL = "e23cseu0899@bennett.edu.in";
// const NAME = "rahul kumar";
// const ROLL_NO = "e23cseu0899";
// const ACCESS_CODE = "TfDxgr";

// let cachedToken: string | null = null;
// let expiresAt = 0;

// const toExpiryMs = (expiresIn: number) => {
//   if (expiresIn > 1_000_000_000) {
//     return expiresIn * 1000;
//   }
//   return Date.now() + expiresIn * 1000;
// };

// const isTokenValid = () => {
//   if (!cachedToken) return false;
//   return Date.now() < expiresAt - 10_000;
// };

// export async function getAuthToken(): Promise<string> {
//   if (isTokenValid() && cachedToken) {
//     const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
//     await Log("frontend", "info", "auth", `Using cached token, expires in ${remaining}s`);
//     return cachedToken;
//   }

//   try {
//     await Log("frontend", "warn", "auth", "Token missing or expired, fetching new token");
//     const res = await fetch(`${AUTH_BASE_URL}/auth`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: EMAIL,
//         name: NAME,
//         rollNo: ROLL_NO,
//         accessCode: ACCESS_CODE,
//         clientID: CLIENT_ID,
//         clientSecret: CLIENT_SECRET,
//       }),
//     });

//     if (!res.ok) {
//       await Log("frontend", "error", "auth", `Auth failed with status ${res.status}`);
//       throw new Error(`Auth failed with status ${res.status}`);
//     }

//     const data = (await res.json()) as AuthResponse;
//     const token = `${data.token_type} ${data.access_token}`;
//     cachedToken = token;
//     expiresAt = toExpiryMs(data.expires_in);
//     setLogToken(token);

//     const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
//     await Log("frontend", "info", "auth", `Token fetched successfully, expires in ${remaining}s`);
//     return token;
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown auth error";
//     await Log("frontend", "error", "auth", `Auth token fetch failed: ${message}`);
//     throw err;
//   }
// }



import { Log, setLogToken } from "../../../logging_middleware/src";

type AuthResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
};

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_BASE_URL!;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET!;
const EMAIL = process.env.NEXT_PUBLIC_EMAIL!;
const NAME = process.env.NEXT_PUBLIC_NAME!;
const ROLL_NO = process.env.NEXT_PUBLIC_ROLL_NO!;
const ACCESS_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE!;

let cachedToken: string | null = null;
let expiresAt = 0;

const toExpiryMs = (expiresIn: number) => {
  if (expiresIn > 1_000_000_000) {
    return expiresIn * 1000;
  }
  return Date.now() + expiresIn * 1000;
};

const isTokenValid = () => {
  if (!cachedToken) return false;
  return Date.now() < expiresAt - 10_000;
};

export async function getAuthToken(): Promise<string> {
  if (isTokenValid() && cachedToken) {
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    await Log("frontend", "info", "auth", `Using cached token, expires in ${remaining}s`);
    return cachedToken;
  }

  try {
    await Log("frontend", "warn", "auth", "Token missing or expired, fetching new token");
    const res = await fetch(`${AUTH_BASE_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: EMAIL,
        name: NAME,
        rollNo: ROLL_NO,
        accessCode: ACCESS_CODE,
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      }),
    });

    if (!res.ok) {
      await Log("frontend", "error", "auth", `Auth failed with status ${res.status}`);
      throw new Error(`Auth failed with status ${res.status}`);
    }

    const data = (await res.json()) as AuthResponse;
    const token = `${data.token_type} ${data.access_token}`;
    cachedToken = token;
    expiresAt = toExpiryMs(data.expires_in);
    setLogToken(token);

    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    await Log("frontend", "info", "auth", `Token fetched successfully, expires in ${remaining}s`);
    return token;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown auth error";
    await Log("frontend", "error", "auth", `Auth token fetch failed: ${message}`);
    throw err;
  }
}
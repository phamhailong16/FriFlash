import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "60s", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";
const EMAIL = __ENV.TEST_EMAIL || "test@example.com";
const PASSWORD = __ENV.TEST_PASSWORD || "testpassword";

export default function () {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(loginRes, { "login 200": (r) => r.status === 200 });

  const token = loginRes.json("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const decksRes = http.get(`${BASE_URL}/api/v1/decks`, { headers });
  check(decksRes, { "decks 200": (r) => r.status === 200 });

  const statsRes = http.get(`${BASE_URL}/api/v1/stats/overview`, { headers });
  check(statsRes, { "stats 200": (r) => r.status === 200 });

  const deckId = decksRes.json("items.0.id");
  if (deckId) {
    const studyRes = http.get(`${BASE_URL}/api/v1/decks/${deckId}/study/words`, { headers });
    check(studyRes, { "study/words 200": (r) => r.status === 200 });
  }

  sleep(1);
}

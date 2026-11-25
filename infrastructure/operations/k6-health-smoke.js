import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:8080";

export const options = {
  stages: [
    { duration: "2m", target: 1 },
    { duration: "5m", target: 5 },
    { duration: "10m", target: 20 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/health`, {
    tags: { endpoint: "health" },
  });
  check(response, {
    "health endpoint returns 200": (r) => r.status === 200,
  });
  sleep(1);
}

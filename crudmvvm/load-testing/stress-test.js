import http from 'k6/http';
import { check, sleep } from 'k6';

const ALB_URL = 'http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.3'],
  },
};

export default function () {
  const res = http.get(`${ALB_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(0.5);
}

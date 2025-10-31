import http from 'k6/http';
import { check, sleep } from 'k6';

const ALB_URL = 'http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get(`${ALB_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has healthy status': (r) => {
      try {
        return JSON.parse(r.body).status === 'healthy';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.5);
}

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

const TEST_DURATION_SECONDS = 30;
const MAX_VUS = 10;

const ALB_URL = 'http://apiclientes-alb-1873885481.us-east-1.elb.amazonaws.com';

const JWT_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjE5NDc2MjAsImV4cCI6MTc2MTk1MTIyMCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlkIjoxLCJ1c2VybmFtZSI6Im9tYXJhbG1udCJ9.geP7-DALs8BwmeI6NOQkIuJFK-wOwvlmuGUBvN8cqovtG65NPc6LgvHg945w-Y36VGLFWiaQ0Vyk99ALyJiheaefsBv25Te0j_g8ccpYKynh3Fc1VxdqVYqvPXzzzZdz30pFyd9ANjWkRsvCXtFMwc6ZoUtLLtVqcKFejlCWeFHa7wJIbS-0KbW2p6TJGYbLALV9tNLkQWqh_SOh03zXoDX0kWCaiipocvMuPTZw_Fy72Mcn42qlWH-UcHNPecAvxXoswklG9Jb2dt9YnAyReTKMIkHq61Rm63FsWiXx-ez_b-Efz8VPjjtq81UukOttg59YupvdwCyKfdDNgA-ibQ';

const successRate = new Rate('successful_requests');
const errorRate = new Rate('failed_requests');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: `${Math.floor(TEST_DURATION_SECONDS * 0.33)}s`, target: Math.floor(MAX_VUS / 2) },
    { duration: `${Math.floor(TEST_DURATION_SECONDS * 0.33)}s`, target: MAX_VUS },
    { duration: `${Math.floor(TEST_DURATION_SECONDS * 0.34)}s`, target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    successful_requests: ['rate>0.9'],
  },
};

export default function () {
  const headersWithJWT = {
    'Authorization': `Bearer ${JWT_TOKEN}`,
  };

  const responses = {
    health: http.get(`${ALB_URL}/health`),
    clientes: http.get(`${ALB_URL}/api/cliente`, { headers: headersWithJWT }),
  };

  Object.keys(responses).forEach((key) => {
    const res = responses[key];

    const checkResult = check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });

    successRate.add(checkResult);
    errorRate.add(!checkResult);
    responseTime.add(res.timings.duration);

    if (!checkResult) {
      console.log(`Failed request to ${key}: ${res.status}`);
    }
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let output = '\n';
  output += `${indent}========================================\n`;
  output += `${indent}RESUMEN DE PRUEBA DE CARGA - ALB\n`;
  output += `${indent}========================================\n\n`;

  output += `${indent}Total de requests: ${data.metrics.http_reqs.values.count}\n`;
  output += `${indent}Requests exitosos: ${Math.round(data.metrics.successful_requests?.values.rate * 100 || 0)}%\n`;
  output += `${indent}Requests fallidos: ${Math.round(data.metrics.failed_requests?.values.rate * 100 || 0)}%\n\n`;

  output += `${indent}Tiempo de respuesta:\n`;
  output += `${indent}  - Promedio: ${Math.round(data.metrics.http_req_duration.values.avg)}ms\n`;
  output += `${indent}  - Min: ${Math.round(data.metrics.http_req_duration.values.min)}ms\n`;
  output += `${indent}  - Max: ${Math.round(data.metrics.http_req_duration.values.max)}ms\n`;
  output += `${indent}  - p95: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms\n`;
  output += `${indent}  - p99: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms\n\n`;

  output += `${indent}Throughput:\n`;
  output += `${indent}  - Requests/seg: ${Math.round(data.metrics.http_reqs.values.rate * 100) / 100}\n\n`;

  output += `${indent}========================================\n`;

  return output;
}

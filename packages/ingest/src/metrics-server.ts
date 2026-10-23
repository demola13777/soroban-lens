import { createServer, type Server } from 'node:http';
import type { IngestMetrics } from './metrics.js';

export function parseMetricsPort(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('metrics port must be an integer from 1 to 65535');
  }
  return port;
}

/** Opt-in endpoint. Binding failure rejects startup rather than losing monitoring silently. */
export async function startMetricsServer(
  metrics: IngestMetrics,
  port = 9090,
  host = '127.0.0.1',
  readinessMaxAgeMs = 6_000,
): Promise<Server> {
  const server = createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (request.url === '/healthz') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok' }));
      return;
    }
    if (request.url === '/readyz') {
      const ready = metrics.isReady(readinessMaxAgeMs);
      response.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ status: ready ? 'ready' : 'not_ready' }));
      return;
    }
    if (request.url !== '/metrics') {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : metrics.render());
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.removeListener('error', reject);
      resolve();
    });
  });
  return server;
}

export async function closeMetricsServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
}

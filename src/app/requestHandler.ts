import cluster from 'cluster';
import http from 'http';
import { db } from './db.js';
import { URL } from 'url';
import { clusterMode, cpusCount, PORT } from '../index.js';
import { ErrorMessage, Method, StatusCode } from './constants.js';
import { ServerResponse } from './ServerResponse.js';
import { getHostName } from './utils/getHostName.js';

const baseUrl = '/api/users';
const protocol = 'http://';

let currentPort: number;
let portIncrement = 0;

export const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  if (clusterMode && cluster.isMaster) {
    currentPort = Number(PORT) + 1 + (portIncrement++ % cpusCount);

    const body = (await getRequestBody(req)) || '';

    const hostname = getHostName(req.headers.host || '');

    const options = {
      hostname: hostname,
      port: currentPort,
      path: req.url,
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    let content = '';
    const request = http.request(options, (response) => {
      response.on('data', (chunk) => {
        content += chunk;
      });

      response.on('end', () => {
        console.log(`server ${hostname}:${currentPort} response on ${req.method} request`);
        
        const statusCode = response.statusCode || StatusCode.SERVER_ERROR;

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(content);
      });
    });

    request.write(body);
    request.end();
  } else {
    try {
      const method = req.method || '';
      const body = (await getRequestBody(req)) || '';

      const incomingUrl = req.url;
      const matchPattern = incomingUrl?.match(
        new RegExp(`^${baseUrl}(/[A-Za-z0-9-]+)?/?$`)
      );

      if (incomingUrl && matchPattern) {
        const url = new URL(incomingUrl, `${protocol}${req.headers.host}`);
        const id = matchPattern[1]?.slice(1) || '';
        const response = await execute(method, id, body);

        res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
        res.end(`${response.body}`);
      } else {
        res.writeHead(StatusCode.NOT_FOUND, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ErrorMessage.RESOURSE_NOT_FOUND));
      }
    } catch (err) {
      res.writeHead(StatusCode.SERVER_ERROR, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ErrorMessage.SERVER_ERROR));
    }
  }
};

export const execute = async (method: string, id: string, body: string) => {
  switch (method) {
    case Method.GET:
      if (!id) {
        return await db.getUsers();
      }
      return await db.getUser(id);
    case Method.POST:
      if (id) {
        return new ServerResponse(
          StatusCode.BAD_REQUEST,
          JSON.stringify(ErrorMessage.RESOURSE_NOT_FOUND)
        );
      }
      return await db.createUser(body);
    case Method.PUT:
      return await db.updateUser(id, body);
    case Method.DELETE:
      return await db.deleteUser(id);
    default: {
      throw new Error(ErrorMessage.NO_SUCH_METHOD);
    }
  }
};

const getRequestBody = (req: http.IncomingMessage): Promise<string> => {
  let body = '';
  return new Promise((resolve, reject) => {
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', (err) => reject(err));
  });
};

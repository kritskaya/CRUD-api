import cluster from 'cluster';
import { resolve } from 'dns';
import http from 'http';
import os from 'os';
import { URL } from 'url';
import { clusterMode, cpusCount, PORT } from '../index.js';
import { ErrorMessage, StatusCode } from './constants.js';
import { createUser, deleteUser, getUser, getUsers, updateUser } from './db.js';
import { ServerResponse } from './ServerResponse.js';
import { getHostName } from './utils/getHostName.js';

const baseUrl = '/api/users';
const protocol = 'http://';

// const port = process.env.PORT;
let currentPort;
let portIncrement = 0;

export const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  if (clusterMode && cluster.isMaster) {
    console.log('cluster-mode primary process');
    currentPort = Number(PORT) + 1 + (portIncrement++ % cpusCount);
    // console.log('currentPort', currentPort);

    const body = (await getRequestBody(req)) || '';

    const hostname = getHostName(req.headers.host || '');
    console.log(hostname);

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
        const statusCode = response.statusCode || StatusCode.SERVER_ERROR;

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(content);
      })
    });

    request.write(body);
    request.end();



    // const workerId = portIncrement++ % cpusCount + 1;
    // if (!cluster.workers) return;
    // cluster.workers[workerId]?.send(req.url || '');
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
        const response = execute(method, id, body);

        res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
        res.end(`${response.body}`);
      } else {
        res.writeHead(StatusCode.NOT_FOUND, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(ErrorMessage.RESOURSE_NOT_FOUND));
      }
    } catch {
      res.writeHead(StatusCode.SERVER_ERROR, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ErrorMessage.SERVER_ERROR));
    }
  }
};

const execute = (method: string, id: string, body: string) => {
  switch (method) {
    case 'GET':
      if (!id) {
        return getUsers();
      }
      return getUser(id);
    case 'POST':
      if (id) {
        return new ServerResponse(
          StatusCode.BAD_REQUEST,
          JSON.stringify(ErrorMessage.RESOURSE_NOT_FOUND)
        );
      }
      return createUser(body);
    case 'PUT':
      return updateUser(id, body);
    case 'DELETE':
      return deleteUser(id);
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

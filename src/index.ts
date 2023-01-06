import http from 'http';
import os from 'os';
import cluster from 'cluster';
import * as dotenv from 'dotenv';
import { execute, requestHandler } from './app/requestHandler.js';
import { CLUSTER_MODE, DEFAULT_PORT } from './app/constants.js';
import { db } from './app/db.js';
import { ServerResponse } from './app/ServerResponse.js';
import { DataToChildProcess, MasterRequestedData } from './app/types.js';

dotenv.config();
export const PORT = process.env.PORT || DEFAULT_PORT;

export const cpusCount = os.cpus().length;

export const server = http.createServer(requestHandler);

export const clusterMode = process.argv[2] === CLUSTER_MODE;

if (clusterMode) {
  if (!cluster.isWorker) {
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

    server.listen(PORT, () => {
      console.log(`Primary server started at port ${PORT}`);
    });

    for (let i = 0; i < cpusCount; i++) {
      cluster.fork({ PORT: DEFAULT_PORT + i + 1 });
    }

    cluster.on('message', async (worker, message: MasterRequestedData) => {
      const result: ServerResponse = await execute(
        message.method,
        message.args[0],
        message.args[1]
      );

      const dataToChildProcess: DataToChildProcess = {
        method: message.method,
        data: { statusCode: result.statusCode, body: result.body },
      };

      worker.send(dataToChildProcess);
    });
  } else {
    server.listen(process.env.PORT, () => {
      console.log(
        `Worker server with pid=${process.pid} started on port:${process.env.PORT}`
      );
    });

    process.on('message', (message: DataToChildProcess) => {
      db.emit(message.method, message.data);
    });
  }
} else {
  server.listen(process.env.PORT, () => {
    console.log(`server started at port ${PORT}`);
  });
}

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error('Address with this port is already in use...');
  }
});

process.on('exit', () => {
  server.close();
});

import http from 'http';
import os from 'os';
import cluster from 'cluster';
import * as dotenv from 'dotenv';
import { requestHandler } from './app/requestHandler.js';
import { CLUSTER_MODE, DEFAULT_PORT } from './app/constants.js';

dotenv.config();
export const PORT = process.env.PORT || DEFAULT_PORT;

export const cpusCount = os.cpus().length;

export const server = http.createServer(requestHandler);

// server.listen(PORT, () => {
//   console.log('args', process.argv);
//   console.log(`server started at port ${PORT}`);
// });

export const clusterMode = process.argv[2] === CLUSTER_MODE;

if (clusterMode) {
  if (!cluster.isWorker) {
    // const cpus = os.cpus();

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

    server.listen(PORT, () => {
      console.log(`Primary server started at port ${PORT}`);
    });

    for (let i = 0; i < cpusCount; i++) {
      cluster.fork({ PORT: DEFAULT_PORT + i + 1 });
    }

    cluster.on('message', () => {
      console.log('message was received by primary process');
    })
  } else {
    console.log(`Worker ${process.pid} started`);
    console.log('port', process.env.PORT);

    server.listen(process.env.PORT, () => {
      console.log(`server started at port ${PORT}`);
    });

    process.on('message', (message) => {
      console.log(`port: ${process.env.PORT}`);
    })
  }
} else {
  server.listen(process.env.PORT, () => {
    console.log(`server started at port ${PORT}`);
  });
}

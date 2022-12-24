import http from 'http';
import { requestHandler } from './app/requestHandler.js';

const PORT = 4000;

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

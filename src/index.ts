import http from 'http';
import * as dotenv from 'dotenv';
import { requestHandler } from './app/requestHandler.js';

dotenv.config();
const PORT = process.env.PORT;

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

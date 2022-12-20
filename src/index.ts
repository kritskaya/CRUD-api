import http from 'http';

const PORT = 4000;

const server = http.createServer((req, res) => {});

server.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

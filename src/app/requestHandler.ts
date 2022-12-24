import http from 'http';
import { URL } from 'url';
import { ErrorMessage, StatusCode } from './constants.js';

const baseUrl = '/api/users';
const protocol = 'http://';

export const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const method = req.method;

  const incomingUrl = req.url;
  const urlPattern = new RegExp(`^${baseUrl}(/[A-Za-z0-9-]+)$`);
  
  if (incomingUrl && incomingUrl.match(urlPattern)) {
    const url = new URL(incomingUrl, `${protocol}${req.headers.host}`);

    res.setHeader('Content-type', 'application-json');

    console.log(url);

    switch (method) {
    }
  } else {
    res.writeHead(StatusCode.BAD_REQUEST);
    res.end(`${StatusCode.BAD_REQUEST} ${ErrorMessage.RESOURSE_NOT_FOUND}`);
  }
};

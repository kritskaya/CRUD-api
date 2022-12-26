import http from 'http';
import { URL } from 'url';
import { ErrorMessage, StatusCode } from './constants.js';
import { getUsers } from './db.js';

const baseUrl = '/api/users';
const protocol = 'http://';

export const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const method = req.method;

  const incomingUrl = req.url;
  const urlPattern = new RegExp(`^${baseUrl}(/[A-Za-z0-9-]+)?$`);

  if (incomingUrl && incomingUrl.match(urlPattern)) {
    const url = new URL(incomingUrl, `${protocol}${req.headers.host}`);

    res.setHeader('Content-type', 'application-json');

    const response = execute(method);
    res.writeHead(response.statusCode);
    res.end(`${response.statusCode} ${response.body}`);
    // console.log(url);
  } else {
    res.writeHead(StatusCode.BAD_REQUEST);
    res.end(`${StatusCode.BAD_REQUEST} ${ErrorMessage.RESOURSE_NOT_FOUND}`);
  }
};

const execute = (method?: string, id?: string) => {
  switch (method) {
    case 'GET':
      if (!id) {
        return getUsers();
      }
    default: {
      throw new Error(ErrorMessage.NO_SUCH_METHOD);
    }
  }
};

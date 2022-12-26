import http from 'http';
import { URL } from 'url';
import { ErrorMessage, StatusCode } from './constants.js';
import { getUser, getUsers } from './db.js';

const baseUrl = '/api/users';
const protocol = 'http://';

export const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const method = req.method;

  const incomingUrl = req.url;
  const matchPattern = incomingUrl?.match(new RegExp(`^${baseUrl}(/[A-Za-z0-9-]+)?$`));

  res.setHeader('Content-type', 'application-json');

  if (incomingUrl && matchPattern) {
    const url = new URL(incomingUrl, `${protocol}${req.headers.host}`);
    const id = matchPattern[1].slice(1);
    console.log('id', id);

    const response = execute(method, id);

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
      return getUser(id);
    default: {
      throw new Error(ErrorMessage.NO_SUCH_METHOD);
    }
  }
};

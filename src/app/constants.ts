export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

export enum ErrorMessage {
  RESOURSE_NOT_FOUND = 'Requested resource is not found',
  USER_NOT_FOUND = 'Requested user is not found',
  NO_SUCH_METHOD = 'No such request method',
  INVALID_DATA = 'Format of received data is invalid',
  SERVER_ERROR = 'Internal server error',
}

export const DEFAULT_PORT = 4000;

export const CLUSTER_MODE = 'cluster';

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

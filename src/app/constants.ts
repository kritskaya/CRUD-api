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
}

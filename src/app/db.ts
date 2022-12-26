import { v4 as uuidv4, validate } from 'uuid';
import { ErrorMessage, StatusCode } from './constants.js';
import { User } from './entity/user.js';
import { ServerResponse } from './ServerResponse.js';

const users: User[] = [];

export const getUsers = () => {
  return new ServerResponse(StatusCode.OK, JSON.stringify(users));
};

export const getUser = (id: string) => {
  if (!validate(id)) {
    return new ServerResponse(StatusCode.BAD_REQUEST, ErrorMessage.INVALID_DATA);
  }

  const user = users.find((item) => item.id === id);
  if (!user) {
    return new ServerResponse(StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
  }

  return new ServerResponse(StatusCode.OK, JSON.stringify(user));
};

export const createUser = (data: string) => {
  const { username, age, hobbies } = JSON.parse(data) as User;

  if (!username || !age || !hobbies) {
    return new ServerResponse(StatusCode.BAD_REQUEST, ErrorMessage.INVALID_DATA);
  }

  const id = uuidv4();

  const newUser = new User(id, username, age, hobbies);
  users.push(newUser);

  return new ServerResponse(StatusCode.OK, JSON.stringify(newUser));
};

export const updateUser = (id: string, data: string) => {
  if (!validate(id)) {
    return new ServerResponse(StatusCode.BAD_REQUEST, ErrorMessage.INVALID_DATA);
  }

  const { username, age, hobbies } = JSON.parse(data) as User;

  if (!id || !username || !age || !hobbies) {
    return new ServerResponse(StatusCode.BAD_REQUEST, ErrorMessage.INVALID_DATA);
  }

  const user = users.find((item) => item.id === id);
  if (!user) {
    return new ServerResponse(StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
  }

  user.username = username;
  user.age = age;
  user.hobbies = hobbies;

  return new ServerResponse(StatusCode.OK, JSON.stringify(user));
};

import { ErrorMessage, StatusCode } from "./constants.js";
import { User } from "./entity/user.js";
import { ServerResponse } from "./ServerResponse.js";

const users: User[] | [] = [];

export const getUsers = () => {
  return new ServerResponse(StatusCode.OK, JSON.stringify(users));
}

export const getUser = (id: string) => {
  const user = users.find((item) => item.id === id);
  if (!user) {
    return new ServerResponse(StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
  }

  return new ServerResponse(StatusCode.OK, JSON.stringify(user));
}
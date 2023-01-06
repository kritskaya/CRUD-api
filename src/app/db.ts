import cluster from 'cluster';
import EventEmitter from 'events';
import { v4 as uuidv4, validate } from 'uuid';
import { ErrorMessage, Method, StatusCode } from './constants.js';
import { User } from './entity/user.js';
import { ServerResponse } from './ServerResponse.js';
import { MasterRequestedData } from './types.js';

class DB extends EventEmitter {
  private users: User[] = [];

  private sendDataToMaster = async (
    data: MasterRequestedData
  ): Promise<ServerResponse> => {
    return new Promise(
      (resolve) =>
        process.send &&
        process.send(data, () => {
          this.once(data.method, (message) =>
            resolve(new ServerResponse(message.statusCode, message.body))
          );
        })
    );
  };

  getUsers = async (): Promise<ServerResponse> => {
    if (cluster.isWorker) {
      const data: MasterRequestedData = { method: Method.GET, args: [] };
      return await this.sendDataToMaster(data);
    }
    return new ServerResponse(StatusCode.OK, JSON.stringify(this.users));
  };

  getUser = async (id: string) => {
    if (cluster.isWorker) {
      const data: MasterRequestedData = { method: Method.GET, args: [id] };
      return await this.sendDataToMaster(data);
    }

    if (!validate(id)) {
      return new ServerResponse(
        StatusCode.BAD_REQUEST,
        JSON.stringify(ErrorMessage.INVALID_DATA)
      );
    }

    const user = this.users.find((item) => item.id === id);
    if (!user) {
      return new ServerResponse(
        StatusCode.NOT_FOUND,
        JSON.stringify(ErrorMessage.USER_NOT_FOUND)
      );
    }

    return new ServerResponse(StatusCode.OK, JSON.stringify(user));
  };

  createUser = async (body: string) => {
    if (cluster.isWorker) {
      const data: MasterRequestedData = { method: Method.POST, args: ['', body] };
      return await this.sendDataToMaster(data);
    }

    const { username, age, hobbies } = JSON.parse(body) as User;

    if (!username || !age || !hobbies) {
      return new ServerResponse(
        StatusCode.BAD_REQUEST,
        JSON.stringify(ErrorMessage.INVALID_DATA)
      );
    }

    const id = uuidv4();

    const newUser = new User(id, username, age, hobbies);
    this.users.push(newUser);

    return new ServerResponse(StatusCode.CREATED, JSON.stringify(newUser));
  };

  updateUser = async (id: string, body: string) => {
    if (cluster.isWorker) {
      const data: MasterRequestedData = { method: Method.PUT, args: [id, body] };
      return await this.sendDataToMaster(data);
    }

    if (!validate(id)) {
      return new ServerResponse(
        StatusCode.BAD_REQUEST,
        JSON.stringify(ErrorMessage.INVALID_DATA)
      );
    }

    const { username, age, hobbies } = JSON.parse(body) as User;

    if (!id || !username || !age || !hobbies) {
      return new ServerResponse(
        StatusCode.BAD_REQUEST,
        JSON.stringify(ErrorMessage.INVALID_DATA)
      );
    }

    const user = this.users.find((item) => item.id === id);
    if (!user) {
      return new ServerResponse(
        StatusCode.NOT_FOUND,
        JSON.stringify(ErrorMessage.USER_NOT_FOUND)
      );
    }

    user.username = username;
    user.age = age;
    user.hobbies = hobbies;

    return new ServerResponse(StatusCode.OK, JSON.stringify(user));
  };

  deleteUser = async (id: string) => {
    if (cluster.isWorker) {
      const data: MasterRequestedData = { method: Method.DELETE, args: [id] };
      return await this.sendDataToMaster(data);
    }

    if (!validate(id)) {
      return new ServerResponse(
        StatusCode.BAD_REQUEST,
        JSON.stringify(ErrorMessage.INVALID_DATA)
      );
    }

    const user = this.users.find((item) => item.id === id);
    if (!user) {
      return new ServerResponse(
        StatusCode.NOT_FOUND,
        JSON.stringify(ErrorMessage.USER_NOT_FOUND)
      );
    }

    this.users = [...this.users.filter((item) => item.id !== id)];

    return new ServerResponse(StatusCode.NO_CONTENT, JSON.stringify(''));
  };
}

export const db = new DB();

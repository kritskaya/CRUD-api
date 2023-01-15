export class ServerResponse {
  #statusCode: number;
  #body: string;

  constructor(statusCode: number, body: string) {
    this.#statusCode = statusCode;
    this.#body = body;
  }

  get statusCode() {
    return this.#statusCode;
  }

  get body() {
    return this.#body;
  }
}

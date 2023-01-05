import { ServerResponse } from './ServerResponse.js';

export type DataToChildProcess = {
  method: string;
  data: { statusCode: number; body: string };
};

export type MasterRequestedData = {
  method: string;
  args: string[];
};

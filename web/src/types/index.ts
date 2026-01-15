// Types will be added in subsequent phases

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export * from './conversation';
export * from './message';
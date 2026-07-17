export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthPayload = {
  token: string;
  user: User;
};

export type MeResult = {
  me: User | null;
};

export type LoginResult = {
  login: AuthPayload;
};

export type RegisterResult = {
  register: AuthPayload;
};

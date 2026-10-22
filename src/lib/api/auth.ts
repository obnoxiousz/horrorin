import { api } from "./client";

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface RegisterResponse {
  ok: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
  };
}

/** Only data.error carries the message on failure (the page prints data.error). */
export const authApi = {
  register(body: RegisterBody) {
    return api.post<RegisterResponse>("/public/auth/register", body);
  },
};

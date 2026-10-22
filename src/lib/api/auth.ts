import { api } from "./client";

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  ok: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
  };
}

export const authApi = {
  register(payload: RegisterPayload) {
    return api.post<RegisterResponse>("/auth/register", payload);
  },
};

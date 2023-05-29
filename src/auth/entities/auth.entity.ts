export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface JwtPayload {
  id: number;
  username: string;
  first_name: string;
  patronymic: string;
  role: string;
  email?: string;
}

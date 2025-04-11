export interface JwtPayload {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  email?: string;
}

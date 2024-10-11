import { User } from "@prisma/client";
import { Request } from "express";

export interface DataStoredInToken {
  id: string;
}

export interface RequestWithUser extends Request {
  user: Partial<User>;
}

export interface AuthData {
  user: Partial<User>;
  token: string;
}

import { IUser, IAuthUser } from "./auth.interfaces";
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => IAuthUser | null;
export declare const sanitizeUser: (user: IUser) => IAuthUser;
//# sourceMappingURL=auth.utils.d.ts.map
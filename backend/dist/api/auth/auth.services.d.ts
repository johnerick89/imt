import { IUser, ILoginRequest, ILoginResponse, IRegisterRequest } from "./auth.interfaces";
export declare class AuthService {
    login(loginData: ILoginRequest): Promise<ILoginResponse>;
    register(registerData: IRegisterRequest): Promise<ILoginResponse>;
    getUserById(userId: string): Promise<IUser | null>;
}
//# sourceMappingURL=auth.services.d.ts.map
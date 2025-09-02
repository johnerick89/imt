import { UserStatus } from "@prisma/client";
import { ICreateUserRequest, IUpdateUserRequest, IUserFilters, IUserStats, IUserResponse, IUsersListResponse } from "./users.interfaces";
export declare class UsersService {
    createUser(userData: ICreateUserRequest): Promise<IUserResponse>;
    getUsers(filters: IUserFilters): Promise<IUsersListResponse>;
    getUserById(userId: string): Promise<IUserResponse>;
    updateUser(userId: string, userData: IUpdateUserRequest): Promise<IUserResponse>;
    toggleUserStatus(userId: string, status: UserStatus): Promise<IUserResponse>;
    deleteUser(userId: string): Promise<IUserResponse>;
    getUserStats(): Promise<{
        success: boolean;
        message: string;
        data?: IUserStats;
        error?: string;
    }>;
}
//# sourceMappingURL=users.services.d.ts.map
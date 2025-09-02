import { UserStatus } from "@prisma/client";
export interface IUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar: string | null;
    status: UserStatus;
    phone: string | null;
    address: string | null;
    organisation_id: string | null;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface ICreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar?: string;
    phone?: string;
    address?: string;
    organisation_id?: string;
}
export interface IUpdateUserRequest {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    organisation_id?: string;
    status?: UserStatus;
}
export interface IUserResponse {
    success: boolean;
    message: string;
    data?: IUser;
    error?: string;
}
export interface IUsersListResponse {
    success: boolean;
    message: string;
    data?: {
        users: IUser[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    error?: string;
}
export interface IUserFilters {
    search?: string;
    role?: string;
    status?: UserStatus;
    organisation_id?: string;
    page?: number;
    limit?: number;
}
export interface IUserStats {
    totalUsers: number;
    activeUsers: number;
    administrators: number;
    branches: number;
}
//# sourceMappingURL=users.interfaces.d.ts.map
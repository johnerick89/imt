"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const auth_utils_1 = require("./auth.utils");
const prisma = new client_1.PrismaClient();
class AuthService {
    async login(loginData) {
        try {
            const { email, password } = loginData;
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            created_at: true,
                            updated_at: true,
                        },
                    },
                },
            });
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            if (user.status !== "ACTIVE") {
                return {
                    success: false,
                    message: "Account is not active. Please contact support.",
                };
            }
            const isPasswordValid = await (0, auth_utils_1.comparePassword)(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { last_login: new Date() },
            });
            const token = (0, auth_utils_1.generateToken)(user);
            return {
                success: true,
                message: "Login successful",
                token,
                user: (0, auth_utils_1.sanitizeUser)(user),
            };
        }
        catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "Internal server error",
            };
        }
    }
    async register(registerData) {
        try {
            const { email, password, first_name, last_name, role, phone, address, organisation_id, } = registerData;
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return {
                    success: false,
                    message: "User with this email already exists",
                };
            }
            const hashedPassword = await (0, auth_utils_1.hashPassword)(password);
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    first_name,
                    last_name,
                    role: role || "USER",
                    phone,
                    address,
                    organisation_id,
                    status: "ACTIVE",
                },
            });
            const token = (0, auth_utils_1.generateToken)(newUser);
            return {
                success: true,
                message: "Registration successful",
                token,
                user: (0, auth_utils_1.sanitizeUser)(newUser),
            };
        }
        catch (error) {
            console.error("Registration error:", error);
            return {
                success: false,
                message: "Internal server error",
            };
        }
    }
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            return user;
        }
        catch (error) {
            console.error("Get user error:", error);
            return null;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.services.js.map
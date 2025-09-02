"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "",
        status: user.status,
        phone: user.phone || "",
        address: user.address || "",
        organisation_id: user.organisation_id || "",
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const sanitizeUser = (user) => {
    return {
        id: user.id,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "",
        status: user.status,
        phone: user.phone || "",
        address: user.address || "",
        organisation_id: user.organisation_id || "",
    };
};
exports.sanitizeUser = sanitizeUser;
//# sourceMappingURL=auth.utils.js.map
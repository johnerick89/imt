"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./api/auth"));
const users_1 = __importDefault(require("./api/users"));
const organisations_1 = __importDefault(require("./api/organisations"));
const audit_1 = __importDefault(require("./api/audit"));
const currencies_1 = __importDefault(require("./api/currencies"));
const countries_1 = __importDefault(require("./api/countries"));
const integrations_1 = __importDefault(require("./api/integrations"));
const corridors_1 = __importDefault(require("./api/corridors"));
const charges_1 = __importDefault(require("./api/charges"));
const occupations_1 = __importDefault(require("./api/occupations"));
const industries_1 = __importDefault(require("./api/industries"));
const customers_1 = __importDefault(require("./api/customers"));
const beneficiaries_1 = __importDefault(require("./api/beneficiaries"));
const branches_1 = __importDefault(require("./api/branches"));
const router = (0, express_1.Router)();
router.use("/api/v1/auth", auth_1.default);
router.use("/api/v1/users", users_1.default);
router.use("/api/v1/organisations", organisations_1.default);
router.use("/api/v1/audit", audit_1.default);
router.use("/api/v1/currencies", currencies_1.default);
router.use("/api/v1/countries", countries_1.default);
router.use("/api/v1/integrations", integrations_1.default);
router.use("/api/v1/corridors", corridors_1.default);
router.use("/api/v1/charges", charges_1.default);
router.use("/api/v1/occupations", occupations_1.default);
router.use("/api/v1/industries", industries_1.default);
router.use("/api/v1/customers", customers_1.default);
router.use("/api/v1/beneficiaries", beneficiaries_1.default);
router.use("/api/v1/branches", branches_1.default);
router.get("/api", (req, res) => {
    res.json({
        message: "IMT Money Transfer API",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: "/api/v1/auth",
            users: "/api/v1/users",
            organisations: "/api/v1/organisations",
            audit: "/api/v1/audit",
            currencies: "/api/v1/currencies",
            countries: "/api/v1/countries",
            integrations: "/api/v1/integrations",
            corridors: "/api/v1/corridors",
            charges: "/api/v1/charges",
            occupations: "/api/v1/occupations",
            industries: "/api/v1/industries",
            customers: "/api/v1/customers",
            beneficiaries: "/api/v1/beneficiaries",
            branches: "/api/v1/branches",
        },
    });
});
exports.default = router;
//# sourceMappingURL=routes.js.map
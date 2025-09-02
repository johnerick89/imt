"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countries_controller_1 = require("./countries.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const countryController = new countries_controller_1.CountryController();
router.use(auth_middleware_1.authMiddleware);
router.post("/", countryController.createCountry.bind(countryController));
router.get("/", countryController.getCountries.bind(countryController));
router.get("/all", countryController.getAllCountries.bind(countryController));
router.get("/stats", countryController.getCountryStats.bind(countryController));
router.get("/:id", countryController.getCountryById.bind(countryController));
router.put("/:id", countryController.updateCountry.bind(countryController));
router.delete("/:id", countryController.deleteCountry.bind(countryController));
exports.default = router;
//# sourceMappingURL=countries.routes.js.map
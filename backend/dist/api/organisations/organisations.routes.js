"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisations_controller_1 = require("./organisations.controller");
const router = (0, express_1.Router)();
const organisationsController = new organisations_controller_1.OrganisationsController();
router.post("/", organisationsController.createOrganisation.bind(organisationsController));
router.get("/", organisationsController.getOrganisations.bind(organisationsController));
router.get("/stats", organisationsController.getOrganisationStats.bind(organisationsController));
router.get("/all", organisationsController.getAllOrganisations.bind(organisationsController));
router.get("/:id", organisationsController.getOrganisationById.bind(organisationsController));
router.put("/:id", organisationsController.updateOrganisation.bind(organisationsController));
router.delete("/:id", organisationsController.deleteOrganisation.bind(organisationsController));
router.patch("/:id/status", organisationsController.toggleOrganisationStatus.bind(organisationsController));
exports.default = router;
//# sourceMappingURL=organisations.routes.js.map
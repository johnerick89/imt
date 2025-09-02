import { Router } from "express";
import { OrganisationsController } from "./organisations.controller";

const router = Router();
const organisationsController = new OrganisationsController();

// Create organisation
router.post(
  "/",
  organisationsController.createOrganisation.bind(organisationsController)
);

// Get all organisations with filters
router.get(
  "/",
  organisationsController.getOrganisations.bind(organisationsController)
);

// Get organisation stats
router.get(
  "/stats",
  organisationsController.getOrganisationStats.bind(organisationsController)
);

// Get all organisations
router.get(
  "/all",
  organisationsController.getAllOrganisations.bind(organisationsController)
);

// Get organisation by ID
router.get(
  "/:id",
  organisationsController.getOrganisationById.bind(organisationsController)
);

// Update organisation
router.put(
  "/:id",
  organisationsController.updateOrganisation.bind(organisationsController)
);

// Delete organisation
router.delete(
  "/:id",
  organisationsController.deleteOrganisation.bind(organisationsController)
);

// Toggle organisation status
router.patch(
  "/:id/status",
  organisationsController.toggleOrganisationStatus.bind(organisationsController)
);

export default router;

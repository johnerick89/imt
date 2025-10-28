import { Router } from "express";
import { OrganisationsController } from "./organisations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { aclMiddleware } from "../../middlewares/acl.middleware";

const router = Router();
const organisationsController = new OrganisationsController();

router.use(authMiddleware);

// Create organisation
router.post(
  "/",
  aclMiddleware({
    errorMessage: "You do not have permission to create new organisations",
    resource: "admin.organisations.create",
  }),
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

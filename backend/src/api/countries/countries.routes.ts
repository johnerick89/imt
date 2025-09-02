import { Router } from "express";
import { CountryController } from "./countries.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const countryController = new CountryController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Country routes
router.post("/", countryController.createCountry.bind(countryController));
router.get("/", countryController.getCountries.bind(countryController));
router.get("/all", countryController.getAllCountries.bind(countryController));
router.get("/stats", countryController.getCountryStats.bind(countryController));
router.get("/:id", countryController.getCountryById.bind(countryController));
router.put("/:id", countryController.updateCountry.bind(countryController));
router.delete("/:id", countryController.deleteCountry.bind(countryController));

export default router;

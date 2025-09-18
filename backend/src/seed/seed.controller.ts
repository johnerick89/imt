import { Request, Response } from "express";
import { seedDatabase } from "./index";
import { asyncHandler } from "../middlewares/error.middleware";

export class SeedController {
  createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const seeds = Array.isArray(req.body.seeds) ? req.body.seeds : [];
      const result = await seedDatabase(seeds);

      res.status(200).json(result);
    }
  );
}

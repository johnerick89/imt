import { Router } from "express";
import { transactionChannelController } from "./transactionchannels.controller";

const router = Router();

// Transaction Channel Routes
router.get(
  "/",
  transactionChannelController.getTransactionChannels.bind(
    transactionChannelController
  )
);

router.get(
  "/stats",
  transactionChannelController.getTransactionChannelStats.bind(
    transactionChannelController
  )
);

router.get(
  "/:id",
  transactionChannelController.getTransactionChannelById.bind(
    transactionChannelController
  )
);

export default router;

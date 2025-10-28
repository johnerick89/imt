import { Router } from "express";
import { OrgBalanceController } from "./orgbalances.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { aclMiddleware } from "../../middlewares/acl.middleware";

const router = Router();
const orgBalanceController = new OrgBalanceController();

router.use(authMiddleware);

// Job-related routes
router.post(
  "/jobs/close-periodic-balances",
  aclMiddleware({
    errorMessage:
      "You do not have permission to create/update agency float balances",
    resource: "admin.orgBalances.create",
  }),
  orgBalanceController.triggerClosePeriodicBalancesJob
);

// Periodic balance routes
router.get(
  "/:organisationId/periodic-balance",
  orgBalanceController.getCurrentPeriodicOrgBalance
);

router.post(
  "/:organisationId/periodic-balance",
  aclMiddleware({
    errorMessage:
      "You do not have permission to create/update agency float balances",
    resource: "admin.orgBalances.create",
  }),
  orgBalanceController.createPeriodicOrgBalance
);

router.post(
  "/:organisationId/close-periodic-balance",
  aclMiddleware({
    errorMessage:
      "You do not have permission to create/update agency float balances",
    resource: "admin.orgBalances.create",
  }),
  orgBalanceController.closePeriodicOrgBalance
);

export default router;

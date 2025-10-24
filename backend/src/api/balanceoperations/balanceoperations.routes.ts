import express from "express";
import { BalanceOperationController } from "./balanceoperations.controller";

const router = express.Router();
const balanceOperationController = new BalanceOperationController();

// Organisation Balance Operations
router.post(
  "/organisations/:orgId/opening-balance",
  balanceOperationController.prefundOrganisation.bind(
    balanceOperationController
  )
);

router.post(
  "/organisations/:orgId/prefund",
  balanceOperationController.prefundOrganisation.bind(
    balanceOperationController
  )
);

router.post(
  "/organisations/reduce-float",
  balanceOperationController.reduceOrganisationFloat.bind(
    balanceOperationController
  )
);

router.get(
  "/organisations/balances",
  balanceOperationController.getOrgBalances.bind(balanceOperationController)
);

router.get(
  "/organisations/balances/stats",
  balanceOperationController.getOrgBalanceStats.bind(balanceOperationController)
);

router.post(
  "/organisations/agency-float",
  balanceOperationController.createOrgFloatBalance.bind(
    balanceOperationController
  )
);

router.patch(
  "/organisations/balances/:balanceId/limit",
  balanceOperationController.updateFloatLimit.bind(balanceOperationController)
);

router.get(
  "/organisations/:orgId/balance-history",
  balanceOperationController.getOrgBalanceHistory.bind(
    balanceOperationController
  )
);

// Till Balance Operations
router.post(
  "/tills/:tillId/topup",
  balanceOperationController.topupTill.bind(balanceOperationController)
);

router.post(
  "/tills/:tillId/withdraw",
  balanceOperationController.withdrawTill.bind(balanceOperationController)
);

router.get(
  "/tills/:tillId/balance-history",
  balanceOperationController.getTillBalanceHistory.bind(
    balanceOperationController
  )
);

// Vault Balance Operations
router.post(
  "/vaults/:vaultId/topup",
  balanceOperationController.topupVault.bind(balanceOperationController)
);

router.post(
  "/vaults/:vaultId/withdraw",
  balanceOperationController.withdrawVault.bind(balanceOperationController)
);

router.get(
  "/vaults/:vaultId/balance-history",
  balanceOperationController.getVaultBalanceHistory.bind(
    balanceOperationController
  )
);

export default router;

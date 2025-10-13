import { prisma } from "../lib/prisma.lib";

async function main() {
  const organisations = await prisma.organisation.findMany({
    where: {
      type: {
        not: "CUSTOMER",
      },
    },
  });

  for (const organisation of organisations) {
    console.log(
      `\nDeleting organisation: ${organisation.name} (${organisation.id})`
    );

    // 1. Delete ChargesPaymentItem (depends on ChargesPayment)
    console.log("  - Deleting charges payment items...");
    const chargesPayments = await prisma.chargesPayment.findMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { destination_org_id: organisation.id },
        ],
      },
      select: { id: true },
    });
    await prisma.chargesPaymentItem.deleteMany({
      where: {
        charges_payment_id: {
          in: chargesPayments.map((cp) => cp.id),
        },
      },
    });

    // 2. Delete ChargesPayment
    console.log("  - Deleting charges payments...");
    await prisma.chargesPayment.deleteMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { destination_org_id: organisation.id },
        ],
      },
    });

    // 3. Delete TransactionAudit (depends on Transaction)
    console.log("  - Deleting transaction audits...");
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { origin_organisation_id: organisation.id },
          { destination_organisation_id: organisation.id },
        ],
      },
      select: { id: true },
    });
    await prisma.transactionAudit.deleteMany({
      where: {
        transaction_id: {
          in: transactions.map((t) => t.id),
        },
      },
    });

    // 4. Delete TransactionParty (depends on Transaction)
    console.log("  - Deleting transaction parties...");
    await prisma.transactionParty.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 5. Delete GlEntry (depends on GlAccount and GLTransaction)
    console.log("  - Deleting GL entries...");
    const glAccounts = await prisma.glAccount.findMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { counter_party_organisation_id: organisation.id },
        ],
      },
      select: { id: true },
    });
    await prisma.glEntry.deleteMany({
      where: {
        gl_account_id: {
          in: glAccounts.map((ga) => ga.id),
        },
      },
    });

    // 6. Delete BalanceHistory (depends on multiple entities)
    console.log("  - Deleting balance histories...");
    const tills = await prisma.till.findMany({
      where: { organisation_id: organisation.id },
      select: { id: true },
    });
    const vaults = await prisma.vault.findMany({
      where: { organisation_id: organisation.id },
      select: { id: true },
    });
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { organisation_id: organisation.id },
      select: { id: true },
    });
    const orgBalances = await prisma.orgBalance.findMany({
      where: {
        OR: [
          { base_org_id: organisation.id },
          { dest_org_id: organisation.id },
        ],
      },
      select: { id: true },
    });
    await prisma.balanceHistory.deleteMany({
      where: {
        OR: [
          { till_id: { in: tills.map((t) => t.id) } },
          { vault_id: { in: vaults.map((v) => v.id) } },
          { bank_account_id: { in: bankAccounts.map((ba) => ba.id) } },
          { org_balance_id: { in: orgBalances.map((ob) => ob.id) } },
        ],
      },
    });

    // 7. Delete GLTransaction
    console.log("  - Deleting GL transactions...");
    await prisma.gLTransaction.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 8. Delete TransactionCharge (depends on Transaction)
    console.log("  - Deleting transaction charges...");
    await prisma.transactionCharge.deleteMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { destination_organisation_id: organisation.id },
        ],
      },
    });

    // 9. Delete Transaction
    console.log("  - Deleting transactions...");
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { origin_organisation_id: organisation.id },
          { destination_organisation_id: organisation.id },
        ],
      },
    });

    // 10. Delete UserTill (depends on User and Till)
    console.log("  - Deleting user tills...");
    await prisma.userTill.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 11. Delete Till
    console.log("  - Deleting tills...");
    await prisma.till.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 12. Delete ExchangeRate
    console.log("  - Deleting exchange rates...");
    await prisma.exchangeRate.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 13. Delete Beneficiary (depends on Customer)
    console.log("  - Deleting beneficiaries...");
    await prisma.beneficiary.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 14. Delete Customer
    console.log("  - Deleting customers...");
    await prisma.customer.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 15. Delete GlAccount
    console.log("  - Deleting GL accounts...");
    await prisma.glAccount.deleteMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { counter_party_organisation_id: organisation.id },
        ],
      },
    });

    // 16. Delete BankAccount
    console.log("  - Deleting bank accounts...");
    await prisma.bankAccount.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 17. Delete OrgBalance
    console.log("  - Deleting org balances...");
    await prisma.orgBalance.deleteMany({
      where: {
        OR: [
          { base_org_id: organisation.id },
          { dest_org_id: organisation.id },
        ],
      },
    });

    // 18. Delete Vault
    console.log("  - Deleting vaults...");
    await prisma.vault.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 19. Delete Corridor
    console.log("  - Deleting corridors...");
    await prisma.corridor.deleteMany({
      where: {
        OR: [
          { origin_organisation_id: organisation.id },
          { organisation_id: organisation.id },
        ],
      },
    });

    // 20. Delete Charge
    console.log("  - Deleting charges...");
    await prisma.charge.deleteMany({
      where: {
        OR: [
          { origin_organisation_id: organisation.id },
          { destination_organisation_id: organisation.id },
        ],
      },
    });

    // 21. Delete Branch
    console.log("  - Deleting branches...");
    await prisma.branch.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 22. Delete UserActivity
    console.log("  - Deleting user activities...");
    await prisma.userActivity.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 23. Delete Integration (both organisation_id and origin_organisation_id)
    console.log("  - Deleting integrations...");
    await prisma.integration.deleteMany({
      where: {
        OR: [
          { organisation_id: organisation.id },
          { origin_organisation_id: organisation.id },
        ],
      },
    });

    // 24. Delete User
    console.log("  - Deleting users...");
    await prisma.user.deleteMany({
      where: {
        organisation_id: organisation.id,
      },
    });

    // 25. Finally, delete Organisation
    console.log("  - Deleting organisation...");
    await prisma.organisation.delete({
      where: { id: organisation.id },
    });

    console.log(`✓ Successfully deleted organisation: ${organisation.name}`);
  }

  console.log(
    `\n✓ All test data deleted successfully. Processed ${organisations.length} organisation(s).`
  );
}
// Only run main() when this file is executed directly (not when imported)
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      console.log("Seed operation completed successfully");
    });
}

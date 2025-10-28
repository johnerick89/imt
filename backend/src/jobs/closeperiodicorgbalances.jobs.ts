import * as cron from "node-cron";
import { OrgBalanceService } from "../api/orgbalances/orgbalances.service";

// System user ID for automated jobs
const SYSTEM_USER_ID = "system-job-runner";

export class ClosePeriodicOrgBalancesJob {
  private orgBalanceService: OrgBalanceService;

  constructor() {
    this.orgBalanceService = new OrgBalanceService();
  }

  /**
   * Initialize the monthly job to close all periodic org balances
   * Runs on the 1st day of every month at 1:00 AM UTC
   * Cron pattern: "0 1 1 * *"
   * - 0: minute (0)
   * - 1: hour (1 AM)
   * - 1: day of month (1st)
   * - *: month (every month)
   * - *: day of week (any day)
   */
  public initializeJob(): void {
    console.log("Initializing ClosePeriodicOrgBalancesJob...");

    cron.schedule(
      "0 1 1 * *",
      async () => {
        console.log("Starting monthly periodic org balances closure job...");

        try {
          const result =
            await this.orgBalanceService.closeAllPeriodicOrgBalances({
              userId: SYSTEM_USER_ID,
            });

          console.log(
            "Monthly periodic org balances closure completed:",
            result.message
          );
        } catch (error) {
          console.error(
            "Error in monthly periodic org balances closure job:",
            error
          );
        }
      },
      {
        timezone: "UTC",
      }
    );

    console.log(
      "ClosePeriodicOrgBalancesJob scheduled to run monthly at 1:00 AM UTC"
    );
  }

  /**
   * Manually trigger the job (useful for testing or manual execution)
   */
  public async runManually(): Promise<{ success: boolean; message: string }> {
    console.log("Manually running periodic org balances closure job...");

    try {
      const result = await this.orgBalanceService.closeAllPeriodicOrgBalances({
        userId: SYSTEM_USER_ID,
      });

      console.log(
        "Manual periodic org balances closure completed:",
        result.message
      );
      return result;
    } catch (error) {
      console.error(
        "Error in manual periodic org balances closure job:",
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const closePeriodicOrgBalancesJob = new ClosePeriodicOrgBalancesJob();

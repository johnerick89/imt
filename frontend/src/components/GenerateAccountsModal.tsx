import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./ui/Modal";
import { useSession } from "../hooks";
import type { GenerateAccountsRequest } from "../types/GlAccountsTypes";

interface GenerateAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateAccountsRequest) => void;
  isLoading?: boolean;
}

const GenerateAccountsModal: React.FC<GenerateAccountsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { user } = useSession();
  const organisationId = user?.organisation_id;

  const [selectedOptions, setSelectedOptions] = useState({
    generate_for_bank_accounts: true,
    generate_for_tills: true,
    generate_for_vaults: true,
    generate_for_charges: true,
    generate_for_charges_payments: true,
    generate_for_org_balances: true,
    generate_for_inbound_beneficiary_payments: true,
    generate_for_agency_floats: true,
  });

  const { handleSubmit, reset } = useForm<GenerateAccountsRequest>({
    defaultValues: {
      organisation_id: organisationId || "",
      generate_for_bank_accounts: true,
      generate_for_tills: true,
      generate_for_vaults: true,
      generate_for_charges: true,
      generate_for_charges_payments: true,
      generate_for_org_balances: true,
      generate_for_inbound_beneficiary_payments: true,
      generate_for_agency_floats: true,
    },
  });

  const handleFormSubmit = (data: GenerateAccountsRequest) => {
    onSubmit({
      ...data,
      ...selectedOptions,
    });
    reset();
  };

  const handleClose = () => {
    reset();
    setSelectedOptions({
      generate_for_bank_accounts: true,
      generate_for_tills: true,
      generate_for_vaults: true,
      generate_for_charges: true,
      generate_for_charges_payments: true,
      generate_for_org_balances: true,
      generate_for_inbound_beneficiary_payments: false,
      generate_for_agency_floats: true,
    });
    onClose();
  };

  const handleOptionChange = (option: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate GL Accounts"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Generate accounts for:
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_org_balances}
                onChange={() => handleOptionChange("generate_for_org_balances")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Organisation Balances (Asset accounts)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_bank_accounts}
                onChange={() =>
                  handleOptionChange("generate_for_bank_accounts")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Bank Accounts (Asset accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_tills}
                onChange={() => handleOptionChange("generate_for_tills")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Tills (Asset accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_vaults}
                onChange={() => handleOptionChange("generate_for_vaults")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Vaults (Asset accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_charges}
                onChange={() => handleOptionChange("generate_for_charges")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Charges (Revenue accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_charges_payments}
                onChange={() =>
                  handleOptionChange("generate_for_charges_payments")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Charges Payments (Expense accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={
                  selectedOptions.generate_for_inbound_beneficiary_payments
                }
                onChange={() =>
                  handleOptionChange(
                    "generate_for_inbound_beneficiary_payments"
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Inbound Beneficiary Payments (Liability accounts)
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.generate_for_agency_floats}
                onChange={() =>
                  handleOptionChange("generate_for_agency_floats")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">
                Agency Floats (Liability accounts)
              </span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-800 text-sm">
              <p className="font-medium">Note:</p>
              <p>
                This will create GL accounts for the selected entities. Existing
                accounts will be skipped to avoid duplicates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Accounts"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateAccountsModal;

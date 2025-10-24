import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { FormItem } from "./ui/FormItem";
import { useUsers } from "../hooks/useUsers";
import type {
  Transaction,
  MarkAsReadyRequest,
} from "../types/TransactionsTypes";
import { useSession } from "../hooks";

interface MarkAsReadyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: MarkAsReadyRequest) => void;
  transaction: Transaction | null;
  isLoading?: boolean;
}

const MarkAsReadyModal: React.FC<MarkAsReadyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isLoading = false,
}) => {
  const [remarks, setRemarks] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const { user } = useSession();

  // Get users from the same organisation
  const { data: usersData } = useUsers({
    organisation_id: user?.organisation_id || "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRemarks("");
      setAssignedTo("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: MarkAsReadyRequest = {
      remarks: remarks.trim() || undefined,
      assigned_to: assignedTo || undefined,
    };

    onConfirm(data);
  };

  const handleClose = () => {
    setRemarks("");
    setAssignedTo("");
    onClose();
  };

  if (!transaction) return null;

  const userOptions =
    usersData?.data?.users.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.email})`,
    })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark Transaction as Ready"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Info */}

        {/* Remarks */}

        {/* Reassign To */}
        <FormItem label="Reassign To (Optional)">
          <SearchableSelect
            options={userOptions}
            value={assignedTo}
            onChange={setAssignedTo}
            placeholder="Select user to reassign to..."
          />
        </FormItem>
        <FormItem label="Remarks (Optional)">
          <Input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {remarks.length}/500 characters
          </div>
        </FormItem>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isLoading ? "Marking as Ready..." : "Mark as Ready"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MarkAsReadyModal;

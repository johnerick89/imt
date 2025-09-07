import React, { useMemo } from "react";
import { DataTable } from "./DataTable";
import RoleActionCell from "./RoleActionCell";
import type { Role } from "../types/RolesTypes";
import type { ColumnDef } from "@tanstack/react-table";

interface RolesTableProps {
  roles: Role[];
  loading: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-gray-500">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => (
          <div>
            <span className="text-sm text-gray-600">
              {row.original.permissions?.length || 0} permission(s)
            </span>
          </div>
        ),
      },
      {
        accessorKey: "created_by_user",
        header: "Created By",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.created_by_user
              ? `${row.original.created_by_user.first_name} ${row.original.created_by_user.last_name}`
              : "System"}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RoleActionCell
            role={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete]
  );

  return (
    <DataTable
      data={roles}
      columns={columns}
      loading={loading}
      emptyMessage="No roles found"
    />
  );
};

export default RolesTable;

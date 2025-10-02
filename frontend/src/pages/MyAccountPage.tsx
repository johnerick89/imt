import React, { useState } from "react";
import UserProfilePage from "./UserProfilePage";
import OrganisationProfilePage from "./OrganisationProfilePage";
import { usePermissions } from "../hooks/usePermissions";
import { useSession } from "../hooks";

const MyAccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"user" | "organisation">("user");
  const { user } = useSession();
  const { canViewOrganisations } = usePermissions();
  const userOrganisationId = user?.organisation_id;
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("user")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "user"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Account
            </button>
            {canViewOrganisations() && (
              <button
                onClick={() => setActiveTab("organisation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "organisation"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Organisation
              </button>
            )}
          </nav>
        </div>
      </div>
      {activeTab === "user" ? (
        <UserProfilePage />
      ) : (
        <OrganisationProfilePage organisationId={userOrganisationId} />
      )}
    </div>
  );
};

export default MyAccountPage;

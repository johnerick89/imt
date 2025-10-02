import { ICreateOrganisationRequest } from "./organisations.interfaces";
import { UsersService } from "../users/users.services";
import { prisma } from "../../lib/prisma.lib";

const DEFAULT_PASSWORD = "admin1234";

const usersService = new UsersService();
const createContactPerson = async (
  organisationData: ICreateOrganisationRequest,
  organisationId: string,
  tx?: any
) => {
  const db = tx || prisma;

  // Use provided role_id or fall back to Admin role
  let selectedRole;
  if (organisationData.contact_role_id) {
    selectedRole = await db.role.findUnique({
      where: { id: organisationData.contact_role_id },
    });
    if (!selectedRole) {
      throw new Error("Selected role not found");
    }
  } else {
    selectedRole = await db.role.findFirst({
      where: { name: "Admin" },
    });
    if (!selectedRole) {
      throw new Error("Admin role not found");
    }
  }

  const firstName = organisationData.contact_person.split(" ")[0];
  const lastName = organisationData.contact_person.split(" ")[1];
  const contactPerson = await usersService.createUser(
    {
      email: organisationData.contact_email,
      first_name: firstName,
      last_name: lastName,
      role: selectedRole?.name,
      role_id: selectedRole?.id,
      password: organisationData.contact_password || DEFAULT_PASSWORD,
      organisation_id: organisationId,
    },
    tx
  );

  return contactPerson;
};

export { createContactPerson };

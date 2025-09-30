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

  const adminRole = await db.role.findFirst({
    where: { name: "Admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found");
  }

  const firstName = organisationData.contact_person.split(" ")[0];
  const lastName = organisationData.contact_person.split(" ")[1];
  const contactPerson = await usersService.createUser(
    {
      email: organisationData.contact_email,
      first_name: firstName,
      last_name: lastName,
      role: adminRole?.name,
      role_id: adminRole?.id,
      password: organisationData.contact_password || DEFAULT_PASSWORD,
      organisation_id: organisationId,
    },
    tx
  );

  return contactPerson;
};

export { createContactPerson };

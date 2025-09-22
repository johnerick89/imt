import { ICreateOrganisationRequest } from "./organisations.interfaces";
import { UsersService } from "../users/users.services";
import { prisma } from "../../lib/prisma.lib";

const DEFAULT_PASSWORD = "admin1234";

const usersService = new UsersService();
const createContactPerson = async (
  organisationData: ICreateOrganisationRequest,
  organisationId: string
) => {
  const adminRole = await prisma.role.findFirst({
    where: { name: "Admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found");
  }

  const firstName = organisationData.contact_person.split(" ")[0];
  const lastName = organisationData.contact_person.split(" ")[1];
  const contactPerson = await usersService.createUser({
    email: organisationData.contact_email,
    first_name: firstName,
    last_name: lastName,
    role: adminRole?.name,
    role_id: adminRole?.id,
    password: DEFAULT_PASSWORD,
    organisation_id: organisationId,
  });

  return contactPerson;
};

export { createContactPerson };

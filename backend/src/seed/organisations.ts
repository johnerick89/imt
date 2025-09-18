import {
  OrganisationType,
  IntegrationMethod,
  OrganisationStatus,
} from "@prisma/client";
const organisations = [
  {
    name: "Customer Organisation",
    description: "Customer Organisation",
    type: "CUSTOMER" as OrganisationType,
    integration_mode: "INTERNAL" as IntegrationMethod,
    status: "ACTIVE" as OrganisationStatus,
    contact_person: "Customer Organisation",
    contact_email: "customer@organisation.com",
    contact_phone: "1234567890",
    contact_address: "1234567890",
    contact_city: "Customer Organisation",
    contact_state: "Customer Organisation",
    contact_zip: "1234567890",
    country_code: "KE",
  },
];

export default organisations;

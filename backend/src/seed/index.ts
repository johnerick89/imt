import { IntegrationType, PrismaClient, UserStatus } from "@prisma/client";
import countries from "./countries";
import roles from "./roles";
import permissions from "./permissions";
import currencies from "./currencies";
import transactionChannels from "./transactionChannels";
import branches from "./branches";
import { hashPassword } from "../api/auth/auth.utils";
import occupations from "./occupations";
import industries from "./industries";
import organisations from "./organisations";
import { prisma } from "../lib/prisma.lib";

const DEFAULT_PASSWORD = "admin1234";

export async function seedRoles() {
  const createdRoles = await Promise.all(
    roles.map(async (role) => {
      const createdRole = await prisma.role.findFirst({
        where: { name: role.role_name },
      });
      if (createdRole) {
        return createdRole;
      }
      return await prisma.role.create({
        data: {
          name: role.role_name,
          description: role.role_description,
          created_at: new Date(),
        },
      });
    })
  );
  console.log("Roles created:", createdRoles.length);
}

export async function seedUsers() {
  const email = "johndoe@example.com";
  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (user) {
    return;
  }
  const role = await prisma.role.findFirst({
    where: { name: "System Engineer" },
  });

  const user1 = await prisma.user.create({
    data: {
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      password: await hashPassword(DEFAULT_PASSWORD),
      status: "ACTIVE",
      role: "System Engineer",
      user_role: {
        connect: {
          id: role?.id,
        },
      },
    },
  });
  console.log({ user1 });
}

export async function seedOrganisations() {
  const createdOrganisations = await Promise.all(
    organisations.map(async (organisation) => {
      let createdOrganisation = await prisma.organisation.findFirst({
        where: { name: organisation.name },
      });
      if (!createdOrganisation) {
        createdOrganisation = await prisma.organisation.findFirst({
          where: { type: organisation.type },
        });
      }
      if (createdOrganisation) {
        return createdOrganisation;
      }
      const adminUser = await prisma.user.findFirst({
        where: { email: "johndoe@example.com" },
      });
      const country = await prisma.country.findFirst({
        where: { code: organisation.country_code },
      });
      const { country_code, ...organisationData } = organisation;
      createdOrganisation = await prisma.organisation.create({
        data: {
          ...organisationData,
          created_by: adminUser?.id,
          country_id: country?.id,
        },
      });

      const adminRole = await prisma.role.findFirst({
        where: { name: "Admin" },
      });

      await prisma.user.create({
        data: {
          email: organisation.contact_email,
          password: await hashPassword(DEFAULT_PASSWORD),
          first_name: organisation.name,
          last_name: organisation.name,
          role: "Admin",
          role_id: adminRole?.id,
          organisation_id: createdOrganisation.id,
        },
      });

      return createdOrganisation;
    })
  );
  console.log("Organisations created:", createdOrganisations.length);
}

export async function seedAdminUser({
  admin_name,
  contact_email,
  contact_phone,
}: {
  admin_name: string;
  contact_email: string;
  contact_phone: string;
}) {
  const user = await prisma.user.findFirst({
    where: { email: contact_email },
  });
  if (user) {
    return user;
  }
  const role = await prisma.role.findFirst({
    where: { name: "Super Admin" },
  });
  const adminNameArray = admin_name ? admin_name.split(" ") : [];
  const adminUserData = {
    email: contact_email,
    password: await hashPassword(DEFAULT_PASSWORD),
    first_name: adminNameArray[0] || "Admin",
    last_name: adminNameArray.slice(1).join(" ") || "User",
    phone: contact_phone,
    status: "ACTIVE" as UserStatus,
    role: "Super Admin",
    user_role: {
      connect: {
        id: role?.id,
      },
    },
  };
  return await prisma.user.create({
    data: adminUserData,
  });
}

export async function seedPermissions() {
  const createdPermissions = await Promise.all(
    permissions.map(async (permission) => {
      const createdPermission = await prisma.permission.findFirst({
        where: {
          name: permission.permission_name,
        },
      });

      if (createdPermission) {
        return createdPermission;
      }
      return prisma.permission.create({
        data: {
          name: permission.permission_name,
          description: permission.permission_description,
          created_at: new Date(),
        },
      });
    })
  );
  console.log("Permissions created:", createdPermissions.length);
}

export async function seedRolesPermissions() {
  const createdRoles = await prisma.role.findMany();
  const createdPermissions = await prisma.permission.findMany();
  const rolePermissions = await Promise.all([
    createdRoles.flatMap(async (role) =>
      createdPermissions.map(async (permission) => {
        const rolePermission = await prisma.rolePermission.findFirst({
          where: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });

        if (rolePermission) {
          return rolePermission;
        }
        return await prisma.rolePermission.create({
          data: {
            role_id: role.id,
            permission_id: permission.id,
            created_at: new Date(),
          },
        });
      })
    ),
  ]);

  console.log("rolePermissions created:", rolePermissions.length);
}

export async function seedCountries() {
  const createdCountries = await Promise.all(
    countries.map(async (country) => {
      const createdCountry = await prisma.country.findFirst({
        where: { name: country.name },
      });

      if (createdCountry) {
        return createdCountry;
      }
      return await prisma.country.create({
        data: {
          name: country.name,
          code: country.code,
          created_at: new Date(),
        },
      });
    })
  );
  console.log("Countries created:", createdCountries.length);
}

export async function seedCurrencies() {
  const currenciesCreated = await Promise.all(
    currencies.map(async (currency) => {
      const createdCurrency = await prisma.currency.findFirst({
        where: { currency_code: currency.code },
      });

      if (createdCurrency) {
        return createdCurrency;
      }
      return await prisma.currency.create({
        data: {
          currency_name: currency.name,
          currency_code: currency.code,
          currency_symbol: currency.symbol,
          symbol_native: currency.symbol_native,
          decimal_digits: currency.decimal_digits,
          rounding: currency.rounding,
          name_plural: currency.name_plural,
          created_at: new Date(),
        },
      });
    })
  );

  console.log("Currencies created:", currenciesCreated.length);
}

export async function seedBranches() {
  const organisations = await prisma.organisation.findMany();
  const createdBranches = await Promise.all(
    organisations.flatMap(async (organisation) =>
      branches.map(async (branch) => {
        const orgBranch = await prisma.branch.findFirst({
          where: {
            name: branch.branch_name,
            organisation_id: organisation.id,
          },
        });
        if (orgBranch) {
          return orgBranch;
        }
        return await prisma.branch.create({
          data: {
            name: branch.branch_name,
            address: organisation.contact_address,
            city: organisation.contact_city,
            state: organisation.contact_state,
            country_id: organisation.country_id || "",
            zip_code: organisation.contact_zip,
            phone: organisation.contact_phone,
            email: organisation.contact_email,
            organisation_id: organisation.id,
            created_at: new Date(),
          },
        });
      })
    )
  );
  console.log("branches created: ", createdBranches.length);
}

export async function seedTransactionChannels() {
  const seededtransactionChannels = await Promise.all(
    transactionChannels.map(async (transactionChannel) => {
      const createdTransactionChannel =
        await prisma.transactionChannel.findFirst({
          where: {
            name: transactionChannel.name,
          },
        });
      if (createdTransactionChannel) {
        return createdTransactionChannel;
      }
      return await prisma.transactionChannel.create({
        data: {
          name: transactionChannel.name,
          description: transactionChannel.description,
          direction: transactionChannel.direction,
          created_at: new Date(),
        },
      });
    })
  );
  console.log(
    "transaction channels measures created: ",
    seededtransactionChannels.length
  );
}

export async function seedOccupations() {
  const createdOccupations = await Promise.all(
    occupations.map(async (occupation) => {
      const createdOccupation = await prisma.occupation.findFirst({
        where: { name: occupation },
      });

      if (createdOccupation) {
        return createdOccupation;
      }
      return await prisma.occupation.create({
        data: {
          name: occupation,
          description: occupation,
          created_at: new Date(),
        },
      });
    })
  );
  console.log("occupations created: ", createdOccupations.length);
}

export async function seedIndustries() {
  const createdIndustries = await Promise.all(
    industries.map(async (industry) => {
      const createdIndustry = await prisma.industry.findFirst({
        where: { name: industry.name },
      });

      if (createdIndustry) {
        return createdIndustry;
      }
      return await prisma.industry.create({
        data: {
          name: industry.name,
          description: industry.name,
          created_at: new Date(),
        },
      });
    })
  );
  console.log("industries created: ", createdIndustries.length);
}

interface SeedResponse {
  success: boolean;
  message: string;
  data?: { seeded: string[] };
}

const seedFunctions: { [key: string]: () => Promise<void> } = {
  roles: seedRoles,
  users: seedUsers,
  organisations: seedOrganisations,
  permissions: seedPermissions,
  branches: seedBranches,
  countries: seedCountries,
  currencies: seedCurrencies,
  rolesPermissions: seedRolesPermissions,
  transactionChannels: seedTransactionChannels,
  occupations: seedOccupations,
  industries: seedIndustries,
};

export async function seedDatabase(
  seeds: string[] = []
): Promise<SeedResponse> {
  // Normalize seeds: remove "--" and empty strings
  const normalizedSeeds = seeds
    .map((seed) => seed.replace(/^--/, "").trim())
    .filter((seed) => seed !== "");

  const seeded: string[] = [];

  try {
    // Only seed if specific seeds are provided - no automatic seeding
    if (normalizedSeeds.length === 0) {
      console.log(
        "No specific seeds provided. Skipping automatic seeding to prevent unintended data creation."
      );
      return {
        success: true,
        message: "No seeds specified - skipped automatic seeding",
        data: { seeded: [] },
      };
    }

    // Process only the specified seeds
    for (const seed of normalizedSeeds) {
      const seedFunction = seedFunctions[seed];
      if (seedFunction) {
        console.log(`Seeding: ${seed}`);
        await seedFunction();
        seeded.push(seed);
      } else {
        console.log(`No seed function found for "${seed}"`);
      }
    }

    return {
      success: true,
      message: `Successfully seeded: ${seeded.join(", ") || "none"}`,
      data: { seeded },
    };
  } catch (error) {
    console.error("Seeding error:", error);
    throw new Error(
      `Failed to seed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

async function main() {
  let args = process.argv.slice(2); // Get arguments passed to script
  //remove the string '--' from the arguments and remove empty strings from list
  args = args.map((arg) => arg.replace("--", "")).filter((arg) => arg !== "");

  const seedFunctions: { [key: string]: () => Promise<void> } = {
    roles: seedRoles,
    users: seedUsers,
    organisations: seedOrganisations,
    permissions: seedPermissions,
    branches: seedBranches,
    countries: seedCountries,
    currencies: seedCurrencies,
    rolesPermissions: seedRolesPermissions,

    transactionChannels: seedTransactionChannels,
    occupations: seedOccupations,
    industries: seedIndustries,
  };

  if (args.length === 0) {
    console.log(
      "No specific seeds provided. Use --<seedName> to specify which seeds to run."
    );
    console.log("Available seeds:", Object.keys(seedFunctions).join(", "));
    return;
  }

  for (const arg of args) {
    const seedFunction = seedFunctions[arg];
    if (seedFunction) {
      console.log(`Running seed: ${arg}`);
      await seedFunction();
    } else {
      console.log(`No seed function found for "${arg}"`);
      console.log("Available seeds:", Object.keys(seedFunctions).join(", "));
    }
  }
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

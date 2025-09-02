"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const countries_1 = __importDefault(require("./countries"));
const roles_1 = __importDefault(require("./roles"));
const permissions_1 = __importDefault(require("./permissions"));
const currencies_1 = __importDefault(require("./currencies"));
const transactionChannels_1 = __importDefault(require("./transactionChannels"));
const branches_1 = __importDefault(require("./branches"));
const auth_utils_1 = require("../api/auth/auth.utils");
const occupations_1 = __importDefault(require("./occupations"));
const industries_1 = __importDefault(require("./industries"));
const DEFAULT_PASSWORD = "admin1234";
const prisma = new client_1.PrismaClient();
async function seedSystemEngineerRole() {
    const role = await prisma.role.findFirst({
        where: { name: "System Engineer" },
    });
    if (role) {
        return;
    }
    const roleData = roles_1.default.find((role) => role.role_name === "System Engineer");
    await prisma.role.create({
        data: {
            name: roleData?.role_name || "System Engineer",
            description: roleData?.role_description ||
                "System Engineer - Can access all system features, manage configurations, and troubleshoot issues.",
            created_at: new Date(),
        },
    });
}
async function seedUsers() {
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
            password: await (0, auth_utils_1.hashPassword)(DEFAULT_PASSWORD),
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
async function seedRoles() {
    const otherRoles = roles_1.default.filter((role) => role.role_name !== "System Engineer");
    const createdRoles = await Promise.all(otherRoles.map(async (role) => {
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
    }));
    console.log("Roles created:", createdRoles.length);
}
async function seedAdminUser({ admin_name, contact_email, contact_phone, }) {
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
        password: await (0, auth_utils_1.hashPassword)(DEFAULT_PASSWORD),
        first_name: adminNameArray[0] || "Admin",
        last_name: adminNameArray.slice(1).join(" ") || "User",
        phone: contact_phone,
        status: "ACTIVE",
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
async function seedPermissions() {
    const createdPermissions = await Promise.all(permissions_1.default.map(async (permission) => {
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
    }));
    console.log("Permissions created:", createdPermissions.length);
}
async function seedRolesPermissions() {
    const createdRoles = await prisma.role.findMany();
    const createdPermissions = await prisma.permission.findMany();
    const rolePermissions = await Promise.all([
        createdRoles.flatMap(async (role) => createdPermissions.map(async (permission) => {
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
        })),
    ]);
    console.log("rolePermissions created:", rolePermissions.length);
}
async function seedCountries() {
    const createdCountries = await Promise.all(countries_1.default.map(async (country) => {
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
    }));
    console.log("Countries created:", createdCountries.length);
}
async function seedCurrencies() {
    const currenciesCreated = await Promise.all(currencies_1.default.map(async (currency) => {
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
    }));
    console.log("Currencies created:", currenciesCreated.length);
}
async function seedBranches() {
    const organisations = await prisma.organisation.findMany();
    const createdBranches = await Promise.all(organisations.flatMap(async (organisation) => branches_1.default.map(async (branch) => {
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
                country: organisation.country_id,
                zip_code: organisation.contact_zip,
                phone: organisation.contact_phone,
                email: organisation.contact_email,
                organisation_id: organisation.id,
                created_at: new Date(),
            },
        });
    })));
    console.log("branches created: ", createdBranches.length);
}
async function seedTransactionChannels() {
    const seededtransactionChannels = await Promise.all(transactionChannels_1.default.map(async (transactionChannel) => {
        const createdTransactionChannel = await prisma.transactionChannel.findFirst({
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
    }));
    console.log("transaction channels measures created: ", seededtransactionChannels.length);
}
async function seedOccupations() {
    const createdOccupations = await Promise.all(occupations_1.default.map(async (occupation) => {
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
    }));
    console.log("occupations created: ", createdOccupations.length);
}
async function seedIndustries() {
    const createdIndustries = await Promise.all(industries_1.default.map(async (industry) => {
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
    }));
    console.log("industries created: ", createdIndustries.length);
}
async function main() {
    let args = process.argv.slice(2);
    args = args.map((arg) => arg.replace("--", "")).filter((arg) => arg !== "");
    const seedFunctions = {
        sysEngRole: seedSystemEngineerRole,
        users: seedUsers,
        roles: seedRoles,
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
        console.log("No specific seed provided. Seeding all items...");
        for (const key in seedFunctions) {
            await seedFunctions[key]();
        }
    }
    else {
        for (const arg of args) {
            const seedFunction = seedFunctions[arg];
            if (seedFunction) {
                await seedFunction();
            }
            else {
                console.log(`No seed function found for "${arg}"`);
            }
        }
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=index.js.map
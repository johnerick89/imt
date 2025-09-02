import { PrismaClient } from "@prisma/client";
import type {
  IBranch,
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchFilters,
  BranchStats,
} from "./branches.interfaces";

const prisma = new PrismaClient();

export class BranchService {
  async createBranch(
    data: CreateBranchRequest,
    userId: string
  ): Promise<IBranch> {
    const branch = await prisma.branch.create({
      data: {
        ...data,
        created_by: userId,
      },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
          },
        },
      },
    });

    return {
      ...branch,
      users_count: branch._count.users,
      customers_count: branch._count.customers,
    } as unknown as IBranch;
  }

  async getBranches(filters: BranchFilters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      organisation_id,
      city,
      state,
      country_id,
      created_by,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { country_id: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (organisation_id) {
      where.organisation_id = organisation_id;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { contains: state, mode: "insensitive" };
    }

    if (country_id) {
      where.country_id = country_id;
    }

    if (created_by) {
      where.created_by = created_by;
    }

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        skip,
        take: limit,
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          _count: {
            select: {
              users: true,
              customers: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.branch.count({ where }),
    ]);

    const branchesWithCounts = branches.map((branch) => ({
      ...branch,
      users_count: branch._count.users,
      customers_count: branch._count.customers,
    }));

    return {
      branches: branchesWithCounts as unknown as IBranch[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBranchById(id: string): Promise<IBranch | null> {
    const branch = await prisma.branch.findUnique({
      where: { id },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
          },
        },
      },
    });

    if (!branch) return null;

    return {
      ...branch,
      users_count: branch._count.users,
      customers_count: branch._count.customers,
    } as unknown as IBranch;
  }

  async updateBranch(
    id: string,
    data: UpdateBranchRequest
  ): Promise<IBranch | null> {
    const branch = await prisma.branch.update({
      where: { id },
      data,
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
          },
        },
      },
    });

    return {
      ...branch,
      users_count: branch._count.users,
      customers_count: branch._count.customers,
    } as unknown as IBranch;
  }

  async deleteBranch(id: string): Promise<void> {
    await prisma.branch.delete({
      where: { id },
    });
  }

  async getBranchStats(): Promise<BranchStats> {
    const [
      totalBranches,
      branchesByCountry,
      branchesByCity,
      userCounts,
      customerCounts,
    ] = await Promise.all([
      prisma.branch.count(),
      prisma.branch.groupBy({
        by: ["country_id"],
        _count: { id: true },
      }),
      prisma.branch.groupBy({
        by: ["city"],
        _count: { id: true },
      }),
      prisma.user.count({
        where: { branch_id: { not: null } },
      }),
      prisma.customer.count({
        where: { branch_id: { not: undefined } },
      }),
    ]);

    const countryStats = branchesByCountry.reduce((acc, item) => {
      const country = (item as any).country;
      const count = (item as any)._count?.id ?? 0;
      acc[country] = count;
      return acc;
    }, {} as { [key: string]: number });

    const cityStats = branchesByCity.reduce((acc, item) => {
      const city = (item as any).city;
      const count = (item as any)._count?.id ?? 0;
      acc[city] = count;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalBranches,
      branchesByCountry: countryStats,
      branchesByCity: cityStats,
      totalUsers: userCounts,
      totalCustomers: customerCounts,
    };
  }
}

import { prisma } from "../../lib/prisma.lib";
import type {
  ICustomer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomerListResponse,
  CustomerResponse,
  CustomerStats,
  CustomerStatsFilters,
} from "./customers.interfaces";

export class CustomerService {
  async createCustomer(
    data: CreateCustomerRequest,
    userId: string
  ): Promise<CustomerResponse> {
    try {
      const customer = await prisma.customer.create({
        data: {
          ...data,
          created_by: userId,
        },
        include: {
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
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
        },
      });

      return {
        success: true,
        message: "Customer created successfully",
        data: customer as ICustomer,
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  async getCustomers(filters: CustomerFilters): Promise<CustomerListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { full_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone_number: { contains: search, mode: "insensitive" } },
          { id_number: { contains: search, mode: "insensitive" } },
          { tax_number: { contains: search, mode: "insensitive" } },
          { org_reg_number: { contains: search, mode: "insensitive" } },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            nationality: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            residence_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            occupation: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            organisation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
            incorporation_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            industry: {
              select: {
                id: true,
                name: true,
                description: true,
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
            beneficiaries: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.customer.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Customers retrieved successfully",
        data: {
          customers: customers as unknown as ICustomer[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("Failed to fetch customers");
    }
  }

  async getCustomerById(id: string): Promise<CustomerResponse> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
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
          beneficiaries: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      return {
        success: true,
        message: "Customer retrieved successfully",
        data: customer as unknown as ICustomer,
      };
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw new Error("Failed to fetch customer");
    }
  }

  async updateCustomer(
    id: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerResponse> {
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data,
        include: {
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
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
        },
      });

      return {
        success: true,
        message: "Customer updated successfully",
        data: customer as ICustomer,
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("Failed to update customer");
    }
  }

  async deleteCustomer(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.customer.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Customer deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("Failed to delete customer");
    }
  }

  async getCustomerStats(filters: CustomerStatsFilters): Promise<{
    success: boolean;
    message: string;
    data: CustomerStats;
  }> {
    try {
      const [total, individual, corporate, business, highRisk, adverseMedia] =
        await Promise.all([
          prisma.customer.count({
            where: { organisation_id: filters.organisation_id },
          }),
          prisma.customer.count({
            where: {
              customer_type: "INDIVIDUAL",
              organisation_id: filters.organisation_id,
            },
          }),
          prisma.customer.count({
            where: {
              customer_type: "CORPORATE",
              organisation_id: filters.organisation_id,
            },
          }),
          prisma.customer.count({
            where: {
              customer_type: "BUSINESS",
              organisation_id: filters.organisation_id,
            },
          }),
          prisma.customer.count({
            where: {
              risk_rating: { gte: 70 },
              organisation_id: filters.organisation_id,
            },
          }),
          prisma.customer.count({
            where: {
              has_adverse_media: true,
              organisation_id: filters.organisation_id,
            },
          }),
        ]);

      return {
        success: true,
        message: "Customer stats retrieved successfully",
        data: {
          totalCustomers: total,
          individualCustomers: individual,
          corporateCustomers: corporate,
          businessCustomers: business,
          highRiskCustomers: highRisk,
          adverseMediaCustomers: adverseMedia,
        },
      };
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      throw new Error("Failed to fetch customer stats");
    }
  }
}

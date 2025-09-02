import type { CreateCustomerRequest, UpdateCustomerRequest, CustomerFilters, CustomerListResponse, CustomerResponse, CustomerStats } from "./customers.interfaces";
export declare class CustomerService {
    createCustomer(data: CreateCustomerRequest, userId: string): Promise<CustomerResponse>;
    getCustomers(filters: CustomerFilters): Promise<CustomerListResponse>;
    getCustomerById(id: string): Promise<CustomerResponse>;
    updateCustomer(id: string, data: UpdateCustomerRequest): Promise<CustomerResponse>;
    deleteCustomer(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCustomerStats(): Promise<{
        success: boolean;
        message: string;
        data: CustomerStats;
    }>;
}
//# sourceMappingURL=customers.services.d.ts.map
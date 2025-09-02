import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class CustomerController {
    private customerService;
    constructor();
    createCustomer(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getCustomers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCustomerById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCustomer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCustomer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCustomerStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=customers.controller.d.ts.map
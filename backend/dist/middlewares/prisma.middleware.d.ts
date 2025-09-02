import CustomReq from "../types/CustomReq.type";
export declare const setPrismaContext: (requestId: string, context: CustomReq["prismaContext"]) => void;
export declare const clearPrismaContext: (requestId: string) => void;
export declare const generateRequestId: () => string;
declare const prisma: import("@prisma/client/runtime/library").DynamicClientExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {};
}, {}>, import(".prisma/client").Prisma.TypeMapCb<import(".prisma/client").Prisma.PrismaClientOptions>, {
    result: {};
    model: {};
    query: {};
    client: {};
}>;
export default prisma;
//# sourceMappingURL=prisma.middleware.d.ts.map
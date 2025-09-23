import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

function aclMiddleware({
  errorMessage,
  resource,
}: {
  errorMessage: string;
  resource: string;
}) {
  return function (req: AuthRequest, res: Response, next: NextFunction) {
    if (req.method === "OPTIONS") return next();
    // Check if user is authorised to perform action (role and permissions)

    if (!checkUserAccessRightsToResource({ resource, req })) {
      const error = {
        error: `Access denied - ${errorMessage}`,
      };
      // User is not authorized, respond with errorMessage
      return res.status(403).send(error);
    }
    next();
  };
}

const checkUserAccessRightsToResource = ({
  resource,
  req,
}: {
  resource: string;
  req: AuthRequest;
}) => {
  const userPermissions = req.user?.user_role?.role_permissions;
  const permissions = userPermissions?.map(
    (permission) => permission.permission.name
  );

  if (permissions && permissions.length > 0)
    return permissions.includes(resource);

  return false;
};

export { aclMiddleware };

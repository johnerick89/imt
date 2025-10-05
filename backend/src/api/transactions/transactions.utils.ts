import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma.lib";

const getValidateTillParameter = async () => {
  const parameter = await prisma.parameter.findFirst({
    where: { name: "VALIDATE_TILL_AND_USER_TILL_DURING_TRANSACTIONS" },
  });
  return parameter?.value === "true";
};

const validateTillAndUserTill = async (tillId: string, userId: string) => {
  const validateTill = await getValidateTillParameter();
  if (!validateTill) {
    return;
  }
  const till = await prisma.till.findUnique({
    where: { id: tillId },
  });
  if (!till) {
    throw new AppError("Till not found", 404);
  }
};

export { validateTillAndUserTill, getValidateTillParameter };

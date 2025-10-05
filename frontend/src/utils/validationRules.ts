import validationRulesService from "../services/ValidationRulesService";

const getValidationRules = async ({ entity }: { entity: string }) => {
  const response = await validationRulesService.getValidationRuleByEntity(
    entity
  );
  console.log("response", response);
  return response.data;
};

export { getValidationRules };

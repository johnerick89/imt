import { ParametersService } from "../services/ParametersService";
import type { IParameter } from "../types/ParametersTypes";

const getParameterValue = async ({
  name,
}: {
  name: string;
}): Promise<IParameter | undefined> => {
  const response = await ParametersService.getParameters({
    limit: 100,
  });
  const parameter = response.data.parameters.find(
    (p: IParameter) => p.name === name
  );
  return parameter;
};

export { getParameterValue };

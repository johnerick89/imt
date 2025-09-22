import { site_param } from "./site.config";
const commonStrings = [
  {
    name: "common",
    outbound: "Outbound",
    inbound: "Inbound",
  },
  {
    name: "hilaal",
    outbound: "Outgoing",
    inbound: "Incoming",
  },
];

const siteCommonStrings = commonStrings.find(
  (common) => common.name === site_param
);

export { commonStrings, siteCommonStrings };

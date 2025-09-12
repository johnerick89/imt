const site_param = import.meta.env.VITE_SITE_PARAM || "hilaal";

export const siteConfigs = [
  {
    name: "hilaal",
    display_name: "Hilaal Express",
    description: "International Money Transfer Dashboard",
    logo: "/hilaal.jpeg",
    icon: "/hilaal.jpeg",
  },
  {
    name: "default",
    display_name: "Money Flow",
    description: "Money Remittance Dashboard",
    logo: "/logo-green.svg",
    icon: "/icon.svg",
  },
];

const siteConfig = siteConfigs.find((site) => site.name === site_param);

export default siteConfig;

const toHumanFriendly = (text: string): string => {
  if (!text) {
    return "";
  }
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function formatToCurrency(number: string | number): string {
  const newNumber = typeof number === "number" ? number : parseFloat(number);

  if (isNaN(newNumber)) {
    return "0.00";
  }
  return newNumber.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { toHumanFriendly, formatToCurrency };

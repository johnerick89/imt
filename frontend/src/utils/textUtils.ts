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

function formatToCurrencyWithSymbol(
  amount: string | bigint | string,
  currency: string
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(Number(amount));
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export {
  toHumanFriendly,
  formatToCurrency,
  formatToCurrencyWithSymbol,
  formatDateTime,
};

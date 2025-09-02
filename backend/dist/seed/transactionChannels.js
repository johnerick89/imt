"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactionChannels = [
    {
        name: "Bank Deposit",
        description: "Customers deposit funds into the system's bank account via bank transfers or over-the-counter deposits, suitable for inbound transactions.",
        direction: ["inbound"],
    },
    {
        name: "Mobile Money",
        description: "Customers and beneficiaries use mobile money platforms (e.g., M-Pesa, MTN Mobile Money) for fast, mobile-based transfers, ideal for both inbound and outbound transactions.",
        direction: ["inbound", "outbound"],
    },
    {
        name: "Online Banking",
        description: "Web-based platform for customers to initiate transfers, view transaction history, and manage accounts, primarily for inbound transactions.",
        direction: ["inbound"],
    },
    {
        name: "Mobile Banking",
        description: "Mobile app for customers to send/receive money and manage transactions, supporting both inbound and outbound flows.",
        direction: ["inbound", "outbound"],
    },
    {
        name: "Wire Transfer",
        description: "Electronic fund transfers between banks, including domestic and international (SWIFT), suitable for large inbound and outbound transactions.",
        direction: ["inbound", "outbound"],
    },
    {
        name: "Card Payment",
        description: "Customers use credit/debit cards to fund accounts via payment gateways (e.g., Stripe, Paystack), primarily for inbound transactions.",
        direction: ["inbound"],
    },
    {
        name: "Cash",
        description: "Beneficiaries collect cash at agent locations or partnered outlets using a reference code, ideal for outbound disbursements.",
        direction: ["outbound"],
    },
    {
        name: "Digital Wallet",
        description: "Customers and beneficiaries use digital wallets (e.g., PayPal, Apple Pay) for quick transfers, supporting both inbound and outbound transactions.",
        direction: ["inbound", "outbound"],
    },
];
exports.default = transactionChannels;
//# sourceMappingURL=transactionChannels.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rules = [
    {
        rule_name: 'HIGH_VALUE_INTERNATIONAL',
        rule_description: 'Flags transactions over $10,000 involving high-risk countries.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '10000',
                value_type: 'NUMBER',
            },
            {
                key: 'DESTINATION_COUNTRY',
                operator: 'IN',
                value: JSON.stringify(['SY', 'KP', 'IR']),
                value_type: 'VALUE',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'High-value transaction to high-risk country detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance team for review.',
            },
        ],
    },
    {
        rule_name: 'HIGH_FREQUENCY_TRANSACTIONS',
        rule_description: 'Blocks accounts with more than 5 transactions within 24 hours.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        parameters: [
            {
                key: 'TRANSACTION_COUNT',
                operator: 'GT',
                value: '5',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 24,
                unit: 'HOURS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 5 }),
            },
        ],
        rule_actions: [
            {
                action: 'BLOCK',
                details: 'Account blocked due to excessive transaction frequency.',
            },
            {
                action: 'ALERT',
                details: 'Notify fraud team for high-frequency transaction pattern.',
            },
        ],
    },
    {
        rule_name: 'PEP_TRANSACTION',
        rule_description: 'Escalates transactions involving Politically Exposed Persons (PEPs).',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.9,
        risk_score_value: 90,
        parameters: [
            {
                key: 'CUSTOMER_IS_PEP',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '5000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'ESCALATE',
                details: 'Transaction by PEP with amount >= $5000 escalated for review.',
            },
        ],
    },
    {
        rule_name: 'ADVERSE_MEDIA_TRANSACTION',
        rule_description: 'Holds transactions for customers with adverse media records.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        parameters: [
            {
                key: 'CUSTOMER_HAS_ADVERSE_MEDIA',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '1000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'Transaction held due to adverse media on customer.',
            },
        ],
    },
    {
        rule_name: 'SUSPICIOUS_COUNTERPARTY',
        rule_description: 'Flags transactions with counterparties in high-risk countries or unusual names.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'MEDIUM',
        rule_weight: 0.5,
        risk_score_value: 50,
        parameters: [
            {
                key: 'COUNTERPARTY_COUNTRY',
                operator: 'IN',
                value: JSON.stringify(['SY', 'KP', 'IR']),
                value_type: 'VALUE',
            },
            {
                key: 'COUNTERPARTY_NAME',
                operator: 'CONTAINS',
                value: 'sanctioned',
                value_type: 'STRING',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Suspicious counterparty detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for counterparty review.',
            },
        ],
    },
    {
        rule_name: 'CASH_SPREADING',
        rule_description: 'Detects multiple small cash deposits to avoid reporting thresholds (e.g., under $10,000 USD in 24 hours).',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Deposit',
                value_type: 'VALUE',
            },
            {
                key: 'PAYMENT_METHOD',
                operator: 'EQ',
                value: 'Cash',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'BETWEEN',
                value: JSON.stringify({ min: 1000, max: 9999 }),
                value_type: 'NUMBER',
            },
            {
                key: 'TRANSACTION_COUNT',
                operator: 'GTE',
                value: '3',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 24,
                unit: 'HOURS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 3 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Possible cash spreading detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for cash deposit pattern review.',
            },
        ],
    },
    {
        rule_name: 'HIGH_VALUE_SINGLE_TRANSACTION',
        rule_description: 'Flags single transactions exceeding $25,000 USD.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '25000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'High-value transaction requires manual review.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for high-value transaction.',
            },
        ],
    },
    {
        rule_name: 'UNUSUAL_TRANSACTION_FREQUENCY',
        rule_description: 'Detects accounts with more than 10 transactions in a week, unusual for individual accounts.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: null,
        parameters: [
            {
                key: 'TRANSACTION_COUNT',
                operator: 'GT',
                value: '10',
                value_type: 'NUMBER',
            },
            {
                key: 'CUSTOMER_TYPE',
                operator: 'EQ',
                value: 'Individual',
                value_type: 'VALUE',
            },
        ],
        time_windows: [
            {
                duration: 7,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 10 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Unusual transaction frequency for individual account.',
            },
            {
                action: 'ALERT',
                details: 'Notify fraud team for frequency review.',
            },
        ],
    },
    {
        rule_name: 'ROUND_NUMBER_TRANSACTIONS',
        rule_description: 'Flags transactions with round amounts (e.g., $1000, $5000) in USD or EUR, indicative of potential structuring.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.5,
        risk_score_value: 50,
        currency_context: null,
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'IN',
                value: JSON.stringify([
                    1000, 2000, 3000, 4000, 5000, 10000, 20000, 25000, 30000, 40000,
                    50000,
                ]),
                value_type: 'NUMBER',
            },
            {
                key: 'CURRENCY',
                operator: 'IN',
                value: JSON.stringify(['USD', 'EUR']),
                value_type: 'VALUE',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Round number transaction detected.',
            },
        ],
    },
    {
        rule_name: 'HIGH_VALUE_INTERNATIONAL_TRANSFER',
        rule_description: 'Flags international transfers over $50,000 to high-risk countries.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.9,
        risk_score_value: 90,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '50000',
                value_type: 'NUMBER',
            },
            {
                key: 'DESTINATION_COUNTRY',
                operator: 'IN',
                value: JSON.stringify(['SY', 'KP', 'IR']),
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Transfer',
                value_type: 'VALUE',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'High-value international transfer to high-risk country.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for review.',
            },
        ],
    },
    {
        rule_name: 'PEP_HIGH_VALUE',
        rule_description: 'Escalates transactions by PEPs over $10,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.9,
        risk_score_value: 90,
        currency_context: null,
        parameters: [
            {
                key: 'CUSTOMER_IS_PEP',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '10000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'ESCALATE',
                details: 'PEP transaction requires escalation.',
            },
        ],
    },
    {
        rule_name: 'ADVERSE_MEDIA',
        rule_description: 'Holds transactions for customers with adverse media records over $5,000 EUR.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        currency_context: 'EUR',
        parameters: [
            {
                key: 'CUSTOMER_HAS_ADVERSE_MEDIA',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '5000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'Transaction held due to adverse media.',
            },
        ],
    },
    {
        rule_name: 'SUSPICIOUS_COUNTERPARTY_COUNTRY',
        rule_description: 'Flags transactions with counterparties in high-risk countries.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: null,
        parameters: [
            {
                key: 'COUNTERPARTY_COUNTRY',
                operator: 'IN',
                value: JSON.stringify(['SY', 'KP', 'IR']),
                value_type: 'VALUE',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Suspicious counterparty country detected.',
            },
        ],
    },
    {
        rule_name: 'DORMANT_ACCOUNT_ACTIVITY',
        rule_description: 'Flags sudden activity in dormant accounts with transactions over $2,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: 'USD',
        parameters: [
            {
                key: 'ACCOUNT_DORMANT',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '2000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Sudden activity in dormant account.',
            },
            {
                action: 'ALERT',
                details: 'Notify fraud team for dormant account activity.',
            },
        ],
    },
    {
        rule_name: 'HIGH_RISK_CUSTOMER',
        rule_description: 'Escalates transactions by high-risk customers over $3,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: null,
        parameters: [
            {
                key: 'CUSTOMER_RISK_RATING',
                operator: 'IN',
                value: JSON.stringify(['High', 'Critical']),
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '3000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'ESCALATE',
                details: 'High-risk customer transaction escalated.',
            },
        ],
    },
    {
        rule_name: 'LARGE_CASH_WITHDRAWAL',
        rule_description: 'Flags cash withdrawals over $15,000 GBP.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'GBP',
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Withdrawal',
                value_type: 'VALUE',
            },
            {
                key: 'PAYMENT_METHOD',
                operator: 'EQ',
                value: 'Cash',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '15000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'Large cash withdrawal requires review.',
            },
        ],
    },
    {
        rule_name: 'MULTIPLE_CURRENCY_TRANSACTIONS',
        rule_description: 'Flags accounts with transactions in 3+ currencies within a week.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: null,
        parameters: [
            {
                key: 'CURRENCY',
                operator: 'NOT_IN',
                value: JSON.stringify([]),
                value_type: 'VALUE',
            },
        ],
        time_windows: [
            {
                duration: 7,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'CURRENCY',
                threshold: JSON.stringify({ value: 3 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Multiple currency transactions detected.',
            },
        ],
    },
    {
        rule_name: 'NEW_ACCOUNT_HIGH_ACTIVITY',
        rule_description: 'Flags new accounts (less than 30 days old) with transactions over $5,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: 'USD',
        parameters: [
            {
                key: 'ACCOUNT_AGE',
                operator: 'LTE',
                value: '30',
                value_type: 'NUMBER',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '5000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'High activity in new account detected.',
            },
        ],
    },
    {
        rule_name: 'SUSPICIOUS_COUNTERPARTY_NAME',
        rule_description: 'Flags transactions with counterparty names containing suspicious keywords.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'MEDIUM',
        rule_weight: 0.5,
        risk_score_value: 50,
        currency_context: null,
        parameters: [
            {
                key: 'COUNTERPARTY_NAME',
                operator: 'CONTAINS',
                value: 'sanction',
                value_type: 'STRING',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Suspicious counterparty name detected.',
            },
        ],
    },
    {
        rule_name: 'EXCEEDED_DAILY_LIMIT',
        rule_description: "Blocks transactions exceeding the customer's daily limit.",
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GT',
                value: 'DAILY_LIMIT',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'BLOCK',
                details: 'Transaction exceeds daily limit.',
            },
        ],
    },
    {
        rule_name: 'HIGH_TRANSACTION_HOUR',
        rule_description: 'Flags transactions outside normal hours (midnight to 6 AM).',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.5,
        risk_score_value: 50,
        currency_context: null,
        parameters: [
            {
                key: 'TRANSACTION_HOUR_OF_DAY',
                operator: 'BETWEEN',
                value: JSON.stringify({ min: 0, max: 6 }),
                value_type: 'NUMBER',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '1000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Transaction during unusual hours.',
            },
        ],
    },
    {
        rule_name: 'LOW_BALANCE_HIGH_TRANSACTION',
        rule_description: 'Flags transactions where amount exceeds account balance.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GT',
                value: 'ACCOUNT_BALANCE',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'BLOCK',
                details: 'Transaction exceeds account balance.',
            },
        ],
    },
    {
        rule_name: 'RAPID_FUND_TRANSFERS',
        rule_description: 'Detects multiple transfers within 48 hours totaling over $20,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Transfer',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '20000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 48,
                unit: 'HOURS',
                aggregation_type: 'SUM',
                key: 'TRANSACTION_AMOUNT',
                threshold: JSON.stringify({ value: 20000 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Rapid fund transfers detected.',
            },
        ],
    },
    {
        rule_name: 'SUSPICIOUS_SOURCE_OF_FUNDS',
        rule_description: 'Flags transactions with unclear or suspicious source of funds.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: null,
        parameters: [
            {
                key: 'SOURCE_OF_FUNDS',
                operator: 'IN',
                value: JSON.stringify(['Unknown', 'Gift']),
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '5000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'Suspicious source of funds requires review.',
            },
            {
                action: 'FLAG',
                details: 'Suspicious source of funds detected.',
            },
        ],
    },
    {
        rule_name: 'HIGH_RISK_TRANSACTION_CHANNEL',
        rule_description: 'Flags high-value transactions through mobile channels in EUR.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: 'EUR',
        parameters: [
            {
                key: 'TRANSACTION_CHANNEL',
                operator: 'EQ',
                value: 'Mobile',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '10000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'High-value mobile transaction detected.',
            },
        ],
    },
    {
        rule_name: 'AGGREGATED_CASH_DEPOSITS',
        rule_description: 'Flags daily aggregated cash deposits exceeding $10,000 for all customers.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Deposit',
                value_type: 'VALUE',
            },
            {
                key: 'PAYMENT_METHOD',
                operator: 'EQ',
                value: 'Cash',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '10000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 1,
                unit: 'DAYS',
                aggregation_type: 'SUM',
                key: 'TRANSACTION_AMOUNT',
                threshold: JSON.stringify({ value: 10000 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Aggregated cash deposits exceeding $10,000 detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for review of aggregated cash deposits.',
            },
        ],
    },
    {
        rule_name: 'HIGH_RISK_CITIZEN_TRANSACTIONS',
        rule_description: 'Flags all transactions by customers from high-risk countries.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'USD',
        parameters: [
            {
                key: 'CUSTOMER_CITIZENSHIP',
                operator: 'IN',
                value: JSON.stringify(['SY', 'KP', 'IR']),
                value_type: 'VALUE',
            },
        ],
        time_windows: [
            {
                duration: 1,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 1 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Transaction by high-risk country citizen detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for review of high-risk citizen transaction.',
            },
        ],
    },
    {
        rule_name: 'PEP_CREDIT_TRANSACTIONS',
        rule_description: 'Flags credit transactions by PEPs exceeding $5,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'HIGH',
        rule_weight: 0.9,
        risk_score_value: 90,
        currency_context: 'USD',
        parameters: [
            {
                key: 'CUSTOMER_IS_PEP',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
            {
                key: 'TRANSACTION_TYPE',
                operator: 'IN',
                value: JSON.stringify(['Deposit', 'Incoming Transfer']),
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '5000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 1,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 1 }),
            },
        ],
        rule_actions: [
            {
                action: 'ESCALATE',
                details: 'PEP credit transaction exceeding $5,000 escalated for review.',
            },
        ],
    },
    {
        rule_name: 'NON_PROFIT_CASH_DEPOSITS',
        rule_description: 'Flags cash deposits by non-profit organizations exceeding $1,000.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: 'USD',
        parameters: [
            {
                key: 'CUSTOMER_TYPE',
                operator: 'EQ',
                value: 'Non-Profit',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Deposit',
                value_type: 'VALUE',
            },
            {
                key: 'PAYMENT_METHOD',
                operator: 'EQ',
                value: 'Cash',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '1000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 1,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 1 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Cash deposit by non-profit exceeding $1,000 detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for review of non-profit cash deposit.',
            },
        ],
    },
    {
        rule_name: 'WIRE_TRANSFER_THRESHOLDS',
        rule_description: 'Flags wire transfers exceeding $20,000 for individuals or $100,000 for corporates weekly.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'HIGH',
        rule_weight: 0.8,
        risk_score_value: 80,
        currency_context: 'USD',
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Transfer',
                value_type: 'VALUE',
            },
            {
                key: 'CUSTOMER_TYPE',
                operator: 'EQ',
                value: 'Individual',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '20000',
                value_type: 'NUMBER',
            },
            {
                key: 'CUSTOMER_TYPE',
                operator: 'EQ',
                value: 'Corporate',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '100000',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 7,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 1 }),
            },
        ],
        rule_actions: [
            {
                action: 'HOLD_FOR_REVIEW',
                details: 'High-value wire transfer requires review.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for high-value wire transfer.',
            },
        ],
    },
    {
        rule_name: 'MINOR_HIGH_FREQUENCY',
        rule_description: 'Flags minors with transaction frequency exceeding 20 per week.',
        is_active: true,
        rule_type: 'AND',
        rule_severity: 'MEDIUM',
        rule_weight: 0.6,
        risk_score_value: 60,
        currency_context: 'USD',
        parameters: [
            {
                key: 'CUSTOMER_AGE',
                operator: 'LT',
                value: '18',
                value_type: 'NUMBER',
            },
            {
                key: 'TRANSACTION_COUNT',
                operator: 'GT',
                value: '20',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [
            {
                duration: 7,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 20 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'High transaction frequency by minor detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify fraud team for minor transaction frequency review.',
            },
        ],
    },
    {
        rule_name: 'FORGED_MULTIPLE_IDS',
        rule_description: 'Flags transactions associated with forged, expired, or multiple IDs.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'HIGH',
        rule_weight: 0.9,
        risk_score_value: 90,
        currency_context: null,
        parameters: [
            {
                key: 'ID_STATUS',
                operator: 'IN',
                value: JSON.stringify(['Forged', 'Expired']),
                value_type: 'VALUE',
            },
            {
                key: 'ID_COUNT',
                operator: 'GT',
                value: '1',
                value_type: 'NUMBER',
            },
        ],
        time_windows: [],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Forged, expired, or multiple IDs detected.',
            },
            {
                action: 'BLOCK',
                details: 'Transaction blocked due to suspicious ID usage.',
            },
        ],
    },
    {
        rule_name: 'UNEXPLAINED_FOREX_PATTERN_CHANGE',
        rule_description: 'Flags large foreign exchange transactions or sudden changes in transaction patterns.',
        is_active: true,
        rule_type: 'OR',
        rule_severity: 'MEDIUM',
        rule_weight: 0.7,
        risk_score_value: 70,
        currency_context: null,
        parameters: [
            {
                key: 'TRANSACTION_TYPE',
                operator: 'EQ',
                value: 'Foreign Exchange',
                value_type: 'VALUE',
            },
            {
                key: 'TRANSACTION_AMOUNT',
                operator: 'GTE',
                value: '10000',
                value_type: 'NUMBER',
            },
            {
                key: 'TRANSACTION_PATTERN_CHANGE',
                operator: 'EQ',
                value: 'true',
                value_type: 'BOOLEAN',
            },
        ],
        time_windows: [
            {
                duration: 7,
                unit: 'DAYS',
                aggregation_type: 'COUNT',
                key: 'TRANSACTION_COUNT',
                threshold: JSON.stringify({ value: 1 }),
            },
        ],
        rule_actions: [
            {
                action: 'FLAG',
                details: 'Unexplained large foreign exchange or pattern change detected.',
            },
            {
                action: 'ALERT',
                details: 'Notify compliance for review of transaction pattern change.',
            },
        ],
    },
];
exports.default = rules;
//# sourceMappingURL=rules.js.map
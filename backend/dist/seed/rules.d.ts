declare const rules: ({
    rule_name: string;
    rule_description: string;
    is_active: boolean;
    rule_type: string;
    rule_severity: string;
    rule_weight: number;
    risk_score_value: number;
    parameters: {
        key: string;
        operator: string;
        value: string;
        value_type: string;
    }[];
    time_windows: {
        duration: number;
        unit: string;
        aggregation_type: string;
        key: string;
        threshold: string;
    }[];
    rule_actions: {
        action: string;
        details: string;
    }[];
    currency_context?: undefined;
} | {
    rule_name: string;
    rule_description: string;
    is_active: boolean;
    rule_type: string;
    rule_severity: string;
    rule_weight: number;
    risk_score_value: number;
    currency_context: string;
    parameters: {
        key: string;
        operator: string;
        value: string;
        value_type: string;
    }[];
    time_windows: {
        duration: number;
        unit: string;
        aggregation_type: string;
        key: string;
        threshold: string;
    }[];
    rule_actions: {
        action: string;
        details: string;
    }[];
} | {
    rule_name: string;
    rule_description: string;
    is_active: boolean;
    rule_type: string;
    rule_severity: string;
    rule_weight: number;
    risk_score_value: number;
    currency_context: null;
    parameters: {
        key: string;
        operator: string;
        value: string;
        value_type: string;
    }[];
    time_windows: {
        duration: number;
        unit: string;
        aggregation_type: string;
        key: string;
        threshold: string;
    }[];
    rule_actions: {
        action: string;
        details: string;
    }[];
})[];
export default rules;
//# sourceMappingURL=rules.d.ts.map
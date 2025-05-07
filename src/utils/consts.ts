export const ATTENTION_CHECK_INTERVAL = 5;
export const MAX_IMC_MISTAKES = 2;
export const TOTAL_SETS = 30;
export const REQUIRED_CORRECT_COUNT = 6;
export const TAIL_COMPLETION_INDEX = 9;

// Define the array for attention check intervals based on original logic
export const ATTENTION_CHECK_SETS = [3, 8, 13, 17, 22, 26];

export const STORAGE_KEYS = {
    IMC_ANSWERS: "IMCAnswers",
    ATTENTION_ANSWERS: "AttentionAnswers",
    IMC_MISTAKES: "IMCMistakeCount",
    ALERTNESS_COUNT: "alertnessCorrectCount",
    SHOW_MODAL: "showAlertnessModal",
    // Add missing keys
    TABLE_ROWS: "tableRows",
    CURR_SET: "currSet"
} as const;


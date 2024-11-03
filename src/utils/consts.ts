export const ATTENTION_CHECK_INTERVAL = 5;
export const MAX_IMC_MISTAKES = 2;
export const TOTAL_SETS = 30;
export const REQUIRED_CORRECT_COUNT = 6;
export const TAIL_COMPLETION_INDEX = 9;

export const STORAGE_KEYS = {
    IMC_ANSWERS: "IMCAnswers",
    ATTENTION_ANSWERS: "AttentionAnswers",
    IMC_MISTAKES: "IMCMistakeCount",
    ALERTNESS_COUNT: "alertnessCorrectCount",
    SHOW_MODAL: "showAlertnessModal"
} as const;


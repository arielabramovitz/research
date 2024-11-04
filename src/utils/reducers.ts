import {attentionCheckQuestions, followUps, IMCAttentionCheckQuestions} from "../components/survey-form/questions.ts";
import {ATTENTION_CHECK_INTERVAL, MAX_IMC_MISTAKES, TOTAL_SETS} from "./consts.ts";
import {TableRow, SentenceSet} from "./types.ts";


export interface SurveyState {
    sentenceSets: SentenceSet[];
    currSet: number;
    requiresCompletion: boolean;
    IMCAnswers: number[];
    attentionAnswers: number[];
    alertnessCorrectCount: number;
    IMCMistakeCount: number;
    tailIndex: number;
    showAlertnessModal: boolean;
    followUpAnswerChecked: number;
    highlightedAnswer: string;
    boldedVerb: string;
    followUp: string;
    questionHead: string;
    questionTail: string;
    checked: boolean;
    tableRows: TableRow[];
    tailCompletion: string;
    boldedVerbsInds: number[];
    doRedirect: boolean;
}


export type SurveyAction =
    | { type: 'SET_SENTENCE_SETS'; payload: SentenceSet[] }
    | { type: 'SET_CURR_SET'; payload: number }
    | { type: 'SET_REQUIRES_COMPLETION'; payload: boolean }
    | { type: 'SET_IMC_ANSWERS'; payload: number[] }
    | { type: 'ADD_IMC_ANSWER'; payload: number }
    | { type: 'SET_ATTENTION_ANSWERS'; payload: number[] }
    | { type: 'ADD_ATTENTION_ANSWER'; payload: number }
    | { type: 'SET_ALERTNESS_COUNT'; payload: number }
    | { type: 'INCREMENT_ALERTNESS_COUNT' }
    | { type: 'SET_IMC_MISTAKE_COUNT'; payload: number }
    | { type: 'INCREMENT_IMC_MISTAKE_COUNT' }
    | { type: 'SET_TAIL_INDEX'; payload: number }
    | { type: 'SET_SHOW_ALERTNESS_MODAL'; payload: boolean }
    | { type: 'SET_FOLLOW_UP_ANSWER_CHECKED'; payload: number }
    | { type: 'SET_HIGHLIGHTED_ANSWER'; payload: string }
    | { type: 'SET_BOLDED_VERB'; payload: string }
    | { type: 'SET_FOLLOW_UP'; payload: string }
    | { type: 'SET_QUESTION_HEAD'; payload: string }
    | { type: 'SET_QUESTION_TAIL'; payload: string }
    | { type: 'SET_CHECKED'; payload: boolean }
    | { type: 'SET_TABLE_ROWS'; payload: TableRow[] }
    | { type: 'ADD_TABLE_ROW'; payload: TableRow }
    | { type: 'DELETE_TABLE_ROW'; payload: number }
    | { type: 'SET_TAIL_COMPLETION'; payload: string }
    | { type: 'SET_BOLDED_VERBS_INDS'; payload: number[] }
    | { type: 'SET_DO_REDIRECT'; payload: boolean }
    | { type: 'RESET_FORM' }
    | { type: 'UPDATE_FROM_EDIT'; payload: TableRow}
    | { type: 'SAVE_QUESTION' }
    | { type: 'HANDLE_ATTENTION_CHECK'; payload: number }
    | { type: 'HANDLE_HEAD_SELECT'; payload: string }
    | { type: 'HANDLE_TAIL_SELECT'; payload: { index: number; text: string; qType: number } }
    | { type: 'HANDLE_TEXT_SELECT'; payload: string }
    | { type: 'HANDLE_NEXT_SET' }
    | { type: 'HANDLE_EDIT'; payload: { rowIndex: number; row: TableRow }};

export const initialState: SurveyState = {
    sentenceSets: [],
    currSet: 0,
    requiresCompletion: false,
    IMCAnswers: [],
    attentionAnswers: [],
    alertnessCorrectCount: 0,
    IMCMistakeCount: 0,
    tailIndex: -1,
    showAlertnessModal: false,
    followUpAnswerChecked: 0,
    highlightedAnswer: "",
    boldedVerb: "",
    followUp: "",
    questionHead: "",
    questionTail: "",
    checked: false,
    tableRows: [],
    tailCompletion: "",
    boldedVerbsInds: [],
    doRedirect: false
};

export function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
    switch (action.type) {
        case 'SET_SENTENCE_SETS':
            return { ...state, sentenceSets: action.payload };

        case 'SET_CURR_SET':
            return { ...state, currSet: action.payload };

        case 'SET_REQUIRES_COMPLETION':
            return { ...state, requiresCompletion: action.payload };

        case 'SET_IMC_ANSWERS':
            return { ...state, IMCAnswers: action.payload };

        case 'ADD_IMC_ANSWER':
            return {
                ...state,
                IMCAnswers: [...state.IMCAnswers, action.payload]
            };

        case 'SET_ATTENTION_ANSWERS':
            return { ...state, attentionAnswers: action.payload };

        case 'ADD_ATTENTION_ANSWER':
            return {
                ...state,
                attentionAnswers: [...state.attentionAnswers, action.payload]
            };

        case 'SET_ALERTNESS_COUNT':
            return { ...state, alertnessCorrectCount: action.payload };

        case 'INCREMENT_ALERTNESS_COUNT':
            return {
                ...state,
                alertnessCorrectCount: state.alertnessCorrectCount + 1
            };

        case 'SET_IMC_MISTAKE_COUNT':
            return { ...state, IMCMistakeCount: action.payload };

        case 'INCREMENT_IMC_MISTAKE_COUNT':
            return {
                ...state,
                IMCMistakeCount: state.IMCMistakeCount + 1
            };

        case 'SET_TAIL_INDEX':
            return { ...state, tailIndex: action.payload };

        case 'SET_SHOW_ALERTNESS_MODAL':
            return { ...state, showAlertnessModal: action.payload };

        case 'SET_FOLLOW_UP_ANSWER_CHECKED':
            return { ...state, followUpAnswerChecked: action.payload };

        case 'SET_HIGHLIGHTED_ANSWER':
            return { ...state, highlightedAnswer: action.payload };

        case 'SET_BOLDED_VERB':
            return { ...state, boldedVerb: action.payload };

        case 'SET_FOLLOW_UP':
            return { ...state, followUp: action.payload };

        case 'SET_QUESTION_HEAD':
            return { ...state, questionHead: action.payload };

        case 'SET_QUESTION_TAIL':
            return { ...state, questionTail: action.payload };

        case 'SET_CHECKED':
            return { ...state, checked: action.payload };

        case 'SET_TABLE_ROWS':
            return { ...state, tableRows: action.payload };

        case 'ADD_TABLE_ROW':
            return {
                ...state,
                tableRows: [...state.tableRows, action.payload]
            };

        case 'DELETE_TABLE_ROW':
            return {
                ...state,
                tableRows: state.tableRows.filter((_, index) => index !== action.payload)
            };

        case 'SET_TAIL_COMPLETION':
            return { ...state, tailCompletion: action.payload };

        case 'SET_BOLDED_VERBS_INDS':
            return { ...state, boldedVerbsInds: action.payload };

        case 'SET_DO_REDIRECT':
            return { ...state, doRedirect: action.payload };

        case 'RESET_FORM':
            return {
                ...state,
                tailCompletion: "",
                followUpAnswerChecked: 0,
                checked: false,
                questionTail: "",
                questionHead: "",
                followUp: "",
                tailIndex: -1,
                highlightedAnswer: ""
            };

        case 'UPDATE_FROM_EDIT':
            return {
                ...state,
                questionHead: action.payload.questionHead,
                questionTail: action.payload.questionTail || "",
                boldedVerb: action.payload.answer,
                tailIndex: action.payload.tailIndex,
                tailCompletion: action.payload.tailCompletion,
                followUp: action.payload.followupQuestion,
                highlightedAnswer: action.payload.followupAnswer,
                checked: true,
                followUpAnswerChecked: action.payload.followupAnswer.length > 0 ? 1 : 2
            };

        case 'SAVE_QUESTION':
            const newRow: TableRow = {
                setNumber: state.currSet + 1,
                questionHead: state.questionHead,
                questionTail: !state.requiresCompletion
                    ? state.questionTail
                    : (state.questionTail.slice(0, -4)),
                tailCompletion: state.tailCompletion,
                answer: state.boldedVerb,
                followupQuestion: state.followUp,
                followupAnswer: state.highlightedAnswer,
                tailIndex: state.tailIndex,
            };

            return {
                ...state,
                tableRows: [...state.tableRows, newRow],
                tailCompletion: "",
                followUpAnswerChecked: 0,
                checked: false,
                questionTail: "",
                questionHead: "",
                followUp: "",
                tailIndex: -1,
                highlightedAnswer: ""
            };

        case 'HANDLE_ATTENTION_CHECK': {
            const questionNum = Math.floor((state.currSet + 1) / ATTENTION_CHECK_INTERVAL);
            const isIMCQuestion = questionNum % 2 === 0;
            const currIndex = Math.floor(questionNum / 2);
            const currQuestionSet = isIMCQuestion
                ? IMCAttentionCheckQuestions
                : attentionCheckQuestions;

            let newState = {
                ...state,
                showAlertnessModal: false
            };

            if (isIMCQuestion) {
                newState.IMCAnswers = [...state.IMCAnswers, action.payload];
            } else {
                newState.attentionAnswers = [...state.attentionAnswers, action.payload];
            }

            if (action.payload === currQuestionSet[currIndex].correctAnswerIndex) {
                newState.alertnessCorrectCount = state.alertnessCorrectCount + 1;
            } else if (isIMCQuestion) {
                newState.IMCMistakeCount = state.IMCMistakeCount + 1;
                if (newState.IMCMistakeCount >= MAX_IMC_MISTAKES) {
                    newState.doRedirect = true;
                }
            }

            return newState;
        }

        case 'HANDLE_HEAD_SELECT':
            return {
                ...state,
                questionHead: action.payload,
                checked: false,
                followUpAnswerChecked: 0,
                highlightedAnswer: "",
                tailCompletion: ""
            };

        case 'HANDLE_TAIL_SELECT':
            return {
                ...state,
                tailIndex: action.payload.index,
                questionTail: action.payload.text,
                checked: false,
                followUpAnswerChecked: 0,
                highlightedAnswer: "",
                tailCompletion: "",
                requiresCompletion: action.payload.qType === 9,
                followUp: followUps[action.payload.qType]
            };

        case 'HANDLE_TEXT_SELECT':
            return {
                ...state,
                highlightedAnswer: action.payload
            };

        case 'HANDLE_NEXT_SET': {
            const nextSet = state.currSet + 1;
            return {
                ...state,
                currSet: nextSet,
                showAlertnessModal: (nextSet % ATTENTION_CHECK_INTERVAL === 0) && nextSet < TOTAL_SETS,
                doRedirect: nextSet === TOTAL_SETS
            };
        }

        case 'HANDLE_EDIT': {
            const { rowIndex, row } = action.payload;
            const newRows = state.tableRows.filter((r: TableRow) =>
                r.setNumber !== state.currSet + 1 ||
                r !== state.tableRows[rowIndex]
            );

            return {
                ...state,
                tableRows: newRows,
                questionHead: row.questionHead,
                questionTail: row.questionTail,
                boldedVerb: row.answer,
                tailIndex: row.tailIndex,
                tailCompletion: row.tailCompletion,
                followUp: row.followupQuestion,
                highlightedAnswer: row.followupAnswer,
                checked: true,
                followUpAnswerChecked: row.followupAnswer.length > 0 ? 1 : 2
            };
        }

        default:
            return state;
    }



}
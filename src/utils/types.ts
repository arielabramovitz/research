export type TableRow = {
    setNumber: number;
    questionHead: string;
    questionTail: string;
    answer: string;
    followupQuestion: string;
    followupAnswer: string;
    tailCompletion: string;
    tailIndex: number;
};

export type SentenceSet = {
    id: string;
    sentences: string[];
    verbs: string[];
};

export type StateSetters = {
    setIMCAnswers: (answers: number[]) => void;
    setAttentionAnswers: (answers: number[]) => void;
    setIMCMistakeCount: (count: number) => void;
    setAlertnessCorrectCount: (count: number) => void;
    setShowAlertnessModal: (show: boolean) => void;
    setTableRows: (rows: TableRow[]) => void;
    setSentenceSets: (sets: SentenceSet[]) => void;
    setBoldedVerbsInds: (indices: number[]) => void;
    setCurrSet: (index: number) => void;
    setBoldedVerb: (verb: string) => void;
};

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
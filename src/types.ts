type TableRow = {
    setNumber: number;
    questionHead: string;
    questionTail: string;
    answer: string;
    followupQuestion: string;
    followupAnswer: string;
    tailCompletion: string;
    tailIndex: number;
};

type SentenceSet = {
    id: string;
    sentences: string[];
    verbs: string[];
};

type StateSetters = {
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

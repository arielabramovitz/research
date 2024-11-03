import {useEffect} from 'react';
import {getSentenceSets} from "../utils/api.ts";
import {SentenceSet, StateSetters, TableRow} from "../utils/types.ts";

const STORAGE_KEYS = {
    SENTENCE_SETS: 'sentenceSets',
    BOLDED_INDICES: 'boldedInds',
    CURR_SET: 'currSet',
    IMC_ANSWERS: 'IMCAnswers',
    ATTENTION_ANSWERS: 'AttentionAnswers',
    IMC_MISTAKES: 'IMCMistakeCount',
    ALERTNESS_COUNT: 'alertnessCorrectCount',
    SHOW_MODAL: 'showAlertnessModal',
    TABLE_ROWS: 'tableRows'
} as const;

const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set: <T>(key: string, value: T): void => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving to sessionStorage: ${error}`);
        }
    }
};

export const useInitialization = (setters: StateSetters) => {
    const loadStoredAttentionState = () => {
        const state = {
            IMCAnswers: storage.get<number[]>(STORAGE_KEYS.IMC_ANSWERS, []),
            attentionAnswers: storage.get<number[]>(STORAGE_KEYS.ATTENTION_ANSWERS, []),
            IMCMistakes: storage.get<number>(STORAGE_KEYS.IMC_MISTAKES, 0),
            alertnessCount: storage.get<number>(STORAGE_KEYS.ALERTNESS_COUNT, 0),
            showModal: storage.get<boolean>(STORAGE_KEYS.SHOW_MODAL, false),
            tableRows: storage.get<TableRow[]>(STORAGE_KEYS.TABLE_ROWS, [])
        };

        setters.setIMCAnswers(state.IMCAnswers);
        setters.setAttentionAnswers(state.attentionAnswers);
        setters.setIMCMistakeCount(state.IMCMistakes);
        setters.setAlertnessCorrectCount(state.alertnessCount);
        setters.setShowAlertnessModal(state.showModal);
        setters.setTableRows(state.tableRows);
    };

    const loadCachedSentenceData = () => {
        const sets = storage.get<SentenceSet[]>(STORAGE_KEYS.SENTENCE_SETS, []);
        if (sets.length === 0) return null;

        const boldedIndices = storage.get<number[]>(STORAGE_KEYS.BOLDED_INDICES, []);
        const currentSetIndex = storage.get<number>(STORAGE_KEYS.CURR_SET, 0);

        return {sets, boldedIndices, currentSetIndex};
    };

    const initializeNewSentenceData = async () => {
        const sets = await getSentenceSets(30);
        const boldedIndices = sets.map(set =>
            Math.floor(Math.random() * set.verbs.length)
        );

        storage.set(STORAGE_KEYS.SENTENCE_SETS, sets);
        storage.set(STORAGE_KEYS.BOLDED_INDICES, boldedIndices);
        storage.set(STORAGE_KEYS.CURR_SET, 0);
        storage.set(STORAGE_KEYS.SHOW_MODAL, true);

        return {sets, boldedIndices, currentSetIndex: 0};
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                // Load attention state
                loadStoredAttentionState();

                // Load or initialize sentence data
                const cachedData = loadCachedSentenceData();
                const sentenceData = cachedData || await initializeNewSentenceData();

                // Update sentence-related states
                setters.setSentenceSets(sentenceData.sets);
                setters.setBoldedVerbsInds(sentenceData.boldedIndices);
                setters.setCurrSet(sentenceData.currentSetIndex);

                // Set initial bolded verb
                if (sentenceData.sets[sentenceData.currentSetIndex]?.verbs) {
                    setters.setBoldedVerb(
                        sentenceData.sets[sentenceData.currentSetIndex]
                            .verbs[sentenceData.boldedIndices[sentenceData.currentSetIndex]]
                    );
                }
            } catch (error) {
                console.error('Initialization error:', error);
                // Handle initialization failure
            }
        };

        initialize();
    }, []);

    // Storage availability check
    useEffect(() => {
        try {
            storage.set('test', 'test');
            storage.get('test', null);
        } catch (error) {
            console.error('SessionStorage is not available:', error);
        }
    }, []);
};
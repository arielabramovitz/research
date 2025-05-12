import {useEffect} from 'react';
import {getSentenceSets} from "../utils/api.ts";
import {SentenceSet, StateSetters, TableRow} from "../utils/types.ts";
import { ATTENTION_CHECK_SETS } from "../utils/consts.ts";
import { timedStorage } from '../utils/timedStorage';

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
        const item = timedStorage.get(key);
        return item !== null ? item : defaultValue;
    },

    set: <T>(key: string, value: T): void => {
        try {
            timedStorage.set(key, value, 15 * 60 * 1000); // 15 minutes
        } catch (error) {
            console.error(`Error saving to timedStorage: ${error}`);
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
            tableRows: storage.get<TableRow[]>(STORAGE_KEYS.TABLE_ROWS, [])
        };

        const currSet = storage.get<number>(STORAGE_KEYS.CURR_SET, 0);
        // Only show modal if currSet is in ATTENTION_CHECK_SETS
        const showModal = ATTENTION_CHECK_SETS.includes(currSet);

        setters.setIMCAnswers(state.IMCAnswers);
        setters.setAttentionAnswers(state.attentionAnswers);
        setters.setIMCMistakeCount(state.IMCMistakes);
        setters.setAlertnessCorrectCount(state.alertnessCount);
        setters.setShowAlertnessModal(showModal);
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
                loadStoredAttentionState();

                const cachedData = loadCachedSentenceData();
                const sentenceData = cachedData || await initializeNewSentenceData();

                setters.setSentenceSets(sentenceData.sets);
                setters.setBoldedVerbsInds(sentenceData.boldedIndices);
                setters.setCurrSet(sentenceData.currentSetIndex);

                if (sentenceData.sets[sentenceData.currentSetIndex]?.verbs) {
                    setters.setBoldedVerb(
                        sentenceData.sets[sentenceData.currentSetIndex]
                            .verbs[sentenceData.boldedIndices[sentenceData.currentSetIndex]]
                    );
                }
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        initialize();
    }, []);

};
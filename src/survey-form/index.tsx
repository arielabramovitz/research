import React, {ChangeEvent, useEffect, useMemo, useRef, useReducer} from "react";
import {followUps, heads, tails, IMCAttentionCheckQuestions, attentionCheckQuestions} from "./questions.js";
import {ParticipantAnswers, SentenceSet, uploadParticipantAnswers, UploadError} from "../utils/api.js";
import {
    Button,
    Card,
    Container,
    Form,
    FormGroup,
    FormLabel,
    InputGroup,
    Spinner
} from "react-bootstrap";
import QuestionTable from "./questionsTable.js";
import {useSearchParams} from 'react-router-dom';
import {AttentionCheck} from "./AttentionCheck.js";
import {useInitialization} from "../hooks/useInitialization.js";
import {
    ATTENTION_CHECK_INTERVAL, MAX_IMC_MISTAKES, REQUIRED_CORRECT_COUNT,
    STORAGE_KEYS, TOTAL_SETS,
    ATTENTION_CHECK_SETS
} from "../utils/consts.js"

import {initialState, surveyReducer} from "../utils/reducers.js"
import {StateSetters, TableRow} from "../utils/types.js";
import { CollapsableCard } from "../components/collapsableCard.js";
// Import new components
import SentenceDisplay from "./components/SentenceDisplay.js";
import QuestionBuilder from "./components/QuestionBuilder.js";
import QuestionPreview from "./components/QuestionPreview.js";
import FollowUpQuestion from "./components/FollowUpQuestion.js";
import ActionButtons from "./components/ActionButtons.js";
import { timedStorage } from '../utils/timedStorage';






function SurveyForm({hideSurvey}: { hideSurvey: boolean }) {

    
    const [state, dispatch] = useReducer(surveyReducer, initialState);
    const [params] = useSearchParams();

    const id = params.get('PROLIFIC_ID');
    const sessionId = params.get('SESSION_ID');
    const prolificBaseUrl = "https://app.prolific.com/submissions/complete?cc=";
    const rejection = "CBPE50TB";
    const completedWithSixCorrect = "CF0JLBJE";
    const endedWithMistakes = "C1MUDNLY";

    const headRef = useRef<HTMLSelectElement | null>(null);
    const tailRef = useRef<HTMLSelectElement | null>(null);
    const followUpAnswerRef = useRef<HTMLTextAreaElement | null>(null);
    const tailCompletionRef = useRef<HTMLTextAreaElement | null>(null);
    const surveyRef = useRef<HTMLDivElement | null>(null);

    const handleRedirect = (code: string) => {
        alert(`redirecting to ${Object.keys({code})[0]}`);
        // window.location.href = prolificBaseUrl + code
    };

    const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
        dispatch({type: 'HANDLE_HEAD_SELECT', payload: event.target.value})
    };

    const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target) {
            const index = event.target.selectedIndex;
            // Ensure the index is valid before accessing tails[index]
            if (index >= 0 && index < tails.length) {
                const text = tails[index].tail;
                const qType = tails[index].type;
                const payload = {
                    index: index,
                    text: text,
                    qType: qType
                }
                dispatch({type: 'HANDLE_TAIL_SELECT', payload: payload})
            } else {
                // Handle the case where the index might be invalid (e.g., placeholder selected)
                dispatch({type: 'HANDLE_TAIL_SELECT', payload: { index: 0, text: '', qType: 0 }});
            }
        }
    };

    const handleNextSet = async () => {
        if (!id) {
            alert("PROLIFIC_ID or SESSION_ID weren't specified")
            return;
        }
        // Optimistically move to the next set immediately
        dispatch({ type: 'HANDLE_NEXT_SET'});
        if (ATTENTION_CHECK_SETS.includes(state.currSet + 1) && state.currSet + 1 < TOTAL_SETS) {
            dispatch({ type: 'SET_SHOW_ALERTNESS_MODAL', payload: true });
        }
        if (state.currSet + 1 === TOTAL_SETS) {
            handleRedirect(
                state.alertnessCorrectCount >= REQUIRED_CORRECT_COUNT
                    ? completedWithSixCorrect
                    : endedWithMistakes
            );
        }
        // Upload in the background
        handleUpload().catch((error) => {
            // Show error notification, allow retry, etc.
            alert("Failed to save progress. Please check your connection and try again.");
        });
    };

    const handleAttentionCheck = (answer: number) => {
        dispatch({ type: 'HANDLE_ATTENTION_CHECK', payload: answer})
    };

    const handleTextSelect = (e: React.MouseEvent<HTMLElement>) => {
        // Only update if a follow-up question is active and expects text selection
        if (state.followUp.length > 0 && state.checked && state.followUpAnswerChecked !== 2) {
             const highlighted = window.getSelection()?.toString();
             if (highlighted && highlighted.length > 0) {
                dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: highlighted });
                // Optionally auto-check the "answer exists" radio
                 dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 1 });
                if (followUpAnswerRef.current) {
                    followUpAnswerRef.current.value = highlighted; // Update textarea if needed
                 }
             }
        }
    };


    const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        // Dispatch the change to update state.highlightedAnswer
        dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: e.target.value });
        // Auto-check the "answer exists" radio if text is entered
        if (e.target.value.length > 0) {
            dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 1 });
        }
    };


    const handleEditClick = (i: number) => {
        const row = filteredRows[i];
        dispatch({ type: 'HANDLE_EDIT', payload: {rowIndex: i, row: row} });
    };

    const handleDeleteClick = (i: number) => {
        dispatch({ type: 'DELETE_TABLE_ROW', payload: i });
    };

    const handleUpload = async () => {
        if (!id || !sessionId) {
            console.error("Missing ID or SessionID, cannot upload.");
            alert("Cannot save progress: Missing Prolific ID or Session ID.");
            return;
        }

        const userAnswers: ParticipantAnswers = {
            id: id,
            sessionId: sessionId,
            IMCAnswers: state.IMCAnswers,
            AttentionAnswers: state.attentionAnswers,
            answers: [{
                sentenceSetId: state.sentenceSets[state.currSet]?.id || '',
                first: state.sentenceSets[state.currSet]?.sentences?.[0] || '',
                second: state.sentenceSets[state.currSet]?.sentences?.[1] || '',
                third: state.sentenceSets[state.currSet]?.sentences?.[2] || '',
                verb: state.boldedVerb,
                questions: filteredRows.map((row: TableRow) => {
                    return {
                        question: `${row.questionHead} ${row.questionTail}${row.tailCompletion ? ' ' + row.tailCompletion : ''}`,
                        answer: row.answer,
                        followUp: row.followupQuestion,
                        followUpAnswer: row.followupAnswer || ""
                    }
                })
            }]
        };

        try {
            await uploadParticipantAnswers(userAnswers);
            console.log("Answers uploaded successfully for set:", state.currSet + 1);
        } catch (error: unknown) {
            console.error("Failed to upload answers:", error);
            
            // Handle specific error types
            if (error instanceof UploadError) {
                if (error.message.includes('Missing required fields')) {
                    alert("Cannot save progress: Missing required information. Please check your Prolific ID and Session ID.");
                } else if (error.message.includes('No answers provided')) {
                    alert("Cannot save progress: No answers to upload. Please add some answers before proceeding.");
                } else if (error.status && error.status >= 400 && error.status < 500) {
                    alert("Cannot save progress: Invalid data. Please check your answers and try again.");
                } else {
                    alert("Failed to save progress. Please check your connection and try again.");
                }
            } else {
                alert("An unexpected error occurred. Please try again.");
            }
            
            // Store the current state in sessionStorage as a backup
            try {
                sessionStorage.setItem('lastFailedUpload', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    answers: userAnswers
                }));
            } catch (storageError) {
                console.error('Failed to store backup:', storageError);
            }
            
            return;
        }
    };


    const handleSave = () => {
         // Construct the new row using state values
         const newRow: TableRow = {
             setNumber: state.currSet + 1,
             questionHead: state.questionHead,
             // Use the correct tail text based on tailIndex
             questionTail: tails[state.tailIndex]?.tail || "", // Add fallback for safety
             // Remove the trailing "..." if it exists and requires completion
             ...(state.requiresCompletion && tails[state.tailIndex]?.tail.endsWith("...") && {
                 questionTail: tails[state.tailIndex].tail.slice(0, -3).trim(), // Trim potential space
             }),
             tailCompletion: state.requiresCompletion ? state.tailCompletion : "", // Only include completion if required
             answer: state.boldedVerb,
             followupQuestion: state.followUp,
             followupAnswer: state.highlightedAnswer,
             tailIndex: state.tailIndex,
         };


        dispatch({ type: 'ADD_TABLE_ROW', payload: newRow });
        dispatch({ type: 'RESET_FORM' });

        // Manually reset refs if needed, although relying on controlled components is better
        if (followUpAnswerRef.current) followUpAnswerRef.current.value = "";
        if (tailCompletionRef.current) tailCompletionRef.current.value = "";

    };

    const handleDisabledSave = () => {
        // Condition 1: If completion is required, it must not be empty.
        if (state.requiresCompletion && state.tailCompletion.trim().length === 0) {
            return true; // Disabled
        }
        // Condition 2: The main question checkbox must be checked.
        if (!state.checked) {
            return true; // Disabled
        }
        // Condition 3: If a follow-up question exists...
        if (state.followUp.length > 0) {
            const answerProvided = state.highlightedAnswer.trim().length > 0;
            const radio1Checked = state.followUpAnswerChecked === 1;
            const radio2Checked = state.followUpAnswerChecked === 2;
            if (!((answerProvided && radio1Checked) || radio2Checked)) {
                return true; // Disabled
            }
        }
        // If none of the disabling conditions are met, the button is enabled.
        return false;
    };


    useInitialization({
        setSentenceSets: (sets) => dispatch({ type: 'SET_SENTENCE_SETS', payload: sets }),
        setCurrSet: (curr) => dispatch({ type: 'SET_CURR_SET', payload: curr }),
        setIMCAnswers: (answers) => dispatch({ type: 'SET_IMC_ANSWERS', payload: answers }),
        setAttentionAnswers: (answers) => dispatch({ type: 'SET_ATTENTION_ANSWERS', payload: answers }),
        setIMCMistakeCount: (count) => dispatch({ type: 'SET_IMC_MISTAKE_COUNT', payload: count }),
        setAlertnessCorrectCount: (count) => dispatch({ type: 'SET_ALERTNESS_COUNT', payload: count }),
        setShowAlertnessModal: (show) => dispatch({ type: 'SET_SHOW_ALERTNESS_MODAL', payload: show }),
        setTableRows: (rows) => dispatch({ type: 'SET_TABLE_ROWS', payload: rows }),
        setBoldedVerbsInds: (inds) => dispatch({ type: 'SET_BOLDED_VERBS_INDS', payload: inds }),
        setBoldedVerb: (verb) => dispatch({ type: 'SET_BOLDED_VERB', payload: verb })
    } as StateSetters);

    useEffect(() => {
        if (state.doRedirect) {
            // Use >= for the check
            handleRedirect(state.alertnessCorrectCount >= REQUIRED_CORRECT_COUNT ? completedWithSixCorrect : endedWithMistakes);
        }
    }, [state.doRedirect, state.alertnessCorrectCount]); // Add dependency

    useEffect(() => {
        // Sync essential state to sessionStorage
        sessionStorage.setItem(STORAGE_KEYS.IMC_ANSWERS, JSON.stringify(state.IMCAnswers));
        sessionStorage.setItem(STORAGE_KEYS.ATTENTION_ANSWERS, JSON.stringify(state.attentionAnswers));
        sessionStorage.setItem(STORAGE_KEYS.ALERTNESS_COUNT, state.alertnessCorrectCount.toString());
        sessionStorage.setItem(STORAGE_KEYS.IMC_MISTAKES, state.IMCMistakeCount.toString());
        sessionStorage.setItem(STORAGE_KEYS.TABLE_ROWS, JSON.stringify(state.tableRows)); // Use STORAGE_KEYS.TABLE_ROWS
        sessionStorage.setItem(STORAGE_KEYS.CURR_SET, state.currSet.toString()); // Use STORAGE_KEYS.CURR_SET
        sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, String(state.showAlertnessModal));
    }, [state.IMCAnswers, state.attentionAnswers, state.alertnessCorrectCount, state.IMCMistakeCount, state.tableRows, state.currSet, state.showAlertnessModal]);

    useEffect(() => {
        // Update bolded verb when relevant state changes
        if (state.sentenceSets[state.currSet] && state.boldedVerbsInds[state.currSet] !== undefined) {
            const verbIndex = state.boldedVerbsInds[state.currSet];
            const verbs = state.sentenceSets[state.currSet].verbs;
            if (verbIndex >= 0 && verbIndex < verbs.length) {
                 dispatch({
                    type: 'SET_BOLDED_VERB',
                    payload: verbs[verbIndex]
                });
            } else {
                console.warn(`Invalid verb index ${verbIndex} for current set ${state.currSet}`);
                dispatch({ type: 'SET_BOLDED_VERB', payload: '' }); // Reset or handle error
            }
        } else if (state.sentenceSets.length > 0) {
             // Handle cases where data might not be fully loaded yet or indices are missing
             // console.log("Waiting for sentence sets or bolded verb indices...");
             dispatch({ type: 'SET_BOLDED_VERB', payload: '' }); // Ensure reset if data is incomplete
        }
    }, [state.currSet, state.sentenceSets, state.boldedVerbsInds]); // Correct dependencies


    const filteredRows = useMemo(() => {
        return state.tableRows.filter((row: TableRow) => row.setNumber === state.currSet + 1);
    }, [state.tableRows, state.currSet]);

    // Restore from timedStorage on mount
    React.useEffect(() => {
        const saved = timedStorage.get('surveyState');
        if (saved) {
            // Restore all state fields (dispatch actions for each)
            if (saved.sentenceSets) dispatch({ type: 'SET_SENTENCE_SETS', payload: saved.sentenceSets });
            if (typeof saved.currSet === 'number') dispatch({ type: 'SET_CURR_SET', payload: saved.currSet });
            if (Array.isArray(saved.IMCAnswers)) dispatch({ type: 'SET_IMC_ANSWERS', payload: saved.IMCAnswers });
            if (Array.isArray(saved.attentionAnswers)) dispatch({ type: 'SET_ATTENTION_ANSWERS', payload: saved.attentionAnswers });
            if (typeof saved.alertnessCorrectCount === 'number') dispatch({ type: 'SET_ALERTNESS_COUNT', payload: saved.alertnessCorrectCount });
            if (typeof saved.IMCMistakeCount === 'number') dispatch({ type: 'SET_IMC_MISTAKE_COUNT', payload: saved.IMCMistakeCount });
            if (Array.isArray(saved.tableRows)) dispatch({ type: 'SET_TABLE_ROWS', payload: saved.tableRows });
            if (Array.isArray(saved.boldedVerbsInds)) dispatch({ type: 'SET_BOLDED_VERBS_INDS', payload: saved.boldedVerbsInds });
            if (typeof saved.showAlertnessModal === 'boolean') dispatch({ type: 'SET_SHOW_ALERTNESS_MODAL', payload: saved.showAlertnessModal });
            if (typeof saved.boldedVerb === 'string') dispatch({ type: 'SET_BOLDED_VERB', payload: saved.boldedVerb });
            // Add more fields as needed
        }
    }, []);

    // Save to timedStorage on every state change
    React.useEffect(() => {
        timedStorage.set('surveyState', state, 15 * 60 * 1000); // 15 minutes
    }, [state]);

    return (
        <CollapsableCard defExpand={true} bgColor="#deecfa" header="ניסוי">
            <Container fluid className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full">

                    {state.currSet < TOTAL_SETS ? ( // Use TOTAL_SETS constant
                         <Container ref={surveyRef} className="tw-flex tw-flex-col tw-h-full tw-p-1 tw-mb-2">
                            {/* Use SentenceDisplay component */}
                             <SentenceDisplay
                                 sentenceSets={state.sentenceSets}
                                 currSet={state.currSet}
                                 boldedVerbsInds={state.boldedVerbsInds}
                                 handleTextSelect={handleTextSelect}
                             />
                            {/* Use QuestionBuilder component */}
                             <QuestionBuilder
                                 heads={heads}
                                 tails={tails}
                                 questionHead={state.questionHead}
                                 tailIndex={state.tailIndex}
                                 handleSelectHead={handleSelectHead}
                                 handleSelectTail={handleSelectTail}
                                 headRef={headRef}
                                 tailRef={tailRef}
                             />
                            {/* Use QuestionPreview component */}
                             <QuestionPreview
                                 questionHead={state.questionHead}
                                 questionTail={state.questionTail}
                                 requiresCompletion={state.requiresCompletion}
                                 tailCompletion={state.tailCompletion}
                                 boldedVerb={state.boldedVerb}
                                 checked={state.checked}
                                 dispatch={dispatch}
                                 tailCompletionRef={tailCompletionRef}
                             />
                            {/* Use FollowUpQuestion component */}
                             <FollowUpQuestion
                                 followUp={state.followUp}
                                 questionHead={state.questionHead}
                                 checked={state.checked}
                                 followUpAnswerChecked={state.followUpAnswerChecked}
                                 highlightedAnswer={state.highlightedAnswer}
                                 dispatch={dispatch}
                                 handleFollowUpChange={handleFollowUpChange}
                                 followUpAnswerRef={followUpAnswerRef}
                             />
                            {/* Use ActionButtons component */}
                            <ActionButtons
                                handleSave={handleSave}
                                handleNextSet={handleNextSet}
                                handleDisabledSave={handleDisabledSave}
                                questionHead={state.questionHead}
                                questionTail={state.questionTail}
                                tailCompletion={state.tailCompletion}
                                currSet={state.currSet}
                                filteredRowsLength={filteredRows.length}
                            />
                        </Container>
                     ) : (
                         // Display something when currSet >= TOTAL_SETS (e.g., completion message)
                         <Container>
                             <h4>Survey Completed! Redirecting...</h4>
                             {/* Or show final stats, thank you message, etc. */}
                         </Container>
                     )}

                <Container className="tw-flex tw-flex-col tw-h-full">
                    {filteredRows.length > 0 && ( // Render table only if there are rows for the current set
                        <QuestionTable
                            tableRows={filteredRows}
                            handleEditClick={handleEditClick}
                            handleDeleteClick={handleDeleteClick}
                        />
                    )}
                </Container>
                {/* Render AttentionCheck only if the modal should be shown based on state */}
                 {state.showAlertnessModal && state.currSet < TOTAL_SETS && ( // Add check for currSet < TOTAL_SETS
                     <AttentionCheck
                         currSet={state.currSet}
                         // Pass showAlertnessModal directly from state
                         showAlertnessModal={state.showAlertnessModal}
                         handleAttentionCheck={handleAttentionCheck}
                         hideSurvey={hideSurvey} // This prop might need re-evaluation based on AttentionCheck logic
                     />
                 )}
            </Container>
        </CollapsableCard>
    );
}

export default SurveyForm;
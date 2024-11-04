import React, {ChangeEvent, useEffect, useMemo, useRef, useReducer} from "react";
import {followUps, heads, tails, IMCAttentionCheckQuestions, attentionCheckQuestions} from "./questions.ts";
import {ParticipantAnswers, SentenceSet, uploadParticipantAnswers,} from "../../utils/api.ts";
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
import QuestionTable from "./questionsTable.tsx";
import {useSearchParams} from 'react-router-dom';
import {ChevronLeft, ChevronRight} from "react-bootstrap-icons";
import {AttentionCheck} from "./AttentionCheck.tsx";
import {useInitialization} from "../../hooks/useInitialization.ts";
import {
    ATTENTION_CHECK_INTERVAL, MAX_IMC_MISTAKES, REQUIRED_CORRECT_COUNT,
    STORAGE_KEYS, TOTAL_SETS
} from "../../utils/consts.ts"

import {initialState, surveyReducer} from "../../utils/reducers.ts"
import {StateSetters, TableRow} from "../../utils/types.ts";






function SurveyForm({hideSurvey}: { hideSurvey: boolean }) {

    const [state, dispatch] = useReducer(surveyReducer, initialState);
    const [params] = useSearchParams();

    const id = params.get('PROLIFIC_ID');
    const sessionId = params.get('SESSION_ID');
    const prolificBaseUrl = "https://app.prolific.com/submissions/complete?cc=";
    const rejection = "CBPE50TB";
    const completedWithSixCorrect = "CF0JLBJE";
    const endedWithMistakes = "C1MUDNLY";

    const tailCompletionInd = 9;
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
        // dispatch({ type: 'SET_QUESTION_HEAD', payload: event.target.value });
        // dispatch({ type: 'SET_CHECKED', payload: false });
        // dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 0 });
        // dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: "" });
        // dispatch({ type: 'SET_TAIL_COMPLETION', payload: "" });
        dispatch({type: 'HANDLE_HEAD_SELECT', payload: event.target.value})
    };

    const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target) {
            const index = event.target.selectedIndex;
            const text = tails[index].tail;
            const qType = tails[index].type;
            const payload = {
                index: index,
                text: text,
                qType: qType
            }
            // dispatch({ type: 'SET_TAIL_INDEX', payload: index });
            // dispatch({ type: 'SET_QUESTION_TAIL', payload: text });
            // dispatch({ type: 'SET_CHECKED', payload: false });
            // dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 0 });
            // dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: "" });
            // dispatch({ type: 'SET_TAIL_COMPLETION', payload: "" });
            // dispatch({ type: 'SET_REQUIRES_COMPLETION', payload: qType === tailCompletionInd });
            // dispatch({ type: 'SET_FOLLOW_UP', payload: followUps[qType] });

            dispatch({type: 'HANDLE_TAIL_SELECT', payload: payload})
        }
    };

    const handleNextSet = async () => {
        if (id === undefined || sessionId === undefined) {
            alert("PROLIFIC_ID or SESSION_ID weren't specified")
        } else {
            await handleUpload();

            dispatch({ type: 'HANDLE_NEXT_SET'});
            const nextSet = state.currSet + 1;
            sessionStorage.setItem("currSet", nextSet.toString());

            if ((nextSet % ATTENTION_CHECK_INTERVAL === 0) && nextSet < TOTAL_SETS) {
                sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "true");
            }
            if (nextSet === TOTAL_SETS) {
                handleRedirect(
                    state.alertnessCorrectCount === REQUIRED_CORRECT_COUNT
                        ? completedWithSixCorrect
                        : endedWithMistakes
                );
            }
        }

    };

    const handleAttentionCheck = (answer: number) => {
        dispatch({ type: 'HANDLE_ATTENTION_CHECK', payload: answer})
        sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "false");
    };

    const handleTextSelect = (e: React.MouseEvent<HTMLElement>) => {
        const highlighted = window.getSelection()?.toString();
        dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: highlighted || "" });
    };

    const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        dispatch({ type: 'HANDLE_TEXT_SELECT', payload: e.target.value });
    };


    const handleEditClick = (i: number) => {
        const row = filteredRows[i];
        // const newRows = filteredRows.filter((_: any, j: number) => j !== i);
        // const filteredWithoutCurr = state.tableRows.filter((row: TableRow) => row.setNumber != state.currSet + 1);
        // const updatedRows = [...filteredWithoutCurr, ...newRows];

        // dispatch({ type: 'SET_TABLE_ROWS', payload: updatedRows });
        // sessionStorage.setItem("tableRows", JSON.stringify(updatedRows));
        // dispatch({ type: 'UPDATE_FROM_EDIT', payload: row });
        dispatch({ type: 'HANDLE_EDIT', payload: {rowIndex: i, row: row} });

        sessionStorage.setItem("tableRows", JSON.stringify(state.tableRows));

        if (headRef.current) {
            headRef.current.value = row.questionHead;
        }
        if (tailRef.current) {
            tailRef.current.value = row.questionTail;
        }
        if (followUpAnswerRef.current) {
            followUpAnswerRef.current.value = row.followupAnswer;
        }
    };

    const handleDeleteClick = (i: number) => {
        // const newRows = filteredRows.filter((_: any, j: number) => j !== i);
        // const filteredWithoutCurr = state.tableRows.filter((row: TableRow) => row.setNumber != state.currSet + 1);
        // const updatedRows = [...filteredWithoutCurr, ...newRows];
        // dispatch({ type: 'SET_TABLE_ROWS', payload: updatedRows });
        // sessionStorage.setItem("tableRows", JSON.stringify(updatedRows));

        dispatch({ type: 'DELETE_TABLE_ROW', payload: i });
        sessionStorage.setItem("tableRows", JSON.stringify(state.tableRows));


    };

    const handleUpload = () => {
        if (id && sessionId) {
            const userAnswers: ParticipantAnswers = {
                id: id,
                sessionId: sessionId,
                IMCAnswers: state.IMCAnswers,
                AttentionAnswers: state.attentionAnswers,
                answers: [{
                    sentenceSetId: state.sentenceSets[state.currSet].id,
                    first: state.sentenceSets[state.currSet].sentences[0],
                    second: state.sentenceSets[state.currSet].sentences[1],
                    third: state.sentenceSets[state.currSet].sentences[2],
                    verb: state.boldedVerb,
                    questions: filteredRows.map((row: TableRow) => {
                        return {
                            question: `${row.questionHead} ${row.questionTail} ${row.tailCompletion}`,
                            answer: row.answer,
                            followUp: row.followupQuestion,
                            followUpAnswer: row.followupAnswer || ""
                        }
                    })
                }]
            };

            uploadParticipantAnswers(userAnswers).then(() => {});
            return;
        }
    };

    const handleSave = () => {
        const newRow: TableRow = {
            setNumber: state.currSet + 1,
            questionHead: state.questionHead,
            questionTail: !state.requiresCompletion ? state.questionTail : (state.questionTail.slice(0, -4)),
            tailCompletion: state.tailCompletion,
            answer: state.boldedVerb,
            followupQuestion: state.followUp,
            followupAnswer: state.highlightedAnswer,
            tailIndex: state.tailIndex,
        };

        dispatch({ type: 'ADD_TABLE_ROW', payload: newRow });
        sessionStorage.setItem("tableRows", JSON.stringify([...state.tableRows, newRow]));
        dispatch({ type: 'RESET_FORM' });
    };

    const handleDisabledSave = () => {
        if (state.requiresCompletion && state.tailCompletion.length === 0) {
            return true;
        }
        if (state.checked) {
            if (state.followUp.length === 0 || ((state.followUpAnswerChecked === 1 && state.highlightedAnswer.length > 0) || (state.followUpAnswerChecked === 2 && state.highlightedAnswer.length === 0))) {
                return false;
            }
        }
        return true;
    };

    useEffect(()=>{
        console.log(state.showAlertnessModal)
    }, [state.showAlertnessModal])

    useEffect(() => {
        console.log(state.IMCAnswers)
        if (!hideSurvey && state.IMCAnswers.length === 0) {
            dispatch({ type: 'SET_SHOW_ALERTNESS_MODAL', payload: true });
            sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "true");
        }
    }, [hideSurvey, state.IMCAnswers]);

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
            handleRedirect(state.alertnessCorrectCount === 6 ? completedWithSixCorrect : endedWithMistakes);
        }
    }, [state.doRedirect]);

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEYS.IMC_ANSWERS, JSON.stringify(state.IMCAnswers));
        sessionStorage.setItem(STORAGE_KEYS.ATTENTION_ANSWERS, JSON.stringify(state.attentionAnswers));
        sessionStorage.setItem(STORAGE_KEYS.ALERTNESS_COUNT, state.alertnessCorrectCount.toString());
        sessionStorage.setItem(STORAGE_KEYS.IMC_MISTAKES, state.IMCMistakeCount.toString());
    }, [state.IMCAnswers, state.attentionAnswers, state.alertnessCorrectCount, state.IMCMistakeCount]);

    useEffect(() => {
        if (state.sentenceSets[state.currSet]) {
            dispatch({
                type: 'SET_BOLDED_VERB',
                payload: state.sentenceSets[state.currSet].verbs[state.boldedVerbsInds[state.currSet]]
            });
        }
    }, [state.currSet, state.boldedVerbsInds]);

    const filteredRows = useMemo(() => {
        return state.tableRows.filter((row: TableRow) => row.setNumber === state.currSet + 1);
    }, [state.tableRows, state.currSet]);

    return (
        <Container fluid className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full tw-pb-8 ">
            <Card dir="rtl" className="bd tw-flex tw-flex-col tw-p-4 tw-w-full tw-h-full">

                {state.currSet < 30 ? (<Container ref={surveyRef} className="tw-flex tw-flex-col tw-h-full tw-p-1 tw-mb-2">


                        <div className="tw-pb-8">
                            הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות מנוסחות בזמן הווה אך
                            מתייחסות גם לעתיד
                            או עבר.
                        </div>


                        <Card className="bd tw-h-fit tw-min-h-32 tw-p-4 tw-overflow-y-hidden tw-select-text"
                              onMouseUp={handleTextSelect}>

                            {state.sentenceSets.length === 0 ? (
                                <div className="tw-flex">
                                    <div className="tw-flex tw-items-center tw-justify-center">

                                        <Spinner animation="border"></Spinner>
                                    </div>
                                </div>
                            ) : (
                                <div className="">

                                    <div>
                                        <span>{`${state.sentenceSets[state.currSet]?.sentences[0]} `}</span>
                                        <span
                                            className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                                            dangerouslySetInnerHTML={{
                                                __html: state.sentenceSets[state.currSet]?.sentences[1].split(" ").map((word: string) => {
                                                    if (word.includes(state.sentenceSets[state.currSet]?.verbs[state.boldedVerbsInds[state.currSet]])) {
                                                        return `<b>${word}</b>`
                                                    } else return word
                                                }).join(" "),
                                            }}></span>
                                        <span>{` ${state.sentenceSets[state.currSet]?.sentences[2]}`}</span>
                                    </div>

                                </div>
                            )}
                        </Card>
                        <Container className="tw-flex-row tw-px-0 tw-flex tw-my-2">
                            <label hidden>בחר רישה לשאלה</label>
                            <Form.Select
                                size="sm"
                                onChange={handleSelectHead}
                                className="tw-outline tw-outline-1 tw-w-[40%]"
                                aria-label=".form-select-sm"
                                name="state.questionHead"
                                ref={headRef}
                                value={state.questionHead}

                            >
                                {heads.map((val, i) => (
                                    <option key={i} value={val}>
                                        {val}
                                    </option>
                                ))}
                            </Form.Select>

                            <label hidden>בחר סיפה לשאלה</label>
                            <Form.Select
                                size="sm"
                                onChange={handleSelectTail}
                                className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
                                aria-label=".form-select-sm"
                                name="questionTail"

                                ref={tailRef}
                                value={state.tailIndex}
                            >

                                {tails.map((val, i) => (
                                    <option key={i} value={i}>
                                        {val.tail}
                                    </option>
                                ))}
                            </Form.Select>
                        </Container>
                        {state.questionHead.length === 0 || state.questionTail.length === 0 ? (
                            <></>
                        ) : (
                            <Container className="tw-flex tw-flex-col tw-px-0 tw-pt-4">
                                <div className="tw-flex tw-flex-col">
                                    {(!state.requiresCompletion ? <>
                                        <span className="">השאלה שנוצרה: <b>{`${state.questionHead} ${state.questionTail}`}</b></span>
                                    </> : (
                                        <div className="tw-flex tw-flex-row tw-w-full">
                                            {/*<input*/}
                                            {/*    type="textarea"*/}
                                            {/*    maxLength={64}*/}
                                            {/*    id="state.tailCompletion"*/}
                                            {/*    className="tw-min-w-fit tw-w-auto tw-px-1 tw-mt-2 tw-border-0 tw-underline"*/}
                                            {/*    required*/}
                                            {/*    value={state.tailCompletion}*/}
                                            {/*    onChange={(e) => {*/}
                                            {/*        setTailCompletion(e.target.value);*/}
                                            {/*    }}*/}
                                            {/*    placeholder="המשך\י את השאלה פה"*/}
                                            {/*/>*/}
                                            <FormGroup
                                                className="tw-w-full tw-h-[24px] tw-my-0 tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                                <InputGroup
                                                    className="tw-flex tw-w-full tw-align-top tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">

                                                    <Form.Label
                                                        className="tw-my-0">השאלה
                                                        שנוצרה: <b>{`${state.questionHead} ${state.questionTail.slice(0, -4)}`}</b></Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        className="tw-resize-none tw-py-0 tw-px-2 tw-w-full tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                                        placeholder="השלימו את השאלה פה"
                                                        value={state.tailCompletion}
                                                        ref={tailCompletionRef}

                                                        onChange={(e) => {
                                                            dispatch({ type: 'SET_TAIL_COMPLETION', payload: e.target.value });
                                                        }}
                                                        rows={1}
                                                    />
                                                </InputGroup>
                                            </FormGroup>

                                        </div>

                                    ))}
                                </div>
                                <span className="tw-pt-2">התשובה: <b>{state.boldedVerb}</b></span>
                                <label className="tw-mt-2">
                                    <Form.Check
                                        onChange={() => {
                                            dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 0 });
                                            dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: "" });
                                            dispatch({ type: 'SET_CHECKED', payload: !state.checked });
                                        }}
                                        checked={state.checked}
                                        required
                                        className="tw-opacity-50 tw-ml-1 tw-align-baseline "
                                        type="checkbox"
                                        inline></Form.Check>
                                    התשובה עונה על השאלה
                                </label>
                            </Container>
                        )}
                        <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full">
                            {state.followUp.length === 0 || state.questionHead.length === 0 || !state.checked ? (
                                <></>
                            ) : (
                                <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                                    <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                                    <div className="">
                                        <span className="tw-mt-4">שאלת המשך: </span>
                                        <span className="h6 tw-py-4 tw-font-bold">{state.followUp}</span>
                                    </div>

                                    <FormGroup
                                        className="tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                        <InputGroup
                                            className="tw-flex tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                            <FormLabel className="tw-my-2">התשובה: </FormLabel>
                                            <Form.Control
                                                as="textarea"
                                                className="tw-resize-none tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                                placeholder="סמנו את התשובה בטקסט או הקלידו אותה כאן"
                                                ref={followUpAnswerRef}
                                                value={state.highlightedAnswer}
                                                onChange={handleFollowUpChange}
                                                rows={1}
                                            >

                                            </Form.Control>
                                        </InputGroup>

                                    </FormGroup>
                                    <Container className="tw-px-0">
                                        <Form.Check
                                            onChange={() => {
                                                dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 1 });
                                            }}
                                            checked={state.followUpAnswerChecked === 1}
                                            required
                                            className=""
                                            name="followUpAnswerCheck"
                                            type="radio"
                                            inline
                                            label="התשובה עונה על השאלה"
                                        />

                                        <Form.Check
                                            onChange={() => {
                                                dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 2 });

                                            }}
                                            required
                                            checked={state.followUpAnswerChecked === 2}
                                            className=""
                                            name="followUpAnswerCheck"
                                            type="radio"
                                            inline
                                            label="אין בטקסט תשובה לשאלת ההמשך"
                                        />
                                    </Container>
                                </div>

                            )}

                        </Container>
                        <div className="tw-flex tw-w-full tw-justify-between tw-mt-8">

                            <Button
                                onClick={() => handleSave()}
                                size="sm"
                                disabled={handleDisabledSave()}
                                variant="success"
                                className={state.questionHead.length === 0 || state.questionTail.length === 0 ? "tw-invisible" : "tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg"}>
                                שמור והוסף שאלה
                            </Button>
                            {filteredRows.length === 0 ? <></> :
                                <Button
                                    onClick={() => handleNextSet()}
                                    disabled={!handleDisabledSave() || state.questionHead.length > 0 || state.tailCompletion.length > 0}
                                    size="sm"
                                    variant="primary"
                                    className=" tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg">
                                    {state.currSet < 29 ? "המשך לסט המשפטים הבא" : "סיים"}
                                </Button>}


                        </div>
                    </Container>) :
                    <Container>
                        <h4>{state.currSet}</h4>

                    </Container>

                }


            </Card>
            {filteredRows.length === 0 ? (
                <></>
            ) : (
                <QuestionTable
                    tableRows={filteredRows}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}></QuestionTable>
            )}
            {state.currSet <= 25 ?
                <AttentionCheck
                    currSet={state.currSet}
                    showAlertnessModal={state.showAlertnessModal}
                    handleAttentionCheck={handleAttentionCheck}
                    hideSurvey={hideSurvey}
                /> :
                <></>

            }


        </Container>

    );
}

export default SurveyForm;
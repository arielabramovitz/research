import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {followUps, heads, tails, IMCAttentionCheckQuestions, attentionCheckQuestions} from "./questions.ts";
import {getSentenceSets, ParticipantAnswer, ParticipantAnswers, SentenceSet, uploadParticipantAnswers,} from "./api.ts";
import {
    Alert,
    Button, ButtonGroup,
    Card, Col,
    Container,
    Form,
    FormGroup, FormLabel,
    InputGroup, Modal, Offcanvas, Row,
    Spinner
} from "react-bootstrap";
import QuestionTable from "./questionsTable.tsx";
import {Params, useParams, useSearchParams} from 'react-router-dom';
import {ChevronLeft, ChevronRight} from "react-bootstrap-icons";
import {AttentionCheck} from "./AttentionCheck.tsx";
import {useInitialization} from "../../hooks/useInitialization.ts";

export type TableRow = {
    setNumber: number,
    questionHead: string;
    questionTail: string;
    answer: string;
    followupQuestion: string;
    followupAnswer: string;
    tailCompletion: string;
    tailIndex: number;
};

const ATTENTION_CHECK_INTERVAL = 5;
const MAX_IMC_MISTAKES = 2;
const TOTAL_SETS = 30;
const REQUIRED_CORRECT_COUNT = 6;

const STORAGE_KEYS = {
    IMC_ANSWERS: "IMCAnswers",
    ATTENTION_ANSWERS: "AttentionAnswers",
    IMC_MISTAKES: "IMCMistakeCount",
    ALERTNESS_COUNT: "alertnessCorrectCount",
    SHOW_MODAL: "showAlertnessModal"
} as const;

function SurveyForm({hideSurvey}: { hideSurvey: boolean }) {


    const [params] = useSearchParams();
    const id = params.get('PROLIFIC_ID');
    const sessionId = params.get('SESSION_ID');
    const prolificBaseUrl = "https://app.prolific.com/submissions/complete?cc="
    const rejection = "CBPE50TB"
    const completedWithSixCorrect = "CF0JLBJE"
    const endedWithMistakes = "C1MUDNLY"

    const tailCompletionInd = 9;
    const headRef = useRef<HTMLSelectElement | null>(null);
    const tailRef = useRef<HTMLSelectElement | null>(null);
    const followUpAnswerRef = useRef<HTMLTextAreaElement | null>(null);
    const tailCompletionRef = useRef<HTMLTextAreaElement | null>(null);
    const surveyRef = useRef<HTMLDivElement | null>(null);
    const [sentenceSets, setSentenceSets] = useState<SentenceSet[]>([]);
    const [currSet, setCurrSet] = useState<number>(0);
    const [requiresCompletion, setRequiresCompletion] = useState<boolean>(false);
    const [IMCAnswers, setIMCAnswers] = useState<number[]>([])
    const [attentionAnswers, setAttentionAnswers] = useState<number[]>([])
    const [alertnessCorrectCount, setAlertnessCorrectCount] = useState<number>(0)

    const [IMCMistakeCount, setIMCMistakeCount] = useState<number>(0)
    const [currQuestion, setCurrQuestion] = useState<number>(-1)
    const [tailIndex, setTailIndex] = useState<number>(-1)
    const [showAlertnessModal, setShowAlertnessModal] = useState<boolean>(false)
    const [followUpAnswerChecked, setFollowUpAnswerChecked] = useState<number>(0);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [highlightedAnswer, setHighlightedAnswer] = useState("");
    const [boldedVerb, setBoldedVerb] = useState("");
    const [followUp, setFollowUp] = useState<string>("");
    const [questionHead, setQuestionHead] = useState<string>("");
    const [questionTail, setQuestionTail] = useState<string>("");
    const [checked, setChecked] = useState(false);
    const [tableRows, setTableRows] = useState<TableRow[]>([]);
    const [tailCompletion, setTailCompletion] = useState<string>("");
    const [boldedVerbsInds, setBoldedVerbsInds] = useState<number[]>([]);
    const [doRedirect, setDoRedirect] = useState<boolean>(false)


    const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
        setQuestionHead(event.target.value);
        setChecked(false)
        setFollowUpAnswerChecked(0)
        setHighlightedAnswer("");
        setTailCompletion("")
    };

    const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target) {
            const index = event.target.selectedIndex
            const text = tails[index].tail
            const qType = tails[index].type
            setTailIndex(index)
            setQuestionTail(text);
            setChecked(false)
            setFollowUpAnswerChecked(0)
            setHighlightedAnswer("");
            setTailCompletion("")
            setRequiresCompletion(false);
            if (qType === tailCompletionInd) {
                setRequiresCompletion(true);
            }
            setFollowUp(followUps[qType]);
        }
    };


    const handleRedirect = (code: string) => {
        alert(`redirecting to ${Object.keys({code})[0]}`)
        // window.location.href = prolificBaseUrl + code
    }
    // const handleNextSet = async () => {
    //     handleUpload()
    //     sessionStorage.setItem("currSet", (currSet + 1).toString())
    //     setCurrSet(currSet + 1)
    //     if ((currSet + 2) % 5 === 0) {
    //         sessionStorage.setItem("showAlertnessModal", "true")
    //         setShowAlertnessModal(true)
    //     }
    //     if (currSet === 30) {
    //         if (alertnessCorrectCount === 6) {
    //             handleRedirect(completedWithSixCorrect)
    //         } else {
    //             handleRedirect(endedWithMistakes)
    //         }
    //     }
    //
    // }

    const handleNextSet = async () => {
        // Upload current progress
        await handleUpload();

        const nextSet = currSet + 1;
        sessionStorage.setItem("currSet", nextSet.toString());
        setCurrSet(nextSet);

        // Check if we need to show attention check
        if ((nextSet % ATTENTION_CHECK_INTERVAL === 0) && nextSet < TOTAL_SETS) {
            sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "true");
            setShowAlertnessModal(true);
        }

        // Check if we've reached the end
        if (nextSet === TOTAL_SETS) {
            handleRedirect(
                alertnessCorrectCount === REQUIRED_CORRECT_COUNT
                    ? completedWithSixCorrect
                    : endedWithMistakes
            );
        }
    };


    const handleAttentionCheck = (answer: number) => {
        setShowAlertnessModal(false);
        sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "false");

        const questionNum = Math.floor((currSet + 1) / ATTENTION_CHECK_INTERVAL);
        const isIMCQuestion = questionNum % 2 === 0;
        const currIndex = Math.floor(questionNum / 2);

        const currQuestionSet = isIMCQuestion
            ? IMCAttentionCheckQuestions
            : attentionCheckQuestions;


        if (isIMCQuestion) {
            setIMCAnswers(prevAnswers => {
                const newAnswers = [...prevAnswers, answer];
                sessionStorage.setItem(STORAGE_KEYS.IMC_ANSWERS, JSON.stringify(newAnswers));
                return newAnswers;
            });
        } else {
            setAttentionAnswers(prevAnswers => {
                const newAnswers = [...prevAnswers, answer];
                sessionStorage.setItem(STORAGE_KEYS.ATTENTION_ANSWERS, JSON.stringify(newAnswers));
                return newAnswers;
            });
        }
        // Check if answer is correct
        if (answer === currQuestionSet[currIndex].correctAnswerIndex) {
            const newCount = alertnessCorrectCount + 1;
            setAlertnessCorrectCount(newCount);
            sessionStorage.setItem(STORAGE_KEYS.ALERTNESS_COUNT, newCount.toString());
        } else if (isIMCQuestion) {
            const newIMCMistakes = IMCMistakeCount + 1;
            setIMCMistakeCount(newIMCMistakes);
            sessionStorage.setItem(STORAGE_KEYS.IMC_MISTAKES, newIMCMistakes.toString());

            // Check for immediate rejection
            if (newIMCMistakes >= MAX_IMC_MISTAKES) {
                handleRedirect(rejection);
            }
        }
    };

    const handleTextSelect = (e: React.MouseEvent<HTMLElement>) => {
        const highlighted = window.getSelection()?.toString();
        if (highlighted) {
            setHighlightedAnswer(highlighted);

        } else {
            setHighlightedAnswer("")
        }

    };

    const handleFollowUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        setHighlightedAnswer(e.target.value)
    }


    const handleTailCompletionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.value += "?"
        setTailCompletion(e.target.value)
    }

    const handleEditClick = (i: number) => {
        const row = filteredRows[i]
        const newRows = filteredRows.filter((_: any, j: number) => j !== i);
        const filteredWithoutCurr = tableRows.filter((row: TableRow) => row.setNumber != currSet + 1)
        const updatedRows = [...filteredWithoutCurr, ...newRows]
        setTableRows(updatedRows);
        sessionStorage.setItem("tableRows", JSON.stringify(updatedRows))
        setCurrSet(row.setNumber - 1)
        setQuestionHead(row.questionHead);
        setQuestionTail(row.questionTail || "");
        setBoldedVerb(row.answer);
        setTailIndex(row.tailIndex)
        setTailCompletion(row.tailCompletion)
        setFollowUp(row.followupQuestion);
        setHighlightedAnswer(row.followupAnswer);
        setChecked(true)
        if (row.followupAnswer && row.followupAnswer.length > 0) {
            setFollowUpAnswerChecked(1)
        } else if (row.followupAnswer === "" && row.followupAnswer.length === 0) {
            setFollowUpAnswerChecked(2)
        } else {
            setFollowUpAnswerChecked(0)
        }
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
        const newRows = filteredRows.filter((_: any, j: number) => j !== i);
        const filteredWithoutCurr = tableRows.filter((row: TableRow) => row.setNumber != currSet + 1)
        setTableRows([...filteredWithoutCurr, ...newRows]);
        sessionStorage.setItem("tableRows", JSON.stringify(tableRows))
    };

    const handleUpload = () => {
        if (id && sessionId) {
            const userAnswers: ParticipantAnswers = {
                id: id, sessionId: sessionId,
                IMCAnswers: IMCAnswers,
                AttentionAnswers: attentionAnswers,
                answers: [{
                    sentenceSetId: sentenceSets[currSet].id,
                    first: sentenceSets[currSet].sentences[0],
                    second: sentenceSets[currSet].sentences[1],
                    third: sentenceSets[currSet].sentences[2],
                    verb: boldedVerb,
                    questions: filteredRows.map((row: TableRow) => {
                        return {
                            question: `${row.questionHead} ${row.questionTail} ${row.tailCompletion}`,
                            answer: row.answer,
                            followUp: row.followupQuestion,
                            followUpAnswer: row.followupAnswer || ""
                        }
                    })
                }]
            }


            uploadParticipantAnswers(userAnswers).then(() => {
            })
            return
        }
        alert("PROLIFIC_ID or SESSION_ID wasn't passed")

    }

    const handleSave = () => {
        setTableRows((prevRows: TableRow[]) => {
            const newRows = [
                ...prevRows,
                {
                    setNumber: currSet + 1,
                    questionHead: questionHead,
                    questionTail: !requiresCompletion ? questionTail : (questionTail.slice(0, -4)),
                    tailCompletion: tailCompletion,
                    answer: boldedVerb,
                    followupQuestion: followUp,
                    followupAnswer: highlightedAnswer,
                    tailIndex: tailIndex,
                },
            ];
            sessionStorage.setItem("tableRows", JSON.stringify(newRows))

            return newRows
        });

        setTailCompletion("")
        setFollowUpAnswerChecked(0)
        setChecked(false);
        setQuestionTail("");
        setQuestionHead("");
        setFollowUp("");
        setTailIndex(-1)

        setHighlightedAnswer("");
        // if (headRef.current && tailRef.current) {
        //     headRef.current.value = "";
        //     tailRef.current.value = "";
        //
        // }
        // if (followUpAnswerRef.current) {
        //     followUpAnswerRef.current.value = "";
        // }

    };


    const handleDisabledSave = () => {
        if (requiresCompletion) {
            if (tailCompletion.length === 0) {
                return true;
            }
        }
        if (checked) {
            if (followUp.length === 0 || ((followUpAnswerChecked === 1 && highlightedAnswer.length > 0) || (followUpAnswerChecked === 2 && highlightedAnswer.length === 0))) {
                return false
            }
        }
        return true;
    }

    const handleFinish = () => {

    }

    useEffect(() => {
        if (!hideSurvey && IMCAnswers.length === 0) {
            console.log("TEST")
            setShowAlertnessModal(true);
            sessionStorage.setItem(STORAGE_KEYS.SHOW_MODAL, "true");
        }
    }, [hideSurvey, IMCAnswers]);

    // useEffect(() => {
    //     const load = async () => {
    //         const cachedSets = sessionStorage.getItem('sentenceSets');
    //         const cachedTable = sessionStorage.getItem("tableRows");
    //         const boldedInds = sessionStorage.getItem("boldedInds");
    //         const setInd = sessionStorage.getItem("currSet");
    //         const savedImc = sessionStorage.getItem("IMCAnswers");
    //         const savedAttention = sessionStorage.getItem("AttentionAnswers");
    //         const imcMistakes = sessionStorage.getItem("IMCMistakes");
    //         const savedShowAlertnessModal = sessionStorage.getItem("showAlertnessModal");
    //         const alertnessCorrectCount = sessionStorage.getItem("alertnessCorrectCount");
    //         setIMCAnswers(savedImc ? JSON.parse(savedImc) : [])
    //         setAttentionAnswers(savedAttention ? JSON.parse(savedAttention) : [])
    //         setIMCMistakeCount(imcMistakes ? JSON.parse(imcMistakes) : 0)
    //         setAlertnessCorrectCount(alertnessCorrectCount ? JSON.parse(alertnessCorrectCount) : 0)
    //         setShowAlertnessModal(savedShowAlertnessModal ? JSON.parse(savedShowAlertnessModal) : false)
    //         if (!cachedSets) {
    //             const sets = await getSentenceSets(30);
    //             setSentenceSets(sets);
    //
    //             const inds = sets.map((set: SentenceSet) =>
    //                 Math.floor(Math.random() * set.verbs.length)
    //             );
    //             setBoldedVerbsInds(inds);
    //             setCurrSet(0);
    //             setBoldedVerb(sets[0].verbs[inds[0]]);
    //             sessionStorage.setItem("sentenceSets", JSON.stringify(sets));
    //             sessionStorage.setItem("boldedInds", JSON.stringify(inds));
    //             sessionStorage.setItem("showAlertnessModal", JSON.stringify(true));
    //
    //         } else {
    //             setSentenceSets(JSON.parse(cachedSets))
    //             if (cachedTable) {
    //                 setTableRows(JSON.parse(cachedTable))
    //             }
    //             if (boldedInds) {
    //                 setBoldedVerbsInds(JSON.parse(boldedInds))
    //             }
    //             if (setInd)
    //                 setCurrSet(parseInt(setInd))
    //             if (savedShowAlertnessModal) {
    //                 setShowAlertnessModal(JSON.parse(savedShowAlertnessModal))
    //             }
    //         }
    //
    //
    //     };
    //
    //     load();
    // }, []);

    useInitialization({

        setSentenceSets,
        setCurrSet,
        setIMCAnswers,
        setAttentionAnswers,
        setIMCMistakeCount,
        setAlertnessCorrectCount,
        setShowAlertnessModal,
        setTableRows,
        setBoldedVerbsInds,
        setBoldedVerb

    });

    useEffect(() => {
        console.log('AttentionAnswers updated:', attentionAnswers);
    }, [attentionAnswers]);

    useEffect(() => {
        console.log('IMCAnswers updated:', IMCAnswers);
    }, [IMCAnswers]);

    useEffect(() => {
        if (doRedirect) {
            handleRedirect(alertnessCorrectCount === 6 ? completedWithSixCorrect : endedWithMistakes)
        }
    }, [doRedirect])

    useEffect(() => {
        setBoldedVerb(sentenceSets[currSet]?.verbs[boldedVerbsInds[currSet]])
    }, [currSet, boldedVerbsInds])


    function handleSetChange(isLeft: boolean) {
        if (isLeft) {
            if ((currSet + 1) % 5 === 0) {
                console.log(currSet)
                setShowAlertnessModal(true)
            }
            setCurrSet(currSet + 1)
        } else {
            setCurrSet(currSet - 1)
        }
    }

    const filteredRows = useMemo(() => {
        return tableRows.filter((row: TableRow) => row.setNumber === currSet + 1);
    }, [tableRows, currSet]);

    return (
        <Container fluid className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full tw-pb-8 ">
            <Card dir="rtl" className="bd tw-flex tw-flex-col tw-p-4 tw-w-full tw-h-full">
                {/*<div className="tw-flex tw-flex-col tw-self-end ">*/}
                {/*    <ButtonGroup className="tw-w-32 tw-flex tw-align-middle tw-justify-center">*/}
                {/*        <Button disabled={currSet <= 0} size="sm" className="tw-flex tw-justify-center tw-align-middle"*/}
                {/*                onClick={() => handleSetChange(false)} variant="outline-dark"><ChevronRight*/}
                {/*            className=""/></Button>*/}
                {/*        <div*/}
                {/*            className="tw-px-2 tw-border tw-text-[#00000040]">{`${currSet + 1}/${sentenceSets.length}`}</div>*/}
                {/*        <Button disabled={currSet > 29} className="tw-flex  tw-justify-center"*/}
                {/*                onClick={() => handleSetChange(true)} size="sm"*/}
                {/*                variant="outline-dark"><ChevronLeft/></Button>*/}
                {/*    </ButtonGroup>*/}
                {/*</div>*/}
                {currSet < 30 ? (<Container ref={surveyRef} className="tw-flex tw-flex-col tw-h-full tw-p-1 tw-mb-2">


                        <div className="tw-pb-8">
                            הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות מנוסחות בזמן הווה אך
                            מתייחסות גם לעתיד
                            או עבר.
                        </div>


                        <Card className="bd tw-h-fit tw-min-h-32 tw-p-4 tw-overflow-y-hidden tw-select-text"
                              onMouseUp={handleTextSelect}>

                            {sentenceSets.length === 0 ? (
                                <div className="tw-flex">
                                    <div className="tw-flex tw-items-center tw-justify-center">

                                        <Spinner animation="border"></Spinner>
                                    </div>
                                </div>
                            ) : (
                                <div className="">

                                    <div>
                                        <span>{`${sentenceSets[currSet]?.sentences[0]} `}</span>
                                        <span
                                            className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                                            dangerouslySetInnerHTML={{
                                                __html: sentenceSets[currSet]?.sentences[1].split(" ").map((word: string) => {
                                                    if (word.includes(sentenceSets[currSet]?.verbs[boldedVerbsInds[currSet]])) {
                                                        return `<b>${word}</b>`
                                                    } else return word
                                                }).join(" "),
                                            }}></span>
                                        <span>{` ${sentenceSets[currSet]?.sentences[2]}`}</span>
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
                                name="questionHead"
                                ref={headRef}
                                value={questionHead}

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
                                value={tailIndex}
                            >

                                {tails.map((val, i) => (
                                    <option key={i} value={i}>
                                        {val.tail}
                                    </option>
                                ))}
                            </Form.Select>
                        </Container>
                        {questionHead.length === 0 || questionTail.length === 0 ? (
                            <></>
                        ) : (
                            <Container className="tw-flex tw-flex-col tw-px-0 tw-pt-4">
                                <div className="tw-flex tw-flex-col">
                                    {(!requiresCompletion ? <>
                                        <span className="">השאלה שנוצרה: <b>{`${questionHead} ${questionTail}`}</b></span>
                                    </> : (
                                        <div className="tw-flex tw-flex-row tw-w-full">
                                            {/*<input*/}
                                            {/*    type="textarea"*/}
                                            {/*    maxLength={64}*/}
                                            {/*    id="tailCompletion"*/}
                                            {/*    className="tw-min-w-fit tw-w-auto tw-px-1 tw-mt-2 tw-border-0 tw-underline"*/}
                                            {/*    required*/}
                                            {/*    value={tailCompletion}*/}
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
                                                        שנוצרה: <b>{`${questionHead} ${questionTail.slice(0, -4)}`}</b></Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        className="tw-resize-none tw-py-0 tw-px-2 tw-w-full tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                                        placeholder="השלימו את השאלה פה"
                                                        value={tailCompletion}
                                                        ref={tailCompletionRef}

                                                        onChange={(e) => {
                                                            setTailCompletion(e.target.value)
                                                        }}
                                                        rows={1}
                                                    />
                                                </InputGroup>
                                            </FormGroup>

                                        </div>

                                    ))}
                                </div>
                                <span className="tw-pt-2">התשובה: <b>{boldedVerb}</b></span>
                                <label className="tw-mt-2">
                                    <Form.Check
                                        onChange={() => {
                                            setFollowUpAnswerChecked(0)
                                            setChecked(!checked);
                                        }}
                                        checked={checked}
                                        required
                                        className="tw-opacity-50 tw-ml-1 tw-align-baseline "
                                        type="checkbox"
                                        inline></Form.Check>
                                    התשובה עונה על השאלה
                                </label>
                            </Container>
                        )}
                        <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full">
                            {followUp.length === 0 || questionHead.length === 0 || !checked ? (
                                <></>
                            ) : (
                                <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                                    <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                                    <div className="">
                                        <span className="tw-mt-4">שאלת המשך: </span>
                                        <span className="h6 tw-py-4 tw-font-bold">{followUp}</span>
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
                                                value={highlightedAnswer}
                                                onChange={handleFollowUpChange}
                                                rows={1}
                                            >

                                            </Form.Control>
                                        </InputGroup>

                                    </FormGroup>
                                    <Container className="tw-px-0">
                                        <Form.Check
                                            onChange={() => {
                                                setFollowUpAnswerChecked(1)
                                            }}
                                            checked={followUpAnswerChecked === 1}
                                            required
                                            className=""
                                            name="followUpAnswerCheck"
                                            type="radio"
                                            inline
                                            label="התשובה עונה על השאלה"
                                        />

                                        <Form.Check
                                            onChange={() => {
                                                setFollowUpAnswerChecked(2)
                                            }}
                                            required
                                            checked={followUpAnswerChecked === 2}
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
                                className={questionHead.length === 0 || questionTail.length === 0 ? "tw-invisible" : "tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg"}>
                                שמור והוסף שאלה
                            </Button>
                            {filteredRows.length === 0 ? <></> :
                                <Button
                                    onClick={() => handleNextSet()}
                                    disabled={!handleDisabledSave() || questionHead.length > 0 || tailCompletion.length > 0}
                                    size="sm"
                                    variant="primary"
                                    className=" tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg">
                                    {currSet < 29 ? "המשך לסט המשפטים הבא" : "סיים"}
                                </Button>}


                        </div>
                    </Container>) :
                    <Container>
                        <h4>{currSet}</h4>

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
            {currSet <= 25 ?
                <AttentionCheck
                    currSet={currSet}
                    showAlertnessModal={showAlertnessModal}
                    handleAttentionCheck={handleAttentionCheck}
                /> :
                <></>

            }


        </Container>

    );
}

export default SurveyForm;
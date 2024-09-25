import React, {ChangeEvent, useEffect, useMemo, useRef, useState} from "react";
import {followUps, heads, tails} from "./questions.ts";
import {getSentenceSets, ParticipantAnswer, ParticipantAnswers, SentenceSet, uploadParticipantAnswers,} from "./api.ts";
import {
    Alert,
    Button, ButtonGroup,
    Card,
    Container,
    Form,
    FormGroup, FormLabel,
    InputGroup, Modal,
    Spinner
} from "react-bootstrap";
import QuestionTable from "./questionsTable.tsx";
import {Params, useParams, useSearchParams} from 'react-router-dom';
import {ChevronLeft, ChevronRight} from "react-bootstrap-icons";

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

function SurveyForm() {
    const [params] = useSearchParams();
    const id = params.get('PROLIFIC_ID');
    const sessionId = params.get('SESSION_ID');


    const tailCompletionInd = 9;
    const headRef = useRef<HTMLSelectElement | null>(null);
    const tailRef = useRef<HTMLSelectElement | null>(null);
    const followUpAnswerRef = useRef<HTMLTextAreaElement | null>(null);
    const tailCompletionRef = useRef<HTMLTextAreaElement | null>(null);

    const [sentenceSets, setSentenceSets] = useState<SentenceSet[]>([]);
    const [currSet, setCurrSet] = useState<number>(0);
    const [requiresCompletion, setRequiresCompletion] = useState<boolean>(false);

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
    const [showFinishModal, setShowFinishModal] = useState<boolean>(false)

    const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
        setQuestionHead(event.target.value);
    };

    const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target) {
            const index = event.target.selectedIndex
            const text = tails[index].tail
            const qType = tails[index].type
            setTailIndex(index)
            setQuestionTail(text);
            setRequiresCompletion(false);
            if (qType === tailCompletionInd) {
                setRequiresCompletion(true);
            }
            setFollowUp(followUps[qType]);
        }
    };

    const handleNextSet = async () => {
        handleSave()
        if (currSet === 29) {
            handleFinish()
        }
        sessionStorage.setItem("currSet", (currSet + 1).toString())
        setCurrSet(currSet + 1)
    }

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
        setQuestionTail(row.questionTail||"");
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

    const handleFinish = () => {
        if (id && sessionId) {
            const userAnswers: ParticipantAnswers = {id: id, sessionId: sessionId, answers: []}

            for (const row of tableRows) {
                userAnswers.answers[row.setNumber - 1] = {
                    sentenceSetId: sentenceSets[row.setNumber - 1].id,
                    first: sentenceSets[row.setNumber - 1].sentences[0],
                    second: sentenceSets[row.setNumber - 1].sentences[0],
                    third: sentenceSets[row.setNumber - 1].sentences[0],
                    verb: boldedVerb,
                    questions: [
                        ...userAnswers.answers[row.setNumber - 1]?.questions || [],
                        {
                            question: `${row.questionHead} ${row.questionTail} ${row.tailCompletion}`,
                            answer: row.answer,
                            followUp: row.followupQuestion,
                            followUpAnswer: row.followupAnswer || ""
                        }
                    ]
                }
            }
            userAnswers.answers = userAnswers.answers.filter(item => item !== undefined)
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
            console.log(newRows)

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


    // useEffect(() => {
    //     setBoldedVerb(sentenceSets[currSet]?.verbs[boldedVerbsInds[currSet]])
    //     setCurrentMiddle(sentenceSets[currSet].sentences[1].replace(boldedVerb,`${boldedVerb}`))
    // }, [currSet, boldedVerbsInds,sentenceSets])

    // useEffect(() => {
    // }, [boldedVerb])

    // useEffect(() => {
    //     const test = async ()=>{
    //         const retrieve = async () => {
    //             const ret = getSentenceSets(30).then(async (ret: SentenceSet[]) => {
    //                 await load(ret)
    //                 sessionStorage.setItem("sentenceSets", JSON.stringify(ret))
    //                 return ret
    //             })
    //         }
    //         const load = async (sentenceSets: SentenceSet[]) => {
    //             setSentenceSets(sentenceSets)
    //             setCurrSet(0)
    //             const inds = sentenceSets.map((set: SentenceSet) => Math.floor(Math.random() * set.verbs.length));
    //             setBoldedVerbsInds(inds)
    //             sessionStorage.setItem("boldedInds", JSON.stringify(inds))
    //             if (sentenceSets.length>0) {
    //
    //                 setBoldedVerb(sentenceSets[currSet].verbs[boldedVerbsInds[currSet]])
    //             }
    //         }
    //         const cachedSets = sessionStorage.getItem('sentenceSets');
    //         const cachedTable = sessionStorage.getItem("tableRows");
    //         const boldedInds = sessionStorage.getItem("boldedInds");
    //
    //         if (cachedSets) {
    //             await load(JSON.parse(cachedSets))
    //             if (cachedTable) {
    //                 setTableRows(JSON.parse(cachedTable))
    //             }
    //             if (boldedInds) {
    //                 setBoldedVerbsInds(JSON.parse(boldedInds))
    //             }
    //         } else {
    //             await retrieve();
    //         }
    //     }
    //     test()
    //
    // }, []);

    useEffect(() => {
        const load = async () => {
            const cachedSets = sessionStorage.getItem('sentenceSets');
            const cachedTable = sessionStorage.getItem("tableRows");
            const boldedInds = sessionStorage.getItem("boldedInds");
            const setInd = sessionStorage.getItem("currSet");

            if (!cachedSets) {
                const sets = await getSentenceSets(30);
                setSentenceSets(sets);

                const inds = sets.map((set: SentenceSet) =>
                    Math.floor(Math.random() * set.verbs.length)
                );
                setBoldedVerbsInds(inds);
                setCurrSet(0);
                setBoldedVerb(sets[0].verbs[inds[0]]);

                sessionStorage.setItem("sentenceSets", JSON.stringify(sets));
                sessionStorage.setItem("boldedInds", JSON.stringify(inds));
            } else {
                setSentenceSets(JSON.parse(cachedSets))
                if (cachedTable) {
                    setTableRows(JSON.parse(cachedTable))
                }
                if (boldedInds) {
                    setBoldedVerbsInds(JSON.parse(boldedInds))
                }
                if (setInd)
                    setCurrSet(parseInt(setInd))
            }
        };

        load();
    }, []);

    useEffect(() => {
        setBoldedVerb(sentenceSets[currSet]?.verbs[boldedVerbsInds[currSet]])
    }, [currSet, boldedVerbsInds])

    function handleSetChange(isLeft: boolean) {
        if (isLeft) {
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
                <Container className="tw-flex tw-flex-col tw-h-full tw-p-1 tw-mb-2">


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
                                    <span>{`${sentenceSets[currSet].sentences[0]} `}</span>
                                    <span
                                        className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                                        dangerouslySetInnerHTML={{
                                            __html: sentenceSets[currSet].sentences[1].split(" ").map((word: string) => {
                                                if (word.includes(sentenceSets[currSet].verbs[boldedVerbsInds[currSet]])) {
                                                    return `<b>${word}</b>`
                                                } else return word
                                            }).join(" "),
                                        }}></span>
                                    <span>{` ${sentenceSets[currSet].sentences[2]}`}</span>
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
                                                    className="tw-my-0">השאלה שנוצרה: <b>{`${questionHead} ${questionTail.slice(0, -4)}`}</b></Form.Label>
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
                    {questionHead.length === 0 || questionTail.length === 0 ? <></> :
                        <div className="tw-flex tw-w-full tw-justify-between tw-mt-8">
                            <Button
                                onClick={() => handleSave()}
                                size="sm"
                                disabled={handleDisabledSave()}
                                variant="success"
                                className="tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg">
                                שמור והוסף שאלה
                            </Button>
                            <Button
                                onClick={() => handleNextSet()}
                                size="sm"
                                disabled={handleDisabledSave()}
                                variant="primary"
                                className=" tw-w-fit tw-ml-2 tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg">
                                {currSet < 29 ? "שמור והמשך לסט המשפטים הבא" : "סיים"}
                            </Button>
                        </div>

                    }
                </Container>

            </Card>
            {filteredRows.length === 0 ? (
                <></>
            ) : (
                <QuestionTable
                    tableRows={filteredRows}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}></QuestionTable>
            )}

            <Modal
                show={showFinishModal}
                backdrop="static"
            >
                <Modal.Dialog>

                    <Modal.Body>
                        <div className="tw-flex tw-align-middle tw-justify-center">
                            <div>מיד תועבר/י חזרה לפרוליפיק</div>
                            <Spinner/>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleFinish}>הגש</Button>
                        <Button onClick={() => {
                            setShowFinishModal(false)
                        }}>בטל</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
            {
                currSet === 0 || currSet % 5 !== 0 ? <></> :
                    <Modal
                        show={showFinishModal}
                        centered={true}
                        backdrop="static"
                        onExit={() => {
                            setShowAlertnessModal(false)
                        }}

                    >
                        <Modal.Dialog>
                            <Modal.Header>

                            </Modal.Header>
                            <Modal.Body>
                                {}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={() => {
                                }}>אישור</Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal>
            }

        </Container>

    );
}

export default SurveyForm;
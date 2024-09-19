import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {followUps, heads, tails} from "./questions.ts";
import {getSentenceSets, ParticipantAnswer, ParticipantAnswers, SentenceSet, uploadParticipantAnswers,} from "./api.ts";
import {
    Alert,
    Button,
    Card,
    Container,
    Form,
    FormGroup, FormLabel,
    InputGroup, Modal,
    Spinner
} from "react-bootstrap";
import QuestionTable from "./questionsTable.tsx";
import {useParams} from 'react-router-dom';

export type TableRow = {
    setNumber: number,
    questionHead: string;
    questionTail: string;
    answer: string;
    followupQuestion: string;
    followupAnswer?: string;
};

function SurveyForm() {
    const params = useParams()
    let id = null
    if (params.id) {
        id = params.id
    }

    const tailCompletionInd = 9;
    const headRef = useRef<HTMLSelectElement | null>(null);
    const tailRef = useRef<HTMLSelectElement | null>(null);
    const followUpAnswerRef = useRef<HTMLTextAreaElement | null>(null);
    const tailCompletionRef = useRef<HTMLTextAreaElement | null>(null);

    const [sentenceSets, setSentenceSets] = useState<SentenceSet[]>([]);
    const [currSet, setCurrSet] = useState<number>(-1);
    const [requiresCompletion, setRequiresCompletion] = useState<boolean>(false);

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
            const index: number = event.target.selectedIndex;
            const text: string = event.target[index].textContent || "";
            const qType = Number.parseInt(event.target.value);
            setQuestionTail(text);
            setRequiresCompletion(false);
            if (qType === tailCompletionInd) {
                setRequiresCompletion(true);
            }
            setFollowUp(followUps[qType]);
        }
    };

    const handleNextSet = async ()=>{
        if (currSet >= sentenceSets.length-1) {
            await getSentenceSets(1).then((ret:SentenceSet[])=>{
                setSentenceSets((prevState: SentenceSet[])=>{
                    return [...prevState, ...ret]
                })
            })
        }
        setCurrSet(currSet+1)

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

    const handleTailCompletionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        e.target.value += "?"
        setTailCompletion(e.target.value)
    }

    const handleEditClick = (i: number) => {
        const row = tableRows[i]
        const newRows = tableRows.filter((_: any, j: number) => j !== i);
        localStorage.setItem("tableRows", JSON.stringify(newRows))
        setTableRows(newRows);
        setCurrSet(row.setNumber)
        setQuestionTail(row.questionTail);
        setQuestionHead(row.questionHead);
        setBoldedVerb(row.answer);
        setFollowUp(row.followupQuestion);
        setHighlightedAnswer(row.followupAnswer || "");
    };

    const handleDeleteClick = (i: number) => {
        const newRows = tableRows.filter((_: any, j: number) => j !== i);
        localStorage.setItem("tableRows", JSON.stringify(newRows))
        setTableRows(newRows)
    };

    const handleFinishClick = () => {
        if (id) {
            const userAnswers: ParticipantAnswers = {id: id, answers: []}

            for (const row of tableRows) {
                userAnswers.answers[row.setNumber - 1] = {
                    sentenceSetId: sentenceSets[row.setNumber - 1].id,
                    sentences: sentenceSets[row.setNumber - 1].sentences,
                    questions: [
                        ...userAnswers.answers[row.setNumber - 1]?.questions || [],
                        {
                            question: `${row.questionHead} ${row.questionTail}`,
                            answer: row.answer,
                            followUp: row.followupQuestion,
                            followUpAnswer: row.followupAnswer || ""
                        }
                    ]
                }
            }
            userAnswers.answers = userAnswers.answers.filter(item => item !== undefined)
            uploadParticipantAnswers(userAnswers).then(()=>{})
            return
        }
        alert("Id wasn't passed")

    }

    const handleSaveClick = () => {
        if (checked && ((followUp.length > 0 && highlightedAnswer.length !== 0) || followUp.length === 0)) {
            setTableRows((prevRows: TableRow[]) => {
                const newRows = [
                    ...prevRows,
                    {
                        setNumber: currSet + 1,
                        questionHead: questionHead,
                        questionTail: questionTail,
                        answer: boldedVerb,
                        followupQuestion: followUp,
                        followupAnswer: highlightedAnswer,
                    },
                ];
                localStorage.setItem("tableRows", JSON.stringify(newRows))

                return newRows
            });
            setFollowUpAnswerChecked(0)
            setChecked(false);
            setQuestionTail("");
            setQuestionHead("");
            setFollowUp("");
            setHighlightedAnswer("");
            if (headRef.current && tailRef.current && followUpAnswerRef.current) {
                headRef.current.value = "";
                tailRef.current.value = "";
            }
        } else {
            setShowAlert(true);
            window.setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }
    };

    const setVerb = () => {
      if (sentenceSets[currSet]) {
        if (sentenceSets[currSet].verbs.length > 0) {
          const ind: number = Math.floor(Math.random() * sentenceSets[currSet].verbs.length)
          const verb = sentenceSets[currSet].verbs[ind];
          const boldedVerb = `<b>${verb}</b>`; // Create a bolded version of the verb

          // Create a new array of sentences with the bolded verb
          const newSentences = sentenceSets[currSet].sentences.map((sentence, index) => {
            if (index === 1) {
              return sentence.replace(verb, boldedVerb);
            }
            return sentence;
          });

          // Update the sentenceSets array with the new sentences
          const newSentenceSets = [...sentenceSets];
          newSentenceSets[currSet].sentences = newSentences;
          setSentenceSets(newSentenceSets);
        }
      }
    }

    const handleSetChange = (isRight: boolean) => {
        let newInd = (currSet + 1) % (sentenceSets.length)
        if (isRight) {
            newInd = (currSet + sentenceSets.length - 1) % (sentenceSets.length)
        }
        setCurrSet(newInd)
        setVerb()
    }


    useEffect(() => {
        setBoldedVerb(sentenceSets[currSet]?.verbs[Math.floor(Math.random() * sentenceSets[currSet].verbs.length)])
    }, [currSet])

    useEffect(() => {
        const retrieve = async () => {
            const ret = getSentenceSets(3).then((ret: SentenceSet[]) => {
                load(ret)
                localStorage.setItem("sentenceSets", JSON.stringify(ret))
                return ret
            })
        }
        const load = (sentenceSets: SentenceSet[]) => {
            setSentenceSets(sentenceSets)
            setCurrSet(0)
            setVerb()
        }

        const cachedSets = localStorage.getItem('sentenceSets');
        const cachedTable = localStorage.getItem("tableRows")
        if (cachedSets) {
            load(JSON.parse(cachedSets))
            if (cachedTable) {
                setTableRows(JSON.parse(cachedTable))
            }
        } else {
            retrieve();
        }
    }, []);

    return (
        <Container fluid className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full tw-pb-8">
            <Card dir="rtl" className="bd tw-flex tw-flex-col tw-p-4 tw-w-full tw-h-full">
                {/*<div className="tw-flex tw-flex-col tw-self-end ">*/}
                {/*    <ButtonGroup className="tw-w-32 tw-flex tw-align-middle tw-justify-center">*/}
                {/*        <Button size="sm" className="tw-flex tw-justify-center tw-align-middle"*/}
                {/*                onClick={() => handleSetChange(false)} variant="outline-dark"><ChevronRight*/}
                {/*            className=""/></Button>*/}
                {/*        <div*/}
                {/*            className="tw-px-2 tw-border tw-text-[#00000040]">{`${currSet + 1}/${sentenceSets.length}`}</div>*/}
                {/*        <Button className="tw-flex  tw-justify-center" onClick={() => handleSetChange(true)} size="sm"*/}
                {/*                variant="outline-dark"><ChevronLeft/></Button>*/}
                {/*    </ButtonGroup>*/}
                {/*</div>*/}
                <Container className="tw-flex tw-flex-col tw-h-full tw-p-1 tw-mb-2">


                    <div className="tw-pb-8">
                        הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות מנוסחות בזמן הווה אך
                        מתייחסות גם לעתיד
                        או עבר.
                    </div>


                    <Card className="bd tw-h-32 tw-p-4 tw-overflow-y-auto tw-select-text" onMouseUp={handleTextSelect}>

                        {sentenceSets.length === 0 ? (
                            <div className="tw-flex tw-items-center tw-justify-center">

                                <Spinner animation="border"></Spinner>
                            </div>
                        ) : (
                            <div className="">

                                <div>
                                    <span>{`${sentenceSets[currSet].sentences[0]} `}</span>
                                    <span
                                        className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                                        dangerouslySetInnerHTML={{
                                            __html: sentenceSets[currSet].sentences[1].replace(boldedVerb, `<b>${boldedVerb}</b>`),
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
                            ref={headRef}>
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
                            name="questionTail"
                            ref={tailRef}>
                            {tails.map((val, i) => (
                                <option key={i} value={val.type}>
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
                                <span className="">השאלה שנוצרה: <b>{`${questionHead} ${requiresCompletion?questionTail.slice(0,-3):questionTail}`}</b></span>
                                {(!requiresCompletion ? <></> : (
                                    <div className="tw-flex tw-flex-row tw-w-64">
                                        &nbsp;
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
                                        <Form.Control
                                            as="textarea"
                                            className="tw-mr-1 tw-resize-none tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                            placeholder="השלימו את השאלה פה"
                                            value={tailCompletion}
                                            ref={tailCompletionRef}

                                            onChange={(e)=>{setTailCompletion(e.target.value)}}
                                            rows={1}
                                        />

                                    </div>

                                ))}
                            </div>
                            <span className="tw-pt-2">התשובה: <b>{boldedVerb}</b></span>
                            <label className="tw-mt-2">
                                <Form.Check
                                    onClick={() => {
                                        setChecked(!checked);
                                    }}
                                    required
                                    className="tw-opacity-50 tw-ml-1 tw-align-baseline "
                                    type="checkbox"
                                    inline></Form.Check>
                                התשובה עונה על השאלה
                            </label>
                        </Container>
                    )}
                    <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full">
                        {followUp.length === 0 || questionHead.length === 0 ? (
                            <></>
                        ) : (
                            <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                                <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                                <div className="">
                                    <span className="tw-mt-4">שאלת המשך: </span>
                                    <span className="h6 tw-py-4 tw-font-bold">{followUp}</span>
                                </div>

                                <FormGroup className="tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
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
                                        onClick={() => {setFollowUpAnswerChecked(1)}}
                                        required
                                        className=""
                                        name="followUpAnswerCheck"
                                        type="radio"
                                        inline
                                        label="התשובה עונה על השאלה"
                                    />

                                    <Form.Check
                                        onClick={() => {setFollowUpAnswerChecked(2)}}
                                        required
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
                        <div className="tw-flex tw-w-full tw-justify-between">
                            <Button
                                onClick={() => handleSaveClick()}
                                size="sm"
                                disabled={!checked && followUpAnswerChecked>0}
                                variant="outline-secondary"
                                className="tw-w-fit  tw-ml-2">
                                שמור והוסף שאלה
                            </Button>
                            <Button
                                onClick={() => handleNextSet()}
                                size="sm"
                                disabled={!checked}
                                variant="outline-primary"
                                className=" tw-w-fit tw-ml-2">
                                שמור והמשך לסט המשפטים הבא
                            </Button>
                        </div>

                    }
                </Container>

            </Card>
            {tableRows.length === 0 ? (
                <></>
            ) : (
                <QuestionTable
                    tableRows={tableRows}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}></QuestionTable>
            )}
            <div className="tw-flex tw-flex-row tw-justify-end tw-pb-8">
                {tableRows.length === 0 ? <></> :
                    <Button onClick={handleFinishClick} size="sm" variant="outline-danger" className=" tw-w-16 tw-mt-4">
                        סיים
                    </Button>
                }
            </div>
            {!showAlert ? (
                <></>
            ) : (
                <Alert
                    className="tw-fixed tw-transform tw-translate-x-1/2 tw-right-1/2 tw-top-0 tw-z-1050 tw-w-fit"
                    dismissible
                    variant="danger"
                    onClose={() => {
                        setShowAlert(false);
                    }}>
                    נא לוודא שהתשובה עונה על השאלה ושענית על שאלת ההמשך
                </Alert>
            )}
            <Modal
                show={showFinishModal}
                onExit={()=>{setShowFinishModal(false)}}
            >
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <h4>האם את\ה בטוח\ה שסיימת?</h4>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button onClick={handleFinishClick}>הגש</Button>
                        <Button onClick={()=>{setShowFinishModal(false)}}>בטל</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>

        </Container>

    );
}

export default SurveyForm;
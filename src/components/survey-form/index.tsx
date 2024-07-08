import React, {ChangeEvent, useEffect, useRef, useState,} from "react";
import {heads, tails, followUps} from "./questions.ts";
import {getSentence} from "./mockSentences.ts";
import {Alert, Button, Card, Container, Form} from "react-bootstrap";
import QuestionTable from "./questionsTable.tsx";

export type TableRow = {
    questionHead: string;
    questionTail: string;
    answer: string;
    followupQuestion: string;
    followupAnswer?: string;
};

function SurveyForm() {
    const [firstSentenceInSet, setFirstSentenceInSet] = useState<string>("");
    const [secondSentenceInSet, setSecondSentenceInSet] = useState<string>("");
    const [thirdSentenceInSet, setThirdSentenceInSet] = useState<string>("");

    const headRef = useRef<HTMLSelectElement | null>(null);
    const tailRef = useRef<HTMLSelectElement | null>(null);
    const followUpAnswerRef = useRef<HTMLInputElement | null>(null);

    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [highlightedAnswer, setHighlightedAnswer] = useState("");
    const [boldedVerb, setBoldedVerb] = useState("");
    const [followUp, setFollowUp] = useState<string>("");
    const [questionHead, setQuestionHead] = useState<string>("");
    const [questionTail, setQuestionTail] = useState<string>("");
    const [checked, setChecked] = useState(false);
    const [tableRows, setTableRows] = useState<TableRow[]>([]);

    const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
        setQuestionHead(event.target.value);
    };

    const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target) {
            const index: number = event.target.selectedIndex;
            const text: string = event.target[index].textContent || "";
            const qType = Number.parseInt(event.target.value);
            setQuestionTail(text);
            setFollowUp(followUps[qType]);
        }
    };

    const handleTextSelect = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        const highlighted = window.getSelection()?.toString();
        setHighlightedAnswer(highlighted || "");
    };

    const handleEditClick = (i: number) => {
        const row = tableRows.splice(i, 1)[0]
        setQuestionTail(row.questionTail)
        setQuestionHead(row.questionHead)
        setBoldedVerb(row.answer)
        setFollowUp(row.followupQuestion)
        setHighlightedAnswer(row.followupAnswer || "")
        setTableRows(tableRows)

    }

    const handleDeleteClick = (i: number) => {
        setTableRows((prevRows: TableRow[]) => {
            const newRows = prevRows.splice(i, 1)
            return newRows;
        })
    }

    const handleSaveClick = () => {
        if (checked && (followUp.length>0&&highlightedAnswer.length>0 || followUp.length===0)) {

            setTableRows((prevRows: TableRow[]) => {
                return [...prevRows, {
                    questionHead: questionHead,
                    questionTail: questionTail,
                    answer: boldedVerb,
                    followupQuestion: followUp,
                    followupAnswer: highlightedAnswer
                }];

            });
            setChecked(false)
            setQuestionTail("")
            setQuestionHead("")
            setFollowUp("")
            setHighlightedAnswer("")
            if (headRef.current && tailRef.current && followUpAnswerRef.current) {

                headRef.current.value=""
                tailRef.current.value=""
                followUpAnswerRef.current.value=""
            }
        } else {
            setShowAlert(true);
            window.setTimeout(() => {
                setShowAlert(false);
            }, 3000)
        }
    }

    useEffect(() => {
        const retrieve = async () => {
            const data = (await getSentence().next()).value;
            const first = data?.first;
            const second = data?.second;
            const third = data?.third;
            const verbs = data?.verbs;
            if (first && second && third && verbs) {
                const verbInd = Math.floor(Math.random() * verbs.length);
                const secondBold = second?.replace(
                    verbs[verbInd],
                    `<b>${verbs[verbInd]}</b>`
                );
                setBoldedVerb(verbs[verbInd]);
                setFirstSentenceInSet(first);
                setSecondSentenceInSet(secondBold);
                setThirdSentenceInSet(third);
            }
        };
        retrieve();
    }, []);

    return (
        <Container className="tw-select-none tw-h-full">
            <Card
                dir="rtl"
                className="bd tw-p-4 tw-w-full tw-h-full tw-overflow-y-auto"
            >
                <Container className="tw-p-1 tw-mb-2">
          <span className="">
            הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות
            מנוסחות בזמן הווה אך מתייחסות גם לעתיד או עבר.
          </span>

                    <Card
                        className="bd tw-h-32 tw-p-4 tw-overflow-y-auto tw-select-text"
                        onMouseUp={handleTextSelect}>
                        {!firstSentenceInSet ||
                        !secondSentenceInSet ||
                        !thirdSentenceInSet ? (
                            <></>
                        ) : (
                            <div>
                                <span>{`${firstSentenceInSet} `}</span>
                                <span
                                    className="tw-bg-asparagus-700 tw-bg-opacity-30"
                                    dangerouslySetInnerHTML={{__html: secondSentenceInSet}}
                                ></span>
                                <span>{` ${thirdSentenceInSet}`}</span>
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
                            name="questionTail"
                            ref={tailRef}
                        >
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
                            <span className="">השאלה שנוצרה: <b>{questionHead + " " + questionTail}</b></span>
                            <span className="tw-pt-2">התשובה: <b>{boldedVerb}</b></span>
                            <label className="tw-mt-2">

                                <Form.Check
                                    onClick={() => {
                                        setChecked(!checked)
                                    }}
                                    required
                                    className="tw-opacity-50 tw-ml-1 tw-align-baseline "
                                    type="checkbox"
                                    inline
                                ></Form.Check>
                                התשובה עונה על השאלה
                            </label>

                        </Container>
                    )}
                    <div className="">
                        {followUp.length === 0 || questionHead.length === 0 ? (
                            <></>
                        ) : (
                            <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-w-full">
                                <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                                <p className="tw-mt-4">שאלת המשך:</p>
                                <div className="h6 tw-py-4 tw-font-bold">
                                    {followUp}
                                </div>
                                <input
                                    type="text"
                                    maxLength={196}
                                    className="form-input form-input-small tw-outline tw-outline-1 tw-min-w-100 tw-px-1 tw-w-[50%] tw-ml-2 tw-mt-2"
                                    required
                                    ref={followUpAnswerRef}
                                    value={highlightedAnswer}
                                    onChange={(e) => {
                                        setHighlightedAnswer(e.target.value);
                                    }}
                                    placeholder="סמן את התשובה בטקסט או הקלד אותה כאן"
                                />
                                <div className="tw-flex tw-flex-row tw-justify-between">

                                    <Button onClick={() => handleSaveClick()} size="sm" variant="outline-secondary"
                                            className="tw-justify-start tw-w-16 tw-mt-4 tw-ml-2">שמור</Button>
                                    <Button size="sm" variant="outline-secondary"
                                            className=" tw-w-16 tw-mt-4">סיים</Button>
                                </div>
                            </div>
                        )}

                    </div>
                </Container>
            </Card>
            {tableRows.length === 0 ? <></> : (
                <QuestionTable tableRows={tableRows}
                               handleEditClick={handleEditClick}
                               handleDeleteClick={handleDeleteClick}>
                </QuestionTable>
            )}
            {!showAlert ? <></> :
                <Alert className="tw-fixed tw-transform tw-translate-x-1/2 tw-right-1/2 tw-top-0 tw-z-1050 tw-w-fit"
                       dismissible variant="danger" onClose={() => {
                    setShowAlert(false)
                }}>
                    אנא ודא\י שהתשובה עונה על השאלה ושענית על שאלת ההמשך
                </Alert>}
        </Container>
    );
}

export default SurveyForm;

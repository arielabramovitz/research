import React, {useState} from "react";
import {exampleSentences} from "./mockSentences";
import {
    Container,
    Card,
    Collapse,
    Button,
    Form,
    FormGroup,
    InputGroup,
    FormLabel,
    Alert, Modal
} from "react-bootstrap";
import {heads, tails} from "../survey-form/questions.ts";
import QuestionTable from "../survey-form/questionsTable.tsx";

function ExamplesTab() {
    const numOfExamples = exampleSentences.length;
    const [expend, setExpend] = useState(false);
    const [chosen, setChosen] = useState(-1);

    const generateExamples = () =>
        exampleSentences.map((sentenceSet, i) => (
            <Container fluid className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full tw-pb-8"
                       hidden={chosen !== i} key={i}>
                <Card dir="rtl" className="bd tw-flex tw-flex-col tw-p-4 tw-w-full tw-h-full">

                    <Container key={i} className="tw-flex tw-flex-col tw-w-full tw-h-full tw-p-1 tw-mb-2">
                        <span className=" tw-font-bold tw-text-[#006D77]">{sentenceSet.preText}</span>
                        <div className="tw-pb-8">
                            הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות מנוסחות בזמן הווה אך
                            מתייחסות גם לעתיד
                            או עבר.
                        </div>
                        <Card className="bd tw-h-32 tw-p-4 tw-overflow-y-auto tw-select-text">
                            <div className="">
                                <div>
                                    <span>{`${sentenceSet.first} `}</span>
                                    <span
                                        className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                                        dangerouslySetInnerHTML={{
                                            __html: sentenceSet.second.replace(sentenceSet.verb, `<b>${sentenceSet.verb}</b>`),
                                        }}></span>
                                    <span>{` ${sentenceSet.third}`}</span>
                                </div>

                            </div>
                        </Card>
                        {sentenceSet.head.map((head: string, ind: number) =>
                            (
                                <div key={ind} className="tw-flex tw-flex-col">
                                    <Container className="tw-flex-row tw-px-0 tw-flex tw-my-2">
                                        <Form.Select
                                            size="sm"
                                            className="tw-outline tw-outline-1 tw-w-[40%]"
                                            value={head}
                                            disabled
                                        >
                                            <option value={head}>
                                                {head}
                                            </option>
                                        </Form.Select>

                                        <Form.Select
                                            size="sm"
                                            className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
                                            disabled
                                            value={sentenceSet.tail[ind]}>
                                            <option value={sentenceSet.tail[ind]}>
                                                {sentenceSet.tail[ind]}
                                            </option>
                                        </Form.Select>
                                    </Container>
                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.postText}</span>

                                    <span className="tw-underline tw-font-bold">שלב ראשון:</span>

                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.prePartOne[ind]}</span>
                                    <div className="tw-flex tw-flex-col tw-px-0">

                                        <div className="tw-flex tw-w-full">

                                            {(!sentenceSet.requiresCompletion[ind] ? <>
                                                <span className="">השאלה שנוצרה: <b>{`${head} ${sentenceSet.requiresCompletion[ind]?sentenceSet.tail[ind].slice(0,-3):sentenceSet.tail[ind]}`}</b></span>

                                            </> : (

                                                <FormGroup className="tw-w-full tw-my-0 tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                                    <InputGroup
                                                        className="tw-flex tw-w-full tw-align-top tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                                        <Form.Label className="tw-my-0">השאלה שנוצרה: <b>{`${head} ${sentenceSet.requiresCompletion[ind]?sentenceSet.tail[ind].slice(0,-3):sentenceSet.tail[ind]}`}</b>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            className="tw-resize-none tw-py-0 tw-px-2 tw-w-full tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                                            placeholder="השלימו את השאלה פה"
                                                            rows={1}
                                                            size="sm"
                                                            value={sentenceSet.completion===undefined ? "" : sentenceSet.completion[ind]}
                                                        >

                                                        </Form.Control>
                                                    </InputGroup>

                                                </FormGroup>



                                            ))}
                                        </div>
                                        <span className="tw-pt-2">התשובה: <b>{sentenceSet.verb}</b></span>
                                        <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.postPartOne[ind]}</span>

                                        <label className="tw-mt-2">
                                            <Form.Check
                                                required
                                                readOnly
                                                checked
                                                className="tw-opacity-50 tw-ml-1 tw-align-baseline "
                                                type="checkbox"
                                                inline></Form.Check>
                                            התשובה עונה על השאלה
                                        </label>

                                    </div>
                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.betweenParts[ind]}</span>

                                    <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full">
                                        {sentenceSet.followUp[ind]?.length === 0 ?
                                            <></>
                                            : (
                                                <div
                                                    className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                                                    <div
                                                        className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                                                    <span className="tw-underline tw-font-bold tw-pb-2">שלב שני:</span>
                                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.prePartTwo[ind]}</span>
                                                    <div className="">
                                                        <span className="tw-mt-4">שאלת המשך: </span>
                                                        <span
                                                            className="h6 tw-py-4 tw-font-bold">{sentenceSet.followUp[ind]}</span>
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
                                                                value={sentenceSet.followUpAnswer[ind]}
                                                                rows={1}
                                                                readOnly
                                                            >
                                                            </Form.Control>
                                                        </InputGroup>

                                                    </FormGroup>
                                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.postPartTwo}</span>

                                                    <Container className="tw-px-0">
                                                        <Form.Check
                                                            className=""
                                                            checked={true}
                                                            readOnly
                                                            name={`radio${i}${ind}`}
                                                            type="radio"
                                                            inline
                                                            label="התשובה עונה על השאלה"

                                                        />

                                                        <Form.Check
                                                            className=""
                                                            checked={false}
                                                            readOnly
                                                            name={`radio${i}${ind}`}
                                                            type="radio"
                                                            inline
                                                            label="אין בטקסט תשובה לשאלת ההמשך"
                                                        />
                                                    </Container>
                                                </div>

                                            )}
                                    <span className="tw-font-bold tw-text-[#006D77]">{sentenceSet.additional[ind]}</span>

                                    </Container>
                                    <div
                                        className={(sentenceSet.head.length - 1 < ind ? "tw-mb-8 " : "tw-mb-8 ") + "tw-mt-8 tw-flex tw-w-full tw-justify-between tw-align-bottom"}>
                                        <Button
                                            size="sm"
                                            active={!(sentenceSet.head.length - 1 === ind)}
                                            disabled={sentenceSet.head.length - 1 === ind}
                                            variant="outline-secondary"
                                            className="tw-w-fit  tw-ml-2">
                                            שמור והוסף שאלה
                                        </Button>
                                        <Button
                                            size="sm"
                                            active={sentenceSet.head.length - 1 === ind}
                                            disabled={!(sentenceSet.head.length - 1 === ind)}
                                            variant="outline-primary"
                                            className="tw-w-fit tw-ml-2">
                                            שמור והמשך לסט המשפטים הבא
                                        </Button>
                                    </div>
                                </div>
                            )
                        )

                        }
                    </Container>
                </Card>
            </Container>))

    //     <Container className="tw-px-0 tw-w-full tw-select-none" hidden={chosen !== i} key={i}>
    //         <h6 className="tw-mb-2 tw-font-bold tw-opacity-80">{sentenceSet.preText}</h6>
    //         <Card key={i}>
    //             <Card.Body>
    //                 <span>{sentenceSet.first + " "}</span>
    //                 <span
    //                     className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
    //                     dangerouslySetInnerHTML={{
    //                         __html: sentenceSet.second.replace(
    //                             sentenceSet.verb,
    //                             `<b>${sentenceSet.verb}</b>`
    //                         ),
    //                     }}
    //                 ></span>
    //                 <span>{" " + sentenceSet.third}</span>
    //             </Card.Body>
    //         </Card>
    //         <Container className="tw-p-0 tw-w-full tw-h-full">
    //
    //             {sentenceSet.head.map((_, index)=>(
    //                 <Container key={index} className="tw-w-full tw-px-0 tw-mb-4">
    //
    //                     <Container className="tw-flex tw-flex-row tw-w-full tw-px-0 tw-my-2">
    //                         <Form.Select
    //                             size="sm"
    //                             className="tw-outline tw-outline-1 tw-w-[40%]"
    //                             aria-label=".form-select-sm"
    //                             name="questionHead"
    //                             disabled
    //                         >
    //                             <option value={sentenceSet.head[index]}>{sentenceSet.head[index]}</option>
    //                         </Form.Select>
    //                         <Form.Select
    //                             size="sm"
    //                             className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
    //                             aria-label=".form-select-sm"
    //                             name="questionTail"
    //                             disabled
    //                         >
    //                             <option key={i} value={sentenceSet.tail[index]}>{sentenceSet.tail[index]}</option>
    //                         </Form.Select>
    //                     </Container>
    //                     <h6 className="tw-mt-4 tw-font-bold tw-opacity-70">{sentenceSet.postText}</h6>
    //                     <h6 className="tw-mt-4 tw-font-bold tw-opacity-70">{sentenceSet.prePartOne}</h6>
    //                     <Container className="tw-my-2 tw-px-0">
    //                         <span className="tw-py-4">השאלה שנוצרה: <b>{sentenceSet.head[index] + " " + sentenceSet.tail[index]}</b></span>
    //                         <span><br/>התשובה: <b>{sentenceSet.verb}</b></span>
    //                     </Container>
    //                     <label className="">
    //                         <Form.Check
    //                             checked
    //                             required
    //                             className="tw-opacity-50 tw-ml-1 tw-align-baseline "
    //                             type="checkbox"
    //                             inline></Form.Check>
    //                         התשובה עונה על השאלה
    //                     </label>
    //                     <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-my-8"></div>
    //                     <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.postPartOne}</h6>
    //                     <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.prePartTwo}</h6>
    //                     {sentenceSet.followUp.length===0?<></>:(
    //                         <div>
    //                             <Container className="tw-px-0 tw-my-2">
    //                                 <span className="">שאלת המשך: <b>{sentenceSet.followUp[index]}</b></span>
    //                                 <span><br/>תשובה: </span>
    //                                 <span className="tw-underline">{sentenceSet.followUpAnswer[index]}</span>
    //                             </Container>
    //                             <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.postPartTwo}</h6>
    //                             <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.additional}</h6>
    //                         </div>
    //                     )}
    //                 </Container>
    //             ))}
    //             <div className="tw-w-full">
    //                 <Button
    //                     size="sm"
    //                     variant="outline-secondary"
    //                     disabled
    //                     className="tw-w-fit  tw-ml-2">
    //                     שמור והוסף שאלה
    //                 </Button>
    //                 <Button
    //                     size="sm"
    //                     variant="outline-primary"
    //                     active
    //                     className=" tw-w-fit tw-ml-2">
    //                     שמור והמשך לסט המשפטים הבא
    //                 </Button>
    //             </div>
    //
    //         </Container>
    //
    //     </Container>
    // ));

    const handleExpend = () => {
        setExpend(!expend);
    };

    const handleChosen = (ind: number) => {
        setChosen(ind != chosen ? ind : -1);
    };

    const createExampleButtons = () => {
        return [...Array(numOfExamples).keys()].map((i, ind) => {
            return (
                <Button
                    variant={chosen === i ? "dark" : "secondary"}
                    key={i}
                    className="tw-shadow tw-mx-2 tw-w-32"
                    onClick={() => handleChosen(i)}
                >
                    דוגמא {ind + 1}
                </Button>
            );
        });
    };

    return (
        <Container className="card-cont tw-mb-2 tw-border-collapse tw-select-none">
            <Card
                className={
                    !expend
                        ? "tw-bg-opacity-0 tw-transition-all tw-duration-300 hover:tw-scale-[101%] hover:tw-drop-shadow-lg"
                        : "" + "tw-select-none"
                }
            >
                <Card.Header
                    onClick={handleExpend}
                    className="tw-bg-[#7fcdbb40] tw-flex tw-justify-between tw-align-middle"
                >
                    <div className="h6">דוגמאות</div>
                    <div className="h6">(לחץ כדי להרחיב)</div>
                </Card.Header>
                <Collapse in={expend}>
                    <div className="">
                        <Card.Body className="tw-px-0 tw-bg-[#7fcdbb40]">

                            <div className="tw-text-right tw-select-none">
                                <Container
                                    className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-0 tw-justify-center">
                                    {createExampleButtons()}
                                </Container>

                                {chosen == -1 ? (
                                    <></>
                                ) : (
                                    <Container className="tw-px-0 tw-mt-8 tw-select-text">

                                        {generateExamples()}
                                    </Container>

                                )}

                            </div>
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>
        </Container>
    );
}

export default ExamplesTab;

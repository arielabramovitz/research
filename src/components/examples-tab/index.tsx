import React, {useState} from "react";
import {exampleSentences} from "./mockSentences";
import {Container, Card, Collapse, Button, Form} from "react-bootstrap";

function ExamplesTab() {
    const numOfExamples = exampleSentences.length;
    const [expend, setExpend] = useState(false);
    const [chosen, setChosen] = useState(-1);

    const generateExamples = () =>
        exampleSentences.map((sentenceSet, i) => (
            <Container className="tw-px-0 tw-w-full tw-select-none" hidden={chosen !== i} key={i}>
                <h6 className="tw-mb-2 tw-font-bold tw-opacity-80">{sentenceSet.preText}</h6>
                <Card>
                    <Card.Body>
                        <span>{sentenceSet.first + " "}</span>
                        <span
                            className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                            dangerouslySetInnerHTML={{
                                __html: sentenceSet.second.replace(
                                    sentenceSet.verb,
                                    `<b>${sentenceSet.verb}</b>`
                                ),
                            }}
                        ></span>
                        <span>{" " + sentenceSet.third}</span>
                    </Card.Body>
                </Card>
                <Container className="tw-p-0 tw-w-full tw-h-full">

                    {sentenceSet.head.map((_, index)=>(
                        <Container className="tw-w-full tw-px-0">

                            <Container className="tw-flex tw-flex-row tw-w-full tw-px-0 tw-my-2">
                                <Form.Select
                                    size="sm"
                                    className="tw-outline tw-outline-1 tw-w-[40%]"
                                    aria-label=".form-select-sm"
                                    name="questionHead"
                                    disabled
                                >
                                    <option key={i} value={sentenceSet.head[index]}>{sentenceSet.head[index]}</option>
                                </Form.Select>
                                <Form.Select
                                    size="sm"
                                    className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
                                    aria-label=".form-select-sm"
                                    name="questionTail"
                                    disabled
                                >
                                    <option key={i} value={sentenceSet.tail[index]}>{sentenceSet.tail[index]}</option>
                                </Form.Select>
                            </Container>
                            <h6 className="tw-mt-4 tw-font-bold tw-opacity-70">{sentenceSet.postText}</h6>
                            <h6 className="tw-mt-4 tw-font-bold tw-opacity-70">{sentenceSet.prePartOne}</h6>
                            <Container className="tw-my-2 tw-px-0">
                                <span className="tw-py-4">השאלה שנוצרה: <b>{sentenceSet.head[index] + " " + sentenceSet.tail[index]}</b></span>
                                <span><br/>התשובה: <b>{sentenceSet.verb}</b></span>
                            </Container>
                            <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.postPartOne}</h6>
                            <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.prePartTwo}</h6>
                            {sentenceSet.followUp.length===0?<></>:(
                                <div>
                                    <Container className=" tw-my-2">
                                        <span>שאלת המשך: <b>{sentenceSet.followUp[index]}</b></span>
                                        <span><br/>תשובה: </span>
                                        <span className="tw-underline">{sentenceSet.followUpAnswer[index]}</span>
                                    </Container>
                                    <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.postPartTwo}</h6>
                                    <h6 className="tw-font-bold tw-opacity-70 tw-mt-4">{sentenceSet.additional}</h6>
                                </div>
                            )}
                        </Container>
                    ))}
                </Container>

            </Container>
        ));

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
                        ? " tw-transition-all tw-duration-300 hover:tw-scale-[101%] hover:tw-drop-shadow-lg "
                        : "" + "tw-select-none"
                }
            >
                <Card.Header
                    onClick={handleExpend}
                    className="tw-flex tw-justify-between tw-align-middle"
                >
                    <div className="h6">דוגמאות</div>
                    <div className="h6">(לחץ כדי להרחיב)</div>
                </Card.Header>
                <Collapse in={expend}>
                    <div className="">
                        <Card.Body className="tw-px-0">

                            <div className="tw-text-right tw-select-none">
                                <Container
                                    className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-0 tw-justify-center">
                                    {createExampleButtons()}
                                </Container>

                                {chosen == -1 ? (
                                    <></>
                                ) : (
                                    <Container className="tw-px-0 tw-select-text">
                                        <h5 className="h5 tw-mt-2 tw-mb-4 tw-font-bold text-center">
                                            בניסוי הזה נציג לכם משפטים בעברית בתוך הקשר של פיסקה. נבקש מכם לחשוב מאיזו פרספקטיבה מוצגים
                                            אירועים שמתוארים במשפט.
                                        </h5>
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

import React, { useState } from "react";
import { exampleSentences } from "./mockSentences";
import { Container, Card, Button, Form, FormGroup, InputGroup, FormLabel } from "react-bootstrap";
import { CollapsableCard } from "../components/collapsableCard";

interface ExampleTabProps {
  showExamplesModal: boolean;
  setShowExamplesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function ExamplesTab({ showExamplesModal, setShowExamplesModal }: ExampleTabProps) {
  const numOfExamples = exampleSentences.length;
  const [chosen, setChosen] = useState(-1);
  const handleChecked = () => {
    setShowExamplesModal(false);
    sessionStorage.setItem("showExamples", "false");
  };

  const generateExamples = () =>
    exampleSentences.map((sentenceSet, i) => (
      <Container
        fluid
        className="tw-flex tw-flex-col tw-select-none tw-h-full tw-w-full tw-pb-8"
        hidden={chosen !== i}
        key={i}>
        <Card style={{backgroundColor: "inherit"}} key={i} dir="rtl" className="bd tw-flex tw-flex-col tw-p-4 tw-w-full tw-h-full">
          <Container key={i} className="tw-flex tw-flex-col tw-w-full tw-h-full tw-p-1 tw-mb-2">
            <span className="tw-mb-4  tw-text-[#006D77]">{sentenceSet.preText}</span>

            <Card className="bd tw-h-fit tw-p-4 tw-overflow-y-auto tw-select-text">
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
            {sentenceSet.head.map((head: string, ind: number) => (
              <div key={ind} className="tw-flex tw-flex-col">
                <span className="tw-text-[#006D77] tw-my-2 ">{sentenceSet.postText[ind]}</span>
                <span hidden={ind !== 0} className="tw-underline tw-font-bold">
                  שלב ראשון:
                </span>

                <span className="tw-text-[#006D77] tw-my-2">{sentenceSet.prePartOne[ind]}</span>
                <div className="tw-flex tw-flex-col tw-px-0">
                  {/*<span hidden={sentenceSet.preQuestion[ind]?.length===0} className="tw-text-[#006D77] tw-mb-2">{sentenceSet.preQuestion[ind]}</span>*/}

                  <Container className="tw-flex-row tw-px-0 tw-flex tw-pb-3 tw-pt-2">
                    <Form.Select size="sm" className="tw-outline tw-outline-1 tw-w-[40%]" value={head} disabled>
                      <option value={head}>{head}</option>
                    </Form.Select>

                    <Form.Select
                      size="sm"
                      className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
                      disabled
                      value={sentenceSet.tail[ind]}>
                      <option value={sentenceSet.tail[ind]}>{sentenceSet.tail[ind]}</option>
                    </Form.Select>
                  </Container>

                  <div className="tw-flex tw-w-full">
                    {!sentenceSet.requiresCompletion[ind] ? (
                      <div className="tw-flex tw-flex-col">
                        <span
                          hidden={sentenceSet.postQuestion[ind]?.length === 0}
                          className="tw-whitespace-pre-line tw-text-[#006D77] tw-mb-2">
                          {sentenceSet.postQuestion[ind]}
                        </span>
                        <span className="">
                          השאלה שנוצרה:{" "}
                          <b>{`${head} ${
                            sentenceSet.requiresCompletion[ind]
                              ? sentenceSet.tail[ind].slice(0, -4)
                              : sentenceSet.tail[ind]
                          }`}</b>
                        </span>
                      </div>
                    ) : (
                      <FormGroup className="tw-flex tw-w-full tw-h-auto tw-my-0 tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                        <InputGroup className="tw-flex tw-w-full tw-justify-start  tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                          <div className="tw-flex tw-flex-col tw-w-full">
                            <span
                              hidden={sentenceSet.preQuestion[ind]?.length === 0}
                              className="tw-text-[#006D77] tw-mb-2">
                              {sentenceSet.preQuestion[ind]}
                            </span>

                            <div className="tw-flex tw-flex-row tw-w-full tw-mb-0 tw-h-[24px]">
                              <Form.Label className="tw-my-0">
                                השאלה שנוצרה:
                                <b>{` ${head} ${
                                  sentenceSet.requiresCompletion[ind]
                                    ? sentenceSet.tail[ind].slice(0, -4)
                                    : sentenceSet.tail[ind]
                                }`}</b>
                              </Form.Label>

                              <Form.Control
                                as="textarea"
                                readOnly
                                className="tw-resize-none tw-py-0 tw-my-0 tw-px-1 tw-w-3/4 tw-border-0 tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                placeholder="השלימו את השאלה פה"
                                rows={1}
                                value={sentenceSet.completion === undefined ? "" : sentenceSet.completion[ind]}
                              />
                            </div>

                            <span
                              hidden={sentenceSet.postQuestion[ind]?.length === 0}
                              className="tw-text-[#006D77] tw-mt-2">
                              {sentenceSet.postQuestion[ind]}
                            </span>
                          </div>
                        </InputGroup>
                      </FormGroup>
                    )}
                  </div>
                  <span className="">
                    התשובה: <b>{sentenceSet.verb}</b>
                  </span>
                  <span hidden={sentenceSet.postPartOne[ind]?.length === 0} className="tw-text-[#006D77] tw-pb-2">
                    {sentenceSet.postPartOne[ind]}
                  </span>
                  <span hidden={sentenceSet.betweenParts[ind]?.length === 0} className="tw-text-[#006D77]">
                    {sentenceSet.betweenParts[ind]}
                  </span>

                  <label className="tw-my-2">
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

                <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full">
                  {!sentenceSet.followUp[ind] || sentenceSet.followUp[ind]?.length === 0 ? (
                    <></>
                  ) : (
                    <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                      <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                      <span className="tw-underline tw-font-bold tw-pb-2">שלב שני:</span>
                      {/* {sentenceSet.prePartTwo[ind].split("\n").map((part,ind)=>{
                                                        return (
                                                            <span key={ind} className="tw-text-[#006D77] tw-pb-2"><>{`${part}`}<br/></></span>

                                                        )
                                                    })} */}
                      <span className="tw-text-[#006D77] tw-whitespace-pre-line">{`${sentenceSet.prePartTwo[ind]}`}</span>
                      {!sentenceSet.preFollowUpQuestion[ind] ? (
                        <></>
                      ) : (
                        <div key={ind} className="tw-pb-2">
                          <span className="tw-pb-2 tw-text-[#006D77]">
                            {sentenceSet.preFollowUpQuestion[ind]}
                            <br />
                          </span>
                          <div className="tw-pt-2">
                            <span className="tw-pb-2">שאלת המשך: </span>
                            <span className="h6 tw-pb-2 tw-font-bold">{sentenceSet.followUp[ind]}</span>
                          </div>
                        </div>
                      )}
                      {/* {sentenceSet.preFollowUpPair[ind]?.split("\n").map((part, ind)=>{
                                                        return (
                                                            <span key={ind} className="tw-text-[#006D77] tw-pb-2"><>{`${part}`}<br/></></span>

                                                        )
                                                    })} */}
                      <span className="tw-text-[#006D77] tw-whitespace-pre-line">{`${sentenceSet.preFollowUpPair[ind]}`}</span>
                      <div className="">
                        <span className="">שאלת המשך: </span>
                        <span className="h6 tw-font-bold">{sentenceSet.followUp[ind]}</span>
                      </div>
                      <FormGroup className="tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                        <InputGroup className="tw-flex tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                          <FormLabel className="tw-my-2">התשובה: </FormLabel>
                          <Form.Control
                            as="textarea"
                            className="tw-resize-none tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                            placeholder="סמנו את התשובה בטקסט או הקלידו אותה כאן"
                            value={sentenceSet.followUpAnswer[ind]}
                            rows={1}
                            readOnly></Form.Control>
                        </InputGroup>
                        <span className="tw-text-[#006D77] tw-pb-2">{sentenceSet.postFollowUpPair[ind]}</span>
                      </FormGroup>

                      <Container className="tw-px-0 tw-pt-2">
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
                </Container>
                <div className={"tw-flex tw-flex-col tw-w-full tw-justify-between tw-align-bottom"}>
                  <span className="tw-text-[#006D77]">{sentenceSet.postPartTwo[ind]}</span>

                  <span className="tw-whitespace-pre-line tw-mt-8 tw-text-[#006D77] tw-pb-2">{sentenceSet.additionalSave[ind]}</span>
                  <Button size="sm" variant="success" className="tw-w-fit tw-ml-2">
                    שמור והוסף שאלה
                  </Button>
                  {i !== numOfExamples - 1 || ind === sentenceSet.head.length - 1 ? (
                    <>
                      <span className="tw-text-[#006D77] tw-py-2">{sentenceSet.additionalNext[ind]}</span>
                      <Button size="sm" variant="primary" className="tw-w-fit tw-ml-2">
                        המשך לסט המשפטים הבא
                      </Button>
                    </>
                  ) : (
                    <></>
                  )}
                  {ind!==sentenceSet.head.length-1?<span className=" tw-py-8">{}</span>:<></>}
                </div>
                {i !== numOfExamples - 1 ? (
                  <span className="tw-pt-2 tw-text-[#006D77]">{"נא לעבור לדוגמה הבאה"}</span>
                ) : (
                  <></>
                )}
              </div>
            ))}
            
          </Container>
          {chosen !== numOfExamples - 1 || !showExamplesModal ? (
            <div>
              <span className="tw-whitespace-pre-line tw-pt-2 tw-text-[#006D77]">{"שימו לב: במהלך הניסוי יוצגו מדי פעם גם שאלות פשוטות לבדיקת עירנות. ענו עליהן בדיוק לפי מה שיהיה מוסבר בהוראות.\nבהצלחה!"}</span>

            </div>
          ) : (
            <div>
              <span>שימו לב: במהלך הניסוי יוצגו מדי פעם גם שאלות פשוטות לבדיקת עירנות. ענו עליהן בדיוק לפי מה שיהיה מוסבר בהוראות.</span>
              <div className="tw-mt-4 tw-w-full tw-flex tw-justify-center">
                <Form.Check
                  key={i}
                  className=""
                  onChange={() => {
                    handleChecked();
                  }}
                  label="עברתי על כל הדוגמאות ואני מוכן/ה להתחיל"
                />
            </div>
            </div>
          )}
        </Card>
      </Container>
    ));

  const handleChosen = (ind: number) => {
    setChosen(ind != chosen ? ind : -1);
  };

  const createExampleButtons = () => {
    return [...Array(numOfExamples).keys()].map((i, ind) => {
      return (
        <Button
          // disabled={showExamplesModal?!(chosen>=0?i===chosen+1||i===chosen-1:i===chosen+1):false}
          variant={chosen === i ? "dark" : "secondary"}
          key={i}
          className="tw-shadow tw-mx-2 tw-w-32"
          onClick={() => handleChosen(i)}>
          דוגמא {ind + 1}
        </Button>
      );
    });
  };
  return (
    <CollapsableCard bgColor="#e3ebde" header="דוגמאות">
      <div className="tw-text-right tw-select-none">
        <Container className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-0 tw-justify-center">
          {createExampleButtons()}
        </Container>

        {chosen == -1 ? <></> : <Container className="tw-px-0 tw-mt-8 tw-select-text">{generateExamples()}</Container>}
      </div>
    </CollapsableCard>
  );

  // return (
  //     <Container className="card-cont tw-mb-2 tw-border-collapse tw-select-none">
  //         <Card
  //             className={
  //                 !expend
  //                     ? "tw-bg-opacity-0 tw-transition-all tw-duration-300 hover:tw-scale-[101%] hover:tw-drop-shadow-lg"
  //                     : "" + "tw-select-none"
  //             }
  //         >
  //             <Card.Header
  //                 onClick={handleExpend}
  //                 className="tw-bg-[#7fcdbb40] tw-flex tw-justify-between tw-align-middle"
  //             >
  //                 <div className="h6">דוגמאות</div>
  //                 <div className="h6">(לחץ כדי להרחיב)</div>
  //             </Card.Header>
  //             <Collapse in={expend}>
  //                 <div className="">
  //                     <Card.Body className="tw-px-0 tw-bg-[#7fcdbb40]">

  //                         <div className="tw-text-right tw-select-none">
  //                             <Container
  //                                 className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-0 tw-justify-center">
  //                                 {createExampleButtons()}
  //                             </Container>

  //                             {chosen == -1 ? (
  //                                 <></>
  //                             ) : (
  //                                 <Container className="tw-px-0 tw-mt-8 tw-select-text">

  //                                     {generateExamples()}

  //                                 </Container>

  //                             )}

  //                         </div>
  //                     </Card.Body>
  //                 </div>

  //             </Collapse>
  //         </Card>
  //     </Container>
  // );
}

export default ExamplesTab;

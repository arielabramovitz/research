import React, { useState } from "react";
import { exampleSentences } from "./mockSentences";
import { Container, Card, Collapse, Button } from "react-bootstrap";

function ExamplesTab() {
  const numOfExamples = 3;
  const [expend, setExpend] = useState(false);
  const [chosen, setChosen] = useState(-1);

  const generateExamples = () =>
    exampleSentences.map((sentenceSet, i) => (
      <Card className="tw-shadow" hidden={chosen !== i} key={i}>
        <Card.Body>
          <span>{sentenceSet.first + " "}</span>
          <span
            className="tw-bg-lapis_lazuli-700 tw-bg-opacity-60"
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
    <Container className="card-cont tw-mb-2 tw-flex-col tw-border-collapse tw-select-none">
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
          <div>
            <Card.Body className="tw-h-fit">
              <div className="tw-px-6 tw-h-56 tw-text-right tw-overflow-y-auto tw-select-none">
                <Container className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-2 tw-justify-center">
                  {createExampleButtons()}
                </Container>
                {chosen == -1 ? (
                  <></>
                ) : (
                  <Container className="tw-h-32 tw-select-text tw-overflow-y-auto">
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

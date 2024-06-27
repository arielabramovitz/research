import { ReactElement, useEffect, useState, React} from "react";
import { Document, Meta, NominalToken, Sentence, Token } from "../../util/conllu";
import {Container, Card, Collapse, Button} from "react-bootstrap";

function ExamplesTab() {
  const numOfExamples = 6;
  const sentencesPerExample = 3;
  const [expend, setExpend] = useState(false);
  const [chosen, setChosen] = useState(-1);
  const [examples, setExamples] = useState<ReactElement[]>(new Array(numOfExamples))

  async function conlluParse(input: string) {
    const doc = await Document.parse(input);
    const sentences = doc.sentences.slice(numOfExamples * sentencesPerExample);
    const ex: ReactElement[] = new Array(numOfExamples);
    for (let i = 0; i < numOfExamples * sentencesPerExample; i++) {
      const first = sentences[i*3]
      const second = sentences[i*3+1]
      const third = sentences[i*3+2]
      if (first.meta && second.meta && third.meta) {
        const firstSentence: string = (first.meta[1] as Meta).value
        let secondSentence: string = (second.meta[1] as Meta).value
        const thirdSentence: string = (third.meta[1] as Meta).value
        const secondVerbs: Token[] = second.tokens.filter((token: NominalToken)=>token.upos === "VERB" && token.form)
        const boldedVerb = secondVerbs[Math.floor(Math.random() * secondVerbs.length)]?.form
        secondSentence = secondSentence.replace(boldedVerb, `<strong>${boldedVerb}</strong>`) || ""
        ex[i] = (
          <div>
            <span className="">{firstSentence}</span>
            &nbsp;
            <span className="tw-bg-c2 tw-bg-opacity-50" dangerouslySetInnerHTML={{__html: secondSentence}}></span>
            &nbsp;
            <span className="">{thirdSentence}</span> 
          </div>
        )
      }
    }
    
    return ex
  }



  useEffect(() => {
    async function fetchExamples() {
      await fetch("/he_htb-ud-dev.conllu")
        .then((res) => res.text())
        .then((text) => conlluParse(text))
        .then((exmp)=>{setExamples(exmp)})
        .catch((e) => {
          console.log(e);
        });
    }
    fetchExamples();
  }, []);


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
          variant={chosen===i ? "outline-dark": "outline-primary"}
          key={i}
          className={
            (chosen == i ? "chosen " : "") +
            "tw-w-full tw-mx-2 tw-rounded-md tw-h-fit tw-border-2 tw-border-black exmp"
          }
          onClick={() => handleChosen(i)}
        >
          דוגמא {ind + 1}
        </Button>
      );
    });
  };

  return (
    <Container className="tw-my-2 tw-flex-col tw-border-collapse tw-select-none">
      <Card
        className="tw-select-none"
      >
        <Card.Header onClick={handleExpend} className="d-flex tw-justify-between">
          <div className="">דוגמאות</div>
          <div className="">(לחץ כדי להרחיב)</div>
        </Card.Header>
        <Collapse in={expend}>
          <div>
          <Card.Body className="tw-h-fit">
            <div className="tw-px-6 tw-h-56 bd tw-border-t-0 tw-text-right tw-overflow-y-auto tw-select-none">
              <div className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-2 ">
                {createExampleButtons()}
              </div>
              {chosen == -1 ? <></> : (
                <div className="tw-h-32 tw-bd tw-m-4 tw-select-text tw-overflow-y-auto tw-rounded-md">
                  {examples[chosen]}
                </div>
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

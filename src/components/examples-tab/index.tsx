import { ReactElement, useEffect, useState, React} from "react";
import { Document, Meta, NominalToken, Sentence, Token } from "../../util/conllu";
import {exampleSentences, getSentence} from "./mockSentences";
import {Container, Card, Collapse, Button, ButtonGroup, Fade} from "react-bootstrap";

function ExamplesTab() {
  const numOfExamples = 3;
  const sentencesPerExample = 3;
  const [expend, setExpend] = useState(false);
  const [chosen, setChosen] = useState(-1);
  const [examples, setExamples] = useState<ReactElement[]>(new Array(numOfExamples))

  // async function conlluParse(input: string) {
  //   const doc = await Document.parse(input);
  //   const sentences = doc.sentences.slice(numOfExamples * sentencesPerExample);
  //   const ex: ReactElement[] = new Array(numOfExamples);
  //   for (let i = 0; i < numOfExamples * sentencesPerExample; i++) {
  //     const first = sentences[i*3]
  //     const second = sentences[i*3+1]
  //     const third = sentences[i*3+2]
  //     if (first.meta && second.meta && third.meta) {
  //       const firstSentence: string = (first.meta[1] as Meta).value
  //       let secondSentence: string = (second.meta[1] as Meta).value
  //       const thirdSentence: string = (third.meta[1] as Meta).value
  //       const secondVerbs: Token[] = second.tokens.filter((token: NominalToken)=>token.upos === "VERB" && token.form)
  //       const boldedVerb = secondVerbs[Math.floor(Math.random() * secondVerbs.length)]?.form
  //       secondSentence = secondSentence.replace(boldedVerb, `<strong>${boldedVerb}</strong>`) || ""
  //       ex[i] = (
  //         <div>
  //           <span className="">{firstSentence}</span>
  //           &nbsp;
  //           <span className="tw-bg-c2 tw-bg-opacity-50" dangerouslySetInnerHTML={{__html: secondSentence}}></span>
  //           &nbsp;
  //           <span className="">{thirdSentence}</span> 
  //         </div>
  //       )
  //     }
  //   }
    
  //   return ex
  // }

  const generateExamples=()=>
    exampleSentences.map((sentenceSet, i) => 
     <Card className="tw-shadow" hidden={chosen!==i} key={i}>
          <Card.Body>
            <span>{sentenceSet.first+" "}</span>
            <span className="tw-bg-lapis_lazuli-700 tw-bg-opacity-60" dangerouslySetInnerHTML={{__html: sentenceSet.second.replace(sentenceSet.verb, `<b>${sentenceSet.verb}</b>`)}}></span>
            <span>{" "+sentenceSet.third}</span>
          </Card.Body>
      </Card> 
    )
      
  

  useEffect(() => {
    // async function fetchExamples() {
    //   await fetch("/he_htb-ud-dev.conllu")
    //     .then((res) => res.text())
    //     .then((text) => conlluParse(text))
    //     .then((exmp)=>{setExamples(exmp)})
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // }
    // fetchExamples();
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
          variant={chosen===i ? "dark": "secondary"}
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
            <div className="tw-px-6 tw-h-56 tw-text-right tw-overflow-y-auto tw-select-none">
              <Container className="tw-flex tw-items-center tw-h-12 tw-mt-2 tw-px-2 tw-justify-center">
                {createExampleButtons()}
              </Container>
              {chosen == -1 ? <></> : (
                <div className="tw-h-32 tw-bd tw-m-4 tw-select-text tw-overflow-y-auto tw-rounded-md">
                    {generateExamples()}
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

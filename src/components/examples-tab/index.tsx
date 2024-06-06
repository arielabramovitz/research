import { ReactElement, useEffect, useState } from "react";
import { Document, Meta, NominalToken, Sentence, Token } from "../../util/conllu";

function ExamplesTab() {
  const numOfExamples = 6;
  const sentencesPerExample = 3;
  const [expend, setExpend] = useState(false);
  const [chosen, setChosen] = useState(-1);
  const [examples, setExamples] = useState<ReactElement[]>(new Array(numOfExamples))

  async function conlluParse(input: string) {
    const doc = await Document.parse(input);
    const sentences = doc.sentences.slice(numOfExamples * sentencesPerExample);
    let ex: ReactElement[] = new Array(numOfExamples);
    for (let i = 0; i < numOfExamples * sentencesPerExample; i++) {
      const first = sentences[i*3]
      const second = sentences[i*3+1]
      const third = sentences[i*3+2]
      if (first.meta && second.meta && third.meta) {
        const firstSentence: string = (first.meta[1] as Meta).value
        var secondSentence: string = (second.meta[1] as Meta).value
        const thirdSentence: string = (third.meta[1] as Meta).value
        const secondVerbs: Token[] = second.tokens.filter((token: NominalToken)=>token.upos === "VERB" && token.form)
        console.log(secondVerbs)
        const boldedVerb = secondVerbs[Math.floor(Math.random() * secondVerbs.length)]?.form
        secondSentence = secondSentence.replace(boldedVerb, `<strong>${boldedVerb}</strong>`) || ""
        ex[i] = (
          <div>
            <span className="">{firstSentence}</span>
            &nbsp;
            <span className="bg-c2 bg-opacity-50" dangerouslySetInnerHTML={{__html: secondSentence}}></span>
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
        <button
          key={i}
          className={
            (chosen == i ? "chosen " : "") +
            "w-full mx-2 rounded-md h-fit border-2 border-black exmp"
          }
          onClick={() => handleChosen(i)}
        >
          דוגמא {ind + 1}
        </button>
      );
    });
  };

  return (
    <div className="my-2 flex-col border-collapse">
      <div
        className="group justify-between align-center w-full h-8 pl-4 pr-4 flex p-1 bd text-right select-none"
        onClick={handleExpend}
      >
        <div className="pl-2">דוגמאות</div>
        <div className="opacity-40 group-hover:opacity-75">
          (לחץ כדי להרחיב)
        </div>
      </div>
      {!expend ? (
        <></>
      ) : (
        <div className="px-6 h-56 bd border-t-0 text-right overflow-y-auto select-none">
          <div className="flex items-center h-12 mt-2 px-2 ">
            {createExampleButtons()}
          </div>
          {chosen == -1 ? <></> : (
            <div className="h-32 bd m-4 select-text overflow-y-auto rounded-md">
              {examples[chosen]}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExamplesTab;

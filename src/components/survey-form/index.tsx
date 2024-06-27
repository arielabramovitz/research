import { ChangeEvent, useEffect, useId, useState, React } from "react";
import { heads, tails, followUps } from "./questions.ts";
import { getSentence } from "./mockSentences.ts";
import { Card, Container, InputGroup } from "react-bootstrap";

type QuestionsAndAnswers = {
  question: string;
  answers: string[];
};

function SurveyForm() {
  const questionHeadId = useId();
  const questionTailId = useId();
  const [firstSentenceInSet, setFirstSentenceInSet] = useState<string>("");
  const [secondSentenceInSet, setSecondSentenceInSet] = useState<string>("");
  const [thirdSentenceInSet, setThirdSentenceInSet] = useState<string>("");

  const [questionsAndAnswers, setQuestionsAndAnswers] =
    useState<QuestionsAndAnswers>();
  const [highlightedAnswer, setHighlightedAnswer] = useState("");
  const [boldedVerb, setBoldedVerb] = useState("");
  const [questionType, setQuestionType] = useState<number>(-1);
  const [questionHead, setQuestionHead] = useState<string>("");
  const [questionTail, setQuestionTail] = useState<string>("");
  const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
    setQuestionHead(event.target.value);
  };

  const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.nativeEvent.target) {
      const index: number = event.target.selectedIndex;
      const text: string = event.target[index].text;
      const qType = Number.parseInt(event.target.value);
      setQuestionTail(text);
      setQuestionType(qType);
    }
  };

  const handleTextSelect = (e) => {
    e.preventDefault();
    const highlighted = window.getSelection()?.toString();
    setHighlightedAnswer(highlighted || "");
  };

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
    <Container>
      <Card
        dir="rtl"
        className="bd tw-p-4 tw-w-full tw-h-full tw-overflow-y-auto"
      >
        <Card.Header className="tw-p-1 bd tw-mb-2">
          <h1 className="">
            הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות
            מנוסחות בזמן הווה אך מתייחסות גם לעתיד או עבר.
          </h1>
        </Card.Header>
        <Card.Body>
          <div
            className="tw-h-32 tw-p-4 tw-overflow-y-auto tw-select-text"
            onMouseUp={handleTextSelect}
          >
            {!firstSentenceInSet ||
            !secondSentenceInSet ||
            !thirdSentenceInSet ? (
              <></>
            ) : (
              <div>
                <span>{`${firstSentenceInSet} `}</span>
                <span
                  className="tw-bg-c2"
                  dangerouslySetInnerHTML={{ __html: secondSentenceInSet }}
                ></span>
                <span>{` ${thirdSentenceInSet}`}</span>
              </div>
            )}
          </div>
          <div className="tw-flex-row tw-flex tw-my-2 tw-p-2 tw-border ">
            <label htmlFor={questionHeadId} hidden>
              בחר רישה לשאלה
            </label>
            <select
              onChange={handleSelectHead}
              className="tw-w-[40%] tw-border tw-bordertw- tw-ml-2"
              name="questionHead"
            >
              {heads.map((val, i) => (
                <option key={i} value={val}>
                  {val}
                </option>
              ))}
            </select>

            <label htmlFor={questionTailId} hidden>
              בחר סיפה לשאלה
            </label>
            <select
              onChange={handleSelectTail}
              className="tw-w-full tw-border-2"
              name="questionHead"
            >
              {tails.map((val, i) => (
                <option key={i} value={val.type}>
                  {val.tail}
                </option>
              ))}
            </select>
          </div>
          {questionHead.length === 0 || questionTail.length === 0 ? (
            <></>
          ) : (
            <div className="tw-flex tw-flex-col tw-pr-2 tw-pt-4">
              <span className="">השאלה שנוצרה: </span>
              <p className="tw-font-bold">
                {questionHead + " " + questionTail}
              </p>
              <span className="tw-pt-2">התשובה: </span>
              <p className="tw-font-bold">{boldedVerb}</p>
            </div>
          )}
          <div className="tw-flex tw-flex-row">
            {questionType === -1 ? (
              <></>
            ) : (
              <div className="tw-flex tw-flex-col tw-mr-2 tw-mt-4 tw-w-[50%]">
                <p>שאלת המשך:</p>
                <div className="tw-font-bold">{followUps[questionType]}</div>
                <input
                  className="tw-outline tw-outline-1 tw-min-w-100 tw-px-2 tw-w-[80%] tw-ml-2 tw-mt-2"
                  required
                  value={highlightedAnswer}
                  onChange={(e) => {
                    setHighlightedAnswer(e.target.value);
                  }}
                  placeholder="סמן את התשובה בטקסט או הקלד אותה כאן"
                  type="text"
                />
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SurveyForm;

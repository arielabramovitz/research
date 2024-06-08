import { ChangeEvent, useId, useState } from "react";
import {heads, tails} from "./questions.ts"

function SurveyForm() {
  const questionHeadId = useId();
  const questionTailId = useId();
  const [questionType, setQuestionType] = useState<number>(-1);
  const [questionHead, setQuestionHead] = useState<string>("");
  const [questionTail, setQuestionTail] = useState<string>("");

  const handleSelectHead = (event: ChangeEvent<HTMLSelectElement>) => {
    setQuestionHead(event.target.value)
  };

  const handleSelectTail = (event: ChangeEvent<HTMLSelectElement>)=>{
    const index: number = event.nativeEvent.target?.selectedIndex;
    const text: string = event.nativeEvent.target[index].text
    const qType = Number.parseInt(event.target.value)
    setQuestionTail(text)
    setQuestionType(qType)
  }

  function generateSentences() {
    return (
      <div>
        <span>משפט 1.</span>
        &nbsp;
        <span>משפט 2 עם פועל.</span>
        &nbsp;
        <span>משפט 3.</span>
      </div>
    );
  }

  return (
    <div className="bd p-4 w-full h-full overflow-y-auto">
      <div className="p-1 bd mb-2">
        <h1 className="">
          הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות
          מנוסחות בזמן הווה אך מתייחסות גם לעתיד או עבר.
        </h1>
      </div>
      <div className="flex h-32 p-4 bd">{generateSentences()}</div>
      <div className="flex-row flex my-2 p-2 border-2">
        <label htmlFor={questionHeadId} hidden>
          בחר רישה לשאלה
        </label>
        <select
          onChange={handleSelectHead}
          className="w-[40%] border-2"
          name="questionHead"
        >
          {heads.map((val, i)=>(
            <option key={i} value={val}>{val}</option>
          ))}
        </select>

        <label htmlFor={questionTailId} hidden>
          בחר סיפה לשאלה
        </label>
        <select onChange={handleSelectTail} className="w-full border-2" name="questionHead">
          {tails.map((val, i)=>(
            <option key={i} value={val.type}>{val.tail}</option>
          ))}











        </select>
      </div>
      <div>{questionType === -1 ? <></> : <div></div>}</div>
    </div>
  );
}

export default SurveyForm;

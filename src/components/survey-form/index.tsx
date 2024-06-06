import { useId, useState } from "react";

function SurveyForm() {
  const questionHeadId = useId();
  const questionTailId = useId();
  const [questionType, setQuestionType] = useState<number>(-1);
  const [questionHead, setQuestionHead] = useState<string>("");
  const [questionTail, setQuestionTail] = useState<string>("");

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
          הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן. השאלות מנוסחות
          בזמן הווה אך מתייחסות גם לעתיד או עבר.
        </h1>
      </div>
      <div className="flex h-32 p-4 bd">{generateSentences()}</div>
      <div className="flex-row flex my-2 p-2 border-2">
        <label htmlFor={questionHeadId} hidden>
          בחר רישה לשאלה
        </label>
        <select className="w-[40%] border-2" name="questionHead">
          <option>test 1</option>
          <option>test 2</option>
          <option>test 3</option>
        </select>

        <label htmlFor={questionTailId} hidden>
          בחר סיפה לשאלה
        </label>
        <select className="w-full border-2" name="questionHead">
          <option>test 1</option>
          <option>test 2</option>
          <option>test 3</option>
        </select>
      </div>
      <div>
        {questionType===-1 ? (<></>) : (
            <div>

            </div>
        )}
      </div>
    </div>
  );
}

export default SurveyForm;

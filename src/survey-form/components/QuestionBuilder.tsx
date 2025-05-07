import React, { ChangeEvent, RefObject } from 'react';
import { Form } from 'react-bootstrap';

// Define the interface for the tail object structure
interface TailObject {
    type: number;
    tail: string;
}

interface QuestionBuilderProps {
    heads: string[];
    tails: TailObject[]; // Use the defined interface
    questionHead: string;
    tailIndex: number;
    handleSelectHead: (event: ChangeEvent<HTMLSelectElement>) => void;
    handleSelectTail: (event: ChangeEvent<HTMLSelectElement>) => void;
    headRef: RefObject<HTMLSelectElement>;
    tailRef: RefObject<HTMLSelectElement>;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
    heads,
    tails,
    questionHead,
    tailIndex,
    handleSelectHead,
    handleSelectTail,
    headRef,
    tailRef,
}) => {
    return (
        <div className="tw-flex-row tw-px-0 tw-flex tw-my-2">
            <label hidden>בחר רישה לשאלה</label>
            <Form.Select
                size="sm"
                onChange={handleSelectHead}
                style={{ backgroundColor: "inherit" }}
                className="tw-outline tw-outline-1 tw-w-[40%]"
                aria-label=".form-select-sm"
                name="questionHead" // Changed from state.questionHead
                ref={headRef}
                value={questionHead}
            >
                {heads.map((val, i) => (
                    <option className="tw-bg-[#deecfa]" key={i} value={val}>
                        {val}
                    </option>
                ))}
            </Form.Select>

            <label hidden>בחר סיפה לשאלה</label>
            <Form.Select
                style={{ backgroundColor: "inherit" }}
                size="sm"
                onChange={handleSelectTail}
                className="tw-outline tw-outline-1 tw-w-full tw-mr-4"
                aria-label=".form-select-sm"
                name="questionTail"
                ref={tailRef}
                value={tailIndex} // Changed from state.tailIndex
            >
                {tails.map((val, i) => (
                    <option className="tw-bg-[#deecfa]" key={i} value={i}>
                        {val.tail}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
};

export default QuestionBuilder; 
import React, { RefObject } from 'react';
import { Container, Form, FormGroup, InputGroup, FormLabel } from 'react-bootstrap';
import { SurveyAction } from '../../utils/reducers'; // Assuming SurveyAction type is exported

interface FollowUpQuestionProps {
    followUp: string;
    questionHead: string;
    checked: boolean;
    followUpAnswerChecked: number;
    highlightedAnswer: string;
    dispatch: React.Dispatch<SurveyAction>;
    handleFollowUpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    followUpAnswerRef: RefObject<HTMLTextAreaElement>;
}

const FollowUpQuestion: React.FC<FollowUpQuestionProps> = ({
    followUp,
    questionHead,
    checked,
    followUpAnswerChecked,
    highlightedAnswer,
    dispatch,
    handleFollowUpChange,
    followUpAnswerRef,
}) => {
    if (followUp.length === 0 || questionHead.length === 0 || !checked) {
        return null; // Don't render if conditions aren't met
    }

    return (
        <Container className="tw-flex tw-flex-col tw-px-0 tw-h-full tw-mb-32">
            <div className="tw-pt-8 tw-flex tw-flex-col tw-mx-0 tw-h-full tw-w-full">
                <div className="tw-border-t-2 tw-border-[#000] tw-border-opacity-25 tw-pt-8"></div>
                <div className="">
                    <span className="tw-mt-4">שאלת המשך: </span>
                    <span className="h6 tw-py-4 tw-font-bold">{followUp}</span>
                </div>

                <FormGroup className="tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                    <InputGroup className="tw-flex tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                        <FormLabel className="tw-my-2">התשובה: </FormLabel>
                        <Form.Control
                            as="textarea"
                            className="tw-resize-none tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                            placeholder="סמנו את התשובה בטקסט או הקלידו אותה כאן"
                            ref={followUpAnswerRef}
                            value={highlightedAnswer}
                            onChange={handleFollowUpChange}
                            rows={1}
                        />
                    </InputGroup>
                </FormGroup>
                <Container className="tw-px-0">
                    <Form.Check
                        onChange={() => {
                            dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 1 });
                        }}
                        checked={followUpAnswerChecked === 1}
                        required
                        className=""
                        name="followUpAnswerCheck"
                        type="radio"
                        inline
                        label="התשובה עונה על השאלה"
                    />
                    <Form.Check
                        onChange={() => {
                            dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 2 });
                        }}
                        required
                        checked={followUpAnswerChecked === 2}
                        className=""
                        name="followUpAnswerCheck"
                        type="radio"
                        inline
                        label="אין בטקסט תשובה לשאלת ההמשך"
                    />
                </Container>
            </div>
        </Container>
    );
};

export default FollowUpQuestion; 
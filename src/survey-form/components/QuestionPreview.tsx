import React, { RefObject } from 'react';
import { Container, Form, FormGroup, InputGroup, FormLabel } from 'react-bootstrap';
import { SurveyAction } from '../../utils/reducers'; // Assuming SurveyAction type is exported

interface QuestionPreviewProps {
    questionHead: string;
    questionTail: string;
    requiresCompletion: boolean;
    tailCompletion: string;
    boldedVerb: string;
    checked: boolean;
    dispatch: React.Dispatch<SurveyAction>;
    tailCompletionRef: RefObject<HTMLTextAreaElement>;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({
    questionHead,
    questionTail,
    requiresCompletion,
    tailCompletion,
    boldedVerb,
    checked,
    dispatch,
    tailCompletionRef,
}) => {
    if (questionHead.length === 0 || questionTail.length === 0) {
        return null; // Don't render if head or tail is empty
    }

    return (
        <Container className="tw-flex tw-flex-col tw-px-0 tw-pt-4">
            <div className="tw-flex tw-flex-col">
                {!requiresCompletion ? (
                    <span className="">השאלה שנוצרה: <b>{`${questionHead} ${questionTail}`}</b></span>
                ) : (
                    <div className="tw-flex tw-flex-row tw-w-full">
                        <FormGroup className="tw-w-full tw-h-[24px] tw-my-0 tw-p-0 tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                            <InputGroup className="tw-flex tw-w-full tw-align-top tw-justify-start tw-h-full tw-border-0 hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none">
                                <Form.Label className="tw-my-0">
                                    השאלה שנוצרה: <b>{`${questionHead} ${questionTail.slice(0, -4)}`}</b>
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    style={{ backgroundColor: "inherit" }}
                                    className=" tw-resize-none tw-py-0 tw-px-2 tw-w-full tw-border-0  tw-overflow-hidden tw-underline hover:tw-bg-transparent focus:tw-shadow-none focus:tw-outline-none focus-within:tw-outline-none"
                                    placeholder="השלימו את השאלה פה"
                                    value={tailCompletion}
                                    ref={tailCompletionRef}
                                    onChange={(e) => {
                                        dispatch({ type: 'SET_TAIL_COMPLETION', payload: e.target.value });
                                    }}
                                    rows={1}
                                />
                            </InputGroup>
                        </FormGroup>
                    </div>
                )}
            </div>
            <span className="tw-pt-2">התשובה: <b>{boldedVerb}</b></span>
            <label className="tw-mt-2">
                <Form.Check
                    onChange={() => {
                        dispatch({ type: 'SET_FOLLOW_UP_ANSWER_CHECKED', payload: 0 });
                        dispatch({ type: 'SET_HIGHLIGHTED_ANSWER', payload: "" });
                        dispatch({ type: 'SET_CHECKED', payload: !checked });
                    }}
                    checked={checked}
                    required
                    className="!tw-bg-opacity-0 tw-ml-1 tw-align-baseline "
                    type="checkbox"
                    inline
                />
                התשובה עונה על השאלה
            </label>
        </Container>
    );
};

export default QuestionPreview; 
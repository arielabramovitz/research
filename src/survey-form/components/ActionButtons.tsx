import React from 'react';
import { Button } from 'react-bootstrap';

interface ActionButtonsProps {
    handleSave: () => void;
    handleNextSet: () => void;
    handleDisabledSave: () => boolean;
    questionHead: string;
    questionTail: string;
    tailCompletion: string;
    currSet: number;
    filteredRowsLength: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    handleSave,
    handleNextSet,
    handleDisabledSave,
    questionHead,
    questionTail,
    tailCompletion,
    currSet,
    filteredRowsLength,
}) => {
    const isSaveVisible = questionHead.length > 0 && questionTail.length > 0;
    const isNextSetDisabled = !handleDisabledSave() || questionHead.length > 0 || tailCompletion.length > 0;

    return (
        <div className="tw-flex tw-w-full tw-justify-between tw-h-full">
            <Button
                onClick={handleSave}
                size="sm"
                disabled={handleDisabledSave()}
                variant="success"
                className={isSaveVisible ? "tw-w-fit tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg" : "tw-invisible"}
            >
                שמור והוסף שאלה
            </Button>
            {filteredRowsLength > 0 && (
                <Button
                    onClick={handleNextSet}
                    disabled={isNextSetDisabled}
                    size="sm"
                    variant="primary"
                    className="tw-w-fit tw-transition-all tw-duration-300 hover:tw-scale-[105%] hover:tw-drop-shadow-lg"
                >
                    {currSet < 29 ? "המשך לסט המשפטים הבא" : "סיים"}
                </Button>
            )}
        </div>
    );
};

export default ActionButtons; 
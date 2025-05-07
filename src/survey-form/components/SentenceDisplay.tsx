import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { SentenceSet } from '../../utils/api'; // Assuming SentenceSet type is exported from api.ts

interface SentenceDisplayProps {
    sentenceSets: SentenceSet[];
    currSet: number;
    boldedVerbsInds: number[];
    handleTextSelect: (e: React.MouseEvent<HTMLElement>) => void;
}

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
    sentenceSets,
    currSet,
    boldedVerbsInds,
    handleTextSelect,
}) => {
    const currentSetData = sentenceSets[currSet];
    const boldedVerb = currentSetData?.verbs[boldedVerbsInds[currSet]];
    const sentences = currentSetData?.sentences;

    // Helper function to highlight the verb in a sentence
    const highlightVerb = (sentence: string | undefined, verb: string | undefined): string => {
        if (!sentence || !verb) {
            return sentence || ""; // Return original sentence or empty string if undefined
        }
        try {
            // Escape the verb for safe regex creation
            const escapedVerb = verb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Create a regex to find the exact verb string globally.
            // Using capturing group ($1) ensures we replace with the exact matched string.
            const regex = new RegExp(`(${escapedVerb})`, 'g');
            // Replace found verb with <b>verb</b>
            return sentence.replace(regex, '<b>$1</b>');
        } catch (error) {
            console.error("Error creating regex for highlighting:", error);
            return sentence; // Return original sentence on error
        }
    };

    // Apply highlighting to the second sentence
    const highlightedSecondSentence = highlightVerb(sentences?.[1], boldedVerb);

    return (
        <>
            <div className="tw-pb-8">
                הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br></br> השאלות מנוסחות בזמן הווה אך
                מתייחסות גם לעתיד
                או עבר.
            </div>
            <Card
                className="bd tw-h-full tw-min-h-32 tw-p-4 tw-overflow-y-hidden tw-select-text"
                onMouseUp={handleTextSelect}
                style={{ backgroundColor: "inherit" }}
            >
                {sentenceSets.length === 0 || !sentences ? (
                    <div className="tw-flex tw-items-center tw-justify-center">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <div>
                        {/* Display first sentence as is */}
                        <span>{`${sentences[0]} `}</span>
                        {/* Display second sentence with highlighting */}
                        <span
                            className="tw-bg-lapis_lazuli-700 tw-bg-opacity-30"
                            dangerouslySetInnerHTML={{ __html: highlightedSecondSentence }}
                        ></span>
                        {/* Display third sentence as is */}
                        <span>{` ${sentences[2]}`}</span>
                    </div>
                )}
            </Card>
        </>
    );
};

export default SentenceDisplay; 
import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { SentenceSet } from '../../utils/api'; // Assuming SentenceSet type is exported from api.ts

interface SentenceDisplayProps {
    sentenceSets: SentenceSet[];
    currSet: number;
    boldedVerbsInds: number[];
    handleTextSelect: (e: React.MouseEvent<HTMLElement>) => void;
    loading?: boolean;
}

const SentenceDisplay: React.FC<SentenceDisplayProps> = ({
    sentenceSets,
    currSet,
    boldedVerbsInds,
    handleTextSelect,
    loading = false,
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

    const isLoading = loading || sentenceSets.length === 0 || !sentences;

    return (
        <>
            {isLoading ? (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255,255,255,0.85)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <Spinner animation="border" role="status" style={{ width: '5rem', height: '5rem' }} />
                    <div style={{ marginTop: '1.5rem', fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
                        טוען נתונים...
                    </div>
                </div>
            ) : (
                <>
                    <div className="tw-pb-8">
                        הרכיבו שאלה על ידי בחירת אלמנטים בשני התפריטים להלן.<br /> השאלות מנוסחות בזמן הווה אך
                        מתייחסות גם לעתיד
                        או עבר.
                    </div>
                    <Card
                        className="bd tw-h-full tw-min-h-32 tw-p-4 tw-overflow-y-hidden tw-select-text"
                        onMouseUp={handleTextSelect}
                        style={{ backgroundColor: "inherit" }}
                    >
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
                    </Card>
                </>
            )}
        </>
    );
};

export default SentenceDisplay; 
const baseUrl = "https://hujiresearch.azurewebsites.net/api"
export type SentenceSet = {
    id: string;
    sentences: string[];
    verbs: string[];
};

export type ParticipantAnswers = {
    id: string;
    sessionId: string;
    IMCAnswers: number[];
    AttentionAnswers: number[];
    answers: ParticipantAnswer[];
};

export type ParticipantAnswer = {
    sentenceSetId: string;
    first: string;
    second: string;
    third: string;
    verb: string;
    questions: Question[];
};

export type Question = {
    question: string;
    answer: string;
    followUp: string;
    followUpAnswer: string;
};

export class UploadError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = 'UploadError';
    }
}

export async function getSentenceSets(n: number): Promise<SentenceSet[]> {
    if (n <= 0) {
        return [];
    }
    const url = `${baseUrl}/sentences/?n=${n}`
    const ret = await fetch(url, {method: "GET", headers: {'Content-Type': 'application/json'}})
        .then((response) => response.json())
        .catch((error) => {
            console.log(error)
        });
    return ret
}

export async function uploadParticipantAnswers(answers: ParticipantAnswers, maxRetries: number = 3): Promise<boolean> {
    if (!answers.id || !answers.sessionId) {
        throw new UploadError('Missing required fields: id or sessionId');
    }

    if (!answers.answers || answers.answers.length === 0) {
        throw new UploadError('No answers provided');
    }

    const url = `${baseUrl}/answers/`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(answers)
            });

            if (response.status === 200) {
                // console.log(`Upload successful on attempt ${attempt}`);
                return true;
            }

            lastError = new UploadError(`Upload failed with status ${response.status}`, response.status);
            
            // If we get a 4xx error, don't retry as it's likely a client error
            if (response.status >= 400 && response.status < 500) {
                throw lastError;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error occurred');
            console.error(`Upload attempt ${attempt} failed:`, lastError);
            
            // Don't retry if it's a validation error
            if (error instanceof UploadError && error.message.includes('Missing required fields')) {
                throw error;
            }
        }
    }

    throw lastError || new UploadError('All upload attempts failed');
}



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

export async function uploadParticipantAnswers(answers: ParticipantAnswers) {
    const url = `${baseUrl}/answers/    `
    return await fetch(url, {method: "POST", mode: "no-cors", headers:{"Content-type": "application/json"}, body: JSON.stringify(answers)}).then((response)=> {
        console.log(response)
        return response.status === 200
    })
}



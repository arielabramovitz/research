// const baseUrl = "https://hujiresearch.azurewebsites.net/api"
const baseUrl = "http://localhost:7071/api"
export type SentenceSet = {
    id: string;
    sentences: string[];
    verbs: string[];
};

export type ParticipantAnswers = {
    id: string;
    answers: ParticipantAnswer[];
};

export type ParticipantAnswer = {
    sentenceSetId: string;
    sentences: string[];
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
    return await fetch(url, {method: "POST", mode: "no-cors", headers:{"Content-type": "application/json"}, body: JSON.stringify(answers)}).then((response)=>response.status===200)
}



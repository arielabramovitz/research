const baseUrl = "https://hujiresearch.azurewebsites.net/api"

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
    questions: AnswerPair[];
};

export type AnswerPair = {
    question: string;
    followUp: string;
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
    const url = `${baseUrl}/answers/${answers.id}`
    const prevAnswers = await fetch(url,{method: "GET"}).then((response)=> response.json())
    console.log(prevAnswers)
    // let body = answers;
    // if (prevAnswers) {
    //     // participant pid already exists, merge their previous answers into the new answers
    //     body = updateAnswers(prevAnswers, answers);
    // }
    // return await fetch(url, {method: "POST", headers:{'Content-Type': 'application/json'}, body: JSON.stringify(body)}).then((response)=>response.status===200)
}

// function test() {
//   const participantAnswers1: ParticipantAnswers = {
//     id: "1",
//     answers: [
//       {
//         sentenceSetId: "set1",
//         sentences: ["sentence1", "sentence2"],
//         questions: [{ question: "q1", followUp: "f1" }],
//       },
//       {
//         sentenceSetId: "set2",
//         sentences: ["sentence3"],
//         questions: [{ question: "q2", followUp: "f2" }],
//       },
//     ],
//   };

//   const participantAnswers2: ParticipantAnswers = {
//     id: "1",
//     answers: [
//       {
//         sentenceSetId: "set1",
//         sentences: ["sentence4"],
//         questions: [
//           { question: "q1", followUp: "f1" },
//           { question: "q3", followUp: "f3" },
//         ],
//       },
//       {
//         sentenceSetId: "set3",
//         sentences: ["sentence5"],
//         questions: [{ question: "q4", followUp: "f4" }],
//       },
//     ],
//   };

//   const mergedParticipantAnswers = updateAnswers(
//     participantAnswers1,
//     participantAnswers2
//   );

//   console.log("Merged Participant Answers:", mergedParticipantAnswers);
// }

// test();
async function test2() {
    const pid = "1"
    const participantAnswers: ParticipantAnswers = {
    id: pid,
    answers: [
      {
        sentenceSetId: "set1",
        sentences: ["sentence1", "sentence2"],
        questions: [{ question: "q1", followUp: "f1" }],
      },
      {
        sentenceSetId: "set2",
        sentences: ["sentence3"],
        questions: [{ question: "q2", followUp: "f2" }],
      },
    ],
  };
    const retStatus = await uploadParticipantAnswers(participantAnswers)
    console.log("Upload status:", retStatus)
}

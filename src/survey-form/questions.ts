type AttentionCheckQuestion = {
    question: string;
    possibleAnswers: string[],
    correctAnswerIndex: number
}

export const heads = [
    "",
    "מה",
    "מה לא",
    "מה אין",
    "מה איננה",
    "מה אינו",
    "למה",
];

export const tails = [
    {type: 0, tail: ""},
    {type: 1, tail: "אסור/מותר (לא)?"},
    {type: 2, tail: "נהוג/ראוי (לא)?"},
    {type: 3, tail: "עשוי (לא) לקרות להערכתו של מישהו?"},
    {type: 3, tail: "סביר ש(לא) יקרה להערכתו של מישהו?"},
    {type: 4, tail: "בכוונתו של מישהו (לא) לעשות?"},
    {type: 4, tail: "מטרתו של מישהו (שלא)?"},
    {type: 5, tail: "ברצונו של מישהו (שלא)?"},
    {type: 5, tail: "מתחשק למישהו (שלא)?"},
    {type: 6, tail: "הנסיבות מאפשרות (שלא)?"},
    {type: 6, tail: "הסיטואציה גורמת (שלא)?"},
    {type: 9, tail: "יתאפשר/יקרה (שלא) בהינתן...?"},
    {type: 7, tail: "ביכולתו/בכוחו של מישהו (שלא)?"},
    {type: 8, tail: "הייעוד של משהו/מישהו (שלא)?"},
    {type: 0, tail: "קרה/יקרה?"},
];

export const followUps = [
    "",
    "איזו מילה/מילים הובילו אותך לחשוב על מה שמותר/אסור?",
    "איזו מילה/מילים הובילו אותך לחשוב על מה שנהוג/ראוי?",
    "איזו מילה/מילים הובילו אותך לחשוב על הערכה?",
    "איזו מילה/מילים הובילו אותך לחשוב על כוונה או מטרה?",
    "איזו מילה/מילים הובילו אותך לחשוב על חשק או רצון?",
    "איזו מילה/מילים הובילו אותך לחשוב על נסיבות או סיטואציה?",
    "איזו מילה/מילים הובילו אותך לחשוב על יכולת?",
    "איזו מילה/מילים הובילו אותך לחשוב על ייעוד?",
    "איזו מילה/מילים הובילו אותך לחשוב על נסיבות או סיטואציה?",

];

export const IMCAttentionCheckQuestions: AttentionCheckQuestion[] = [
    {
        question: "עד כמה השאלה הקודמת היתה קשה? בחר/י \"מעט קשה\" להלן.",
        possibleAnswers: ["מדי קשה", "מעט קשה", "רמת קושי רגילה", "בכלל לא קשה"],
        correctAnswerIndex: 1
    },
    {
        question: "עד כמה השאלה הקודמת היתה קשה? בחר/י \"בכלל לא קשה\" להלן.",
        possibleAnswers: ["מדי קשה", "מעט קשה", "רמת קושי רגילה", "בכלל לא קשה"],
        correctAnswerIndex: 3
    },
    {
        question: "עד כמה השאלה הקודמת היתה קשה? בחר/י \"רמת קושי רגילה\" להלן.",
        possibleAnswers: ["מדי קשה", "מעט קשה", "רמת קושי רגילה", "בכלל לא קשה"],
        correctAnswerIndex: 2
    },
]

export const attentionCheckQuestions: AttentionCheckQuestion[] = [
    {
        question: "\"התרעננו\" זה פועל שקיים בעברית.",
        possibleAnswers: ["לא נכון", "נכון"],
        correctAnswerIndex: 1
    },
    {
        question: "\"התקצננתי\" זה פועל שקיים בעברית.",
        possibleAnswers: ["לא נכון", "נכון"],
        correctAnswerIndex: 0
    },
    {
        question: "\"הצטחקקו\" זה פועל שקיים בעברית.",
        possibleAnswers: ["לא נכון", "נכון"],
        correctAnswerIndex: 1
    },

]

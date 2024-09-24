import {Container, Form} from "react-bootstrap";
import {IMCAttentionCheckQuestions, attentionCheckQuestions} from "./questions.ts";

export function AttentionCheck(stage: number) {
    const questionSet = stage % 2 === 0 ? IMCAttentionCheckQuestions : attentionCheckQuestions
    const ind = Math.floor(stage / 2)
    return (
        <Container>
            <span>
                {questionSet[ind].question}
            </span>
            <Form.Control
                type="radio"

            >


            </Form.Control>
        </Container>
    );
}
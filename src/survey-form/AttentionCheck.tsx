import {Button, Container, Form, Modal} from "react-bootstrap";
import {IMCAttentionCheckQuestions, attentionCheckQuestions} from "./questions.ts";
import React, {useEffect, useState} from "react";
import { timedStorage } from '../utils/timedStorage';


interface AttentionCheckProps {
    handleAttentionCheck: (num: number) => void
    showAlertnessModal: boolean
    currSet: number
    hideSurvey: boolean
}

export function AttentionCheck({
                                   currSet,
                                   showAlertnessModal,
                                   handleAttentionCheck,
                                    hideSurvey
                               }: AttentionCheckProps) {
    const [currQuestion, setCurrQuestion] = useState<number>(0)
    const [chosenAnswer, setChosenAnswer] = useState<string>("")
    const questionSet = currQuestion % 2 === 0 ? IMCAttentionCheckQuestions : attentionCheckQuestions

    useEffect(()=>{
        const curr = timedStorage.get("currQuestion");
        if(curr !== null && curr !== undefined){
            setCurrQuestion(parseInt(curr))
        }
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChosenAnswer(e.target.value)
    }

    const handleSubmit = () => {
        handleAttentionCheck(parseInt(chosenAnswer))
        setCurrQuestion(prev=>prev+1)
        timedStorage.set("currQuestion", (currQuestion+1).toString(), 15 * 60 * 1000)
        setChosenAnswer("")
    }

    return (
        <Modal
            animation={false}
            show={showAlertnessModal && !hideSurvey}
            centered={true}
            backdrop="static"
            keyboard={false}
            autoFocus={true}
            className="tw-select-none"
        >
            <Container className="tw-flex tw-flex-col tw-text-center">

                <Container className="tw-h-32 tw-flex tw-items-center">
                    <Container className=" tw-items-center tw-font-bold ">
                        {questionSet[Math.floor(currQuestion / 2)]?.question||""}
                    </Container>
                </Container>
                <Container className="tw-flex tw-flex-col">
                    <Container className="tw-flex tw-justify-between">
                        {questionSet[Math.floor(currQuestion / 2)]?.possibleAnswers?.map((option, index) =>

                            <div key={index} className="tw-flex tw-flex-col tw-items-center">
                                <Form.Check
                                    type="radio"
                                    value={index}
                                    onChange={handleChange}
                                    checked={chosenAnswer === `${index}`}
                                    id={`radio${index}`}
                                    name="group1"
                                    className=""
                                />
                                <label htmlFor={`radio${index}`}>{option||""}</label>
                            </div>
                        )}
                    </Container>

                    <Button
                        className="tw-my-4"
                        variant="light"
                        onClick={handleSubmit}
                    >
                        אישור
                    </Button>
                </Container>
            </Container>
        </Modal>

    );
}

export default AttentionCheck
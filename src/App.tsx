import React, {CSSProperties, ReactNode, useEffect, useState} from "react"
import './App.css'
import ExamplesTab from './examples-tab'
import InstructionsTab from './instructions-tab'
import SurveyForm from './survey-form'
import {Container, Row, Modal} from 'react-bootstrap'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { timedStorage } from './utils/timedStorage';


interface CustomDivProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    contentClassName?: string
}

const CustomDiv = ({children, className, style, contentClassName}: CustomDivProps) => {
    return (
        <div className={`${contentClassName} ${className}`} style={style}>
            {children}
        </div>
    )
}

function App() {
    const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(true)
    const [showExamplesModal, setShowExamplesModal] = useState<boolean>(false)
    const [hideSurvey, setHideSurvey] = useState<boolean>(true)

    useEffect(()=>{
        setHideSurvey(showExamplesModal||showInstructionsModal)
    },[showExamplesModal, showInstructionsModal])

    useEffect(() => {
        const readInstruction = timedStorage.get('showInstructions')
        const readExamples = timedStorage.get('showExamples')

        if (readInstruction) {
            setShowInstructionsModal(readInstruction === 'true')
        }
        if (readExamples) {
            setShowExamplesModal(readExamples === 'true')
        }
        setHideSurvey(showExamplesModal||showInstructionsModal)
    }, [])

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <Container fluid
                               className={showInstructionsModal || showExamplesModal ? "tw-blur " : "" + 'tw-flex tw-flex-col tw-w-full tw-h-full tw-px-12 tw-py-10 '}>

                        <Modal dialogAs={CustomDiv} show={showInstructionsModal&&!showExamplesModal} center="" backdrop="static"
                               fullscreen="true"
                               className={"tw-h-fit"}>
                            <Modal.Body className="tw-px-12 tw-w-full tw-py-8">
                                <Row className="tw-h-fit">
                                    <InstructionsTab {...{
                                        showInstructionsModal,
                                        setShowInstructionsModal,
                                        setShowExamplesModal
                                    }} ></InstructionsTab>
                                </Row>
                            </Modal.Body>
                        </Modal>
                        <Modal dialogAs={CustomDiv} show={!showInstructionsModal&&showExamplesModal} center=""
                               backdrop="static" fullscreen="true"
                               className={""} scrollable={true}>
                            <Modal.Body className=" tw-px-12 tw-w-full tw-py-8">
                                <Row className="tw-h-fit">
                                    <InstructionsTab {...{
                                        showInstructionsModal,
                                        setShowInstructionsModal,
                                        setShowExamplesModal
                                    }} ></InstructionsTab>
                                </Row>
                                <Row className={"tw-h-fit "}>
                                    <ExamplesTab {...{showExamplesModal, setShowExamplesModal}}></ExamplesTab>
                                </Row>
                            </Modal.Body>
                        </Modal>

                        <Row className={showInstructionsModal ? "tw-invisible" : "" + " tw-h-fit"}>
                            <InstructionsTab {...{
                                showInstructionsModal,
                                setShowInstructionsModal,
                                setShowExamplesModal
                            }} ></InstructionsTab>
                        </Row>

                        <Row className={showExamplesModal ? "tw-invisible" : "" + " tw-h-fit"}>
                            <ExamplesTab {...{showExamplesModal, setShowExamplesModal}}></ExamplesTab>
                        </Row>
                        <Row className={showExamplesModal||showInstructionsModal ? "tw-invisible" : "" + " tw-h-full tw-mb-8:important"}>
                            <SurveyForm hideSurvey={hideSurvey}></SurveyForm>
                        </Row>

                    </Container>
                }/>

            </Routes>
        </Router>
    )
}

export default App

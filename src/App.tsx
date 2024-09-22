import React, {CSSProperties, ReactNode, useEffect, useState} from "react"
import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'
import SurveyForm from './components/survey-form'
import {Container, Row, Modal, ModalDialog} from 'react-bootstrap'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";


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
    const [showModal, setShowModal] = useState<boolean>(true)

    useEffect(() => {
        const readInstruction = sessionStorage.getItem('readInstructions')
        if (readInstruction) {
            setShowModal(false)
        }
    }, [])

    return (

        <Router>
            <Routes>
                <Route path="/" element={
                    <Container fluid
                               className={showModal ? "tw-blur " : "" + 'tw-flex tw-flex-col tw-grow tw-w-full tw-h-full tw-px-12 tw-pt-10 '}>

                        <Modal dialogAs={CustomDiv} show={showModal} center="" backdrop="static" fullscreen="true"
                               className={"tw-h-fit"}>
                            <Modal.Body className="tw-px-12 tw-w-full tw-py-8">
                                <Row className="tw-h-fit">
                                    <InstructionsTab {...{showModal, setShowModal}} ></InstructionsTab>
                                </Row>
                            </Modal.Body>
                        </Modal>

                        <Row className={showModal ? "tw-invisible" : "" + " tw-h-fit"}>
                            <InstructionsTab {...{showModal, setShowModal}} ></InstructionsTab>
                        </Row>

                        <Row className={"tw-h-fit "}>
                            <ExamplesTab></ExamplesTab>
                        </Row>
                        <Row className="tw-h-full">
                            <SurveyForm></SurveyForm>
                        </Row>
                    </Container>
                }/>

            </Routes>
        </Router>
    )
}

export default App

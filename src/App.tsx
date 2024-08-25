import React from "react"
import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'
import SurveyForm from './components/survey-form'
import { Container, Row } from 'react-bootstrap'


function App() {

  return (
    <Container fluid className='tw-flex tw-flex-col tw-grow tw-w-full tw-h-full tw-px-12 tw-pt-8'>
      <Row className="tw-h-fit">
        <InstructionsTab></InstructionsTab>
      </Row>
      <Row className="tw-h-fit">
        <ExamplesTab></ExamplesTab>
      </Row>
      <Row className="tw-h-full">
        <SurveyForm></SurveyForm>
      </Row>
    </Container>
  )
}

export default App

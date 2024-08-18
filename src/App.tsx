import React from "react"
import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'
import SurveyForm from './components/survey-form'
import { Container, Row } from 'react-bootstrap'


function App() {

  return (
    <Container fluid className='tw-flex tw-flex-col tw-h-full tw-px-12 tw-py-8'>
      <Row>
        <InstructionsTab></InstructionsTab>
      </Row>
      <Row className="">
        <ExamplesTab></ExamplesTab>
      </Row>
      <Row className="">
        <SurveyForm></SurveyForm>
      </Row>
    </Container>
  )
}

export default App

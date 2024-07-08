import React from "react"
import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'
import SurveyForm from './components/survey-form'
import { Container, Row } from 'react-bootstrap'


function App() {

  return (
    <Container fluid className='tw-px-16 tw-pt-4'>
      <Row>
        <InstructionsTab></InstructionsTab>
      </Row>
      <Row>
        <ExamplesTab></ExamplesTab>
      </Row>
      <Row>
        <SurveyForm></SurveyForm>
      </Row>
    </Container>
  )
}

export default App

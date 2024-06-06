import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'
import SurveyForm from './components/survey-form'

function App() {

  return (
    <div className='flex flex-col h-screen max-w-full p-8 select-none'>
      <InstructionsTab></InstructionsTab>
      <ExamplesTab></ExamplesTab>
      <SurveyForm></SurveyForm>
    </div>
  )
}

export default App

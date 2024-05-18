import './App.css'
import ExamplesTab from './components/examples-tab'
import InstructionsTab from './components/instructions-tab'

function App() {

  return (
    <div className='flex-1 max-w-full p-8'>
      <InstructionsTab></InstructionsTab>
      <ExamplesTab></ExamplesTab>
    </div>
  )
}

export default App

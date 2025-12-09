import PricingCalculator from './components/PricingCalculator';
import { defaultPricingConfig } from './config/pricingConfig';
import './App.css'

function App() {
  return (
    <div className="App">
      <PricingCalculator config={defaultPricingConfig} />
    </div>
  )
}

export default App


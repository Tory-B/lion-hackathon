import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AnalysisProgress from './pages/AnalysisProgress'
import DiagnosisResult from './pages/DiagnosisResult'
import Payment from './pages/Payment'
import Questionnaire from './pages/Questionnaire'
import Report from './pages/Report'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/analyze/:id/progress" element={<AnalysisProgress />} />
      <Route path="/analyze/:id/result" element={<DiagnosisResult />} />
      <Route path="/analyze/:id/payment" element={<Payment />} />
      <Route path="/analyze/:id/questionnaire" element={<Questionnaire />} />
      <Route path="/analyze/:id/report" element={<Report />} />
    </Routes>
  )
}

export default App

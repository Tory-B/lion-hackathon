import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ItemInput from './pages/ItemInput'
import AnalysisProgress from './pages/AnalysisProgress'
import RiskResult from './pages/RiskResult'
import EvidenceDetail from './pages/EvidenceDetail'
import HypothesesList from './pages/HypothesesList'
import QuestionnaireGenerate from './pages/QuestionnaireGenerate'
import QuestionnaireResult from './pages/QuestionnaireResult'
import VerificationInput from './pages/VerificationInput'
import VerificationResult from './pages/VerificationResult'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Dashboard />} />
      <Route path="/analyze/new" element={<ItemInput />} />
      <Route path="/analyze/:id/progress" element={<AnalysisProgress />} />
      <Route path="/analyze/:id/result" element={<RiskResult />} />
      <Route path="/analyze/:id/evidence" element={<EvidenceDetail />} />
      <Route path="/analyze/:id/hypotheses" element={<HypothesesList />} />
      <Route path="/analyze/:id/questionnaire/new" element={<QuestionnaireGenerate />} />
      <Route path="/analyze/:id/questionnaire/:qid" element={<QuestionnaireResult />} />
      <Route path="/analyze/:id/verify" element={<VerificationInput />} />
      <Route path="/analyze/:id/verify/result" element={<VerificationResult />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App

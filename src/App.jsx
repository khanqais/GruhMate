import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/DashBoard'
import StockForm from './components/StockForm'
import ForgotPassword from './components/ForgotPassword'
import Compare from './components/Compare'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='forgotpwd' element={<ForgotPassword />}/>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/stockform' element={<StockForm />}/>
        <Route path='/compare' element={<Compare />}/>
        
        {/* Other routes will be added later */}
      </Routes>
    </Router>
  )
}

export default App
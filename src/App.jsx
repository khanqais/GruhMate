import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Dashboard from './components/DashBoard'
import StockForm from './components/StockForm'
import ForgotPassword from './components/ForgotPassword'
import Teams from './components/Teams'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute, PrivateRoute } from './routes/Guards'
import Home from './pages/Home'
import GroceryPage from './pages/GroceryPage'
import { TechPage } from './pages/TechPage'
import BuyList from './components/BuyList'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import TeamDetail from './components/TeamDetail'
import NutritionDashboard from './components/NutritionDashboard'
import Profile from "./pages/Profile";
import { StockProvider } from './context/StockContext'


function App() {
  return (
    <AuthProvider>
      <StockProvider>
      <Router>
        <ToastContainer
          position="bottom-right"
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
        />

        <Routes>
<Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpwd" element={<ForgotPassword />} />

          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/tech" element={<TechPage />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/buylist" element={<PrivateRoute><BuyList /></PrivateRoute>} />
          <Route path="/stockform" element={<PrivateRoute><StockForm /></PrivateRoute>} />
          <Route path="/compare" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/team/:teamId" element={<PrivateRoute><TeamDetail /></PrivateRoute>} />
          <Route path="/nutrition" element={<PrivateRoute><NutritionDashboard /></PrivateRoute>}/>

        </Routes>
      </Router>
      </StockProvider>
    </AuthProvider>
  )
}

export default App

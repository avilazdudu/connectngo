import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Cadastro from '../pages/Cadastro'
import Sobre from '../pages/Sobre'
import DoadorDashboard from '../pages/DoadorDashboard'
import DoadorOngs from '../pages/DoadorOngs'
import OngDashboard from '../pages/OngDashboard'
import OngMarketplace from '../pages/OngMarketplace'
import EmpresaDashboard from '../pages/EmpresaDashboard'
import Perfil from '../pages/Perfil'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/doador/dashboard" element={<DoadorDashboard />} />
      <Route path="/doador/ongs" element={<DoadorOngs />} />
      <Route path="/ong/dashboard" element={<OngDashboard />} />
      <Route path="/ong/marketplace" element={<OngMarketplace />} />
      <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
      <Route path="/perfil/:id" element={<Perfil />} />
    </Routes>
  )
}

export default AppRoutes
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
import EmpresaProdutos from '../pages/EmpresaProdutos'
import Perfil from '../pages/Perfil'
import Feed from '../pages/Feed'
import ComprarCreditos from '../pages/ComprarCreditos'
import SobreNos from '../pages/SobreNos'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/sobre-nos" element={<SobreNos />} />
      <Route path="/doador/dashboard" element={<DoadorDashboard />} />
      <Route path="/doador/ongs" element={<DoadorOngs />} />
      <Route path="/doador/creditos" element={<ComprarCreditos />} />
      <Route path="/ong/dashboard" element={<OngDashboard />} />
      <Route path="/ong/marketplace" element={<OngMarketplace />} />
      <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
      <Route path="/empresa/produtos" element={<EmpresaProdutos />} />
      <Route path="/perfil/:id" element={<Perfil />} />
      <Route path="/feed" element={<Feed />} />
    </Routes>
  )
}

export default AppRoutes
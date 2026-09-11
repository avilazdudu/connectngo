import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useAuth } from '../context/AuthContext'

const dashboardPorTipo = {
  doador: '/doador/dashboard',
  ong: '/ong/dashboard',
  empresa: '/empresa/dashboard',
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  const links = [
    { label: 'Início', to: '/' },
    { label: 'Sobre Nós', to: '/sobre-nos' },
    { label: 'Sobre', to: '/sobre' },
    ...(isAuthenticated && user?.tipo !== 'empresa'
      ? [{ label: 'Mural', to: '/feed' }]
      : []),
  ]

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuUsuarioAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  function handleSair() {
    logout()
    setMenuOpen(false)
    setMenuUsuarioAberto(false)
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-green-500">
              ConnectNGO
            </span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-green-700 hover:underline underline-offset-4 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuUsuarioAberto((v) => !v)}
                >
                  Menu ▾
                </Button>

                {menuUsuarioAberto && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-2 flex flex-col">
                    <span className="px-4 py-1.5 text-xs text-gray-400">
                      Olá, {user.nome?.split(' ')[0]}
                    </span>
                    <Link
                      to={dashboardPorTipo[user.tipo] || '/'}
                      onClick={() => setMenuUsuarioAberto(false)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      Meu painel
                    </Link>
                    {user.tipo === 'doador' && (
                      <Link
                        to="/doador/creditos"
                        onClick={() => setMenuUsuarioAberto(false)}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                      >
                        Adquirir créditos
                      </Link>
                    )}
                    <button
                      onClick={handleSair}
                      className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Botão hamburguer mobile */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-green-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-3 pb-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-gray-600 hover:text-green-700 hover:underline underline-offset-4 font-medium py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPorTipo[user.tipo] || '/'} onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" fullWidth>
                      Olá, {user.nome?.split(' ')[0]}
                    </Button>
                  </Link>
                  {user.tipo === 'doador' && (
                    <Link to="/doador/creditos" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" size="sm" fullWidth>
                        Adquirir créditos
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" fullWidth onClick={handleSair}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" fullWidth>
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>
                      Cadastrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

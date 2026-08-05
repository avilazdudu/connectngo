import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <span className="text-xl font-extrabold text-white">
            Connect<span className="text-green-400">NGO</span>
          </span>
          <p className="mt-2 text-sm text-gray-400">
            Conectando doadores, ONGs e empresas para gerar impacto social real.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                Início
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-green-400 transition-colors">
                Sobre
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-green-400 transition-colors">
                Entrar
              </Link>
            </li>
            <li>
              <Link to="/cadastro" className="hover:text-green-400 transition-colors">
                Cadastrar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contato</h4>
          <p className="text-sm text-gray-400">contato@connectngo.com</p>
          <p className="text-sm text-gray-400 mt-1">São Paulo, Brasil</p>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ConnectNGO. Todos os direitos reservados.
      </div>
    </footer>
  )
}

export default Footer
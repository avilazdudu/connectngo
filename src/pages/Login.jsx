import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Navbar, Footer, Input, Button, Badge } from '../components'
import { useAuth } from '../context/AuthContext'

const dashboardPorTipo = {
  doador: '/doador/dashboard',
  ong: '/ong/dashboard',
  empresa: '/empresa/dashboard',
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSubmitting(true)

    try {
      const resultado = await login(email.trim().toLowerCase())

      if (!resultado.success) {
        setErro(resultado.message)
        return
      }

      const destino = dashboardPorTipo[resultado.user.tipo] || '/'
      navigate(destino)
    } catch (err) {
      setErro('Ocorreu um erro ao tentar entrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <Badge variant="success" className="mb-3">Bem-vindo de volta</Badge>
            <h1 className="text-2xl font-bold text-gray-800">Entrar no ConnectNGO</h1>
            <p className="text-sm text-gray-500 mt-1">
              Acesse sua conta de doador, ONG ou empresa parceira.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: maria@example.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />

            {erro && (
              <p className="text-sm text-red-500 -mt-2">{erro}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-green-700 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Login
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Navbar, Footer, Input, Button, Badge, ProfileTypeSelector } from '../components'
import { useAuth } from '../context/AuthContext'

const dashboardPorTipo = {
  doador: '/doador/dashboard',
  ong: '/ong/dashboard',
  empresa: '/empresa/dashboard',
}

const categoriasOng = [
  'Assistência Social',
  'Educação',
  'Saúde',
  'Meio Ambiente',
  'Segurança Alimentar',
  'Direitos Humanos',
]

const segmentosEmpresa = [
  'Varejo',
  'Tecnologia',
  'Alimentação',
  'Serviços',
  'Indústria',
  'Outro',
]

function Cadastro() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [tipo, setTipo] = useState('doador')
  const [erro, setErro] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cnpj: '',
    categoria: categoriasOng[0],
    descricao: '',
    segmento: segmentosEmpresa[0],
  })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSubmitting(true)

    try {
      const dados = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        tipo,
        ...(tipo === 'ong' && {
          cnpj: form.cnpj.trim(),
          categoria: form.categoria,
          descricao: form.descricao.trim(),
        }),
        ...(tipo === 'empresa' && {
          cnpj: form.cnpj.trim(),
          segmento: form.segmento,
        }),
      }

      const resultado = await register(dados)

      if (!resultado.success) {
        setErro(resultado.message)
        return
      }

      const destino = dashboardPorTipo[resultado.user.tipo] || '/'
      navigate(destino)
    } catch (err) {
      setErro('Erro ao processar cadastro. Verifique a conexão e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <Badge variant="info" className="mb-3">Crie sua conta</Badge>
            <h1 className="text-2xl font-bold text-gray-800">Junte-se ao ConnectNGO</h1>
            <p className="text-sm text-gray-500 mt-1">
              Escolha seu perfil e comece a gerar impacto.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de perfil
            </label>
            <ProfileTypeSelector value={tipo} onChange={setTipo} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={tipo === 'ong' ? 'Nome da ONG' : tipo === 'empresa' ? 'Nome da empresa' : 'Nome completo'}
              name="nome"
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Digite o nome"
              required
            />

            <Input
              label="E-mail"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              placeholder="••••••••"
            />

            {/* Campos institucionais: ONG */}
            {tipo === 'ong' && (
              <div className="flex flex-col gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Dados institucionais
                </p>

                <Input
                  label="CNPJ"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área de atuação
                  </label>
                  <select
                    value={form.categoria}
                    onChange={(e) => handleChange('categoria', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 bg-white"
                  >
                    {categoriasOng.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Missão da ONG
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    placeholder="Descreva a missão e o propósito da organização"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 resize-none bg-white"
                    required
                  />
                </div>
              </div>
            )}

            {/* Campos institucionais: Empresa */}
            {tipo === 'empresa' && (
              <div className="flex flex-col gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Dados da empresa
                </p>

                <Input
                  label="CNPJ"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0001-00"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segmento de atuação
                  </label>
                  <select
                    value={form.segmento}
                    onChange={(e) => handleChange('segmento', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                  >
                    {segmentosEmpresa.map((seg) => (
                      <option key={seg} value={seg}>
                        {seg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {erro && <p className="text-sm text-red-500 -mt-2">{erro}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? 'Cadastrando...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-green-700 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Cadastro
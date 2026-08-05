import { Navbar, Footer, Badge, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { useTransacoes } from '../context/TransacoesContext'
import { Link } from 'react-router-dom'

function DoadorDashboard() {
  const { user } = useAuth()
  const { getSaldoAtual, getHistoricoPorUsuario, ongs } = useTransacoes()

  const saldo = getSaldoAtual(user)
  const historico = getHistoricoPorUsuario(user?.id).filter(
    (t) => t.tipo === 'doacao'
  )

  const totalDoado = historico.reduce((soma, t) => soma + t.valor, 0)
  const ongsApoiadas = new Set(historico.map((t) => t.destino)).size

  function getNomeOng(id) {
    return ongs.find((o) => o.id === id)?.nome || 'ONG'
  }

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Badge variant="success" className="mb-2">Painel do Doador</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Olá, {user?.nome?.split(' ')[0] || 'Doador'} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe seu saldo, suas doações e o impacto que você já gerou.
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Saldo de créditos</p>
            <p className="text-2xl font-extrabold text-green-700">{saldo}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Total doado</p>
            <p className="text-2xl font-extrabold text-blue-700">{totalDoado}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">ONGs apoiadas</p>
            <p className="text-2xl font-extrabold text-gray-800">{ongsApoiadas}</p>
          </div>
        </div>

        {/* Indicador de impacto */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-10 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm opacity-90">Seu impacto gerado</p>
            <p className="text-xl font-bold">
              Você já contribuiu com {totalDoado} créditos para {ongsApoiadas}{' '}
              {ongsApoiadas === 1 ? 'organização' : 'organizações'} 💚
            </p>
          </div>
          <Link to="/doador/ongs">
            <Button
              variant="outline"
              className="bg-white border-white text-green-700 hover:bg-green-50 whitespace-nowrap"
            >
              Doar agora
            </Button>
          </Link>
        </div>

        {/* Histórico de doações */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Histórico de doações
          </h2>

          {historico.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              Você ainda não fez nenhuma doação.{' '}
              <Link to="/doador/ongs" className="text-green-700 font-medium hover:underline">
                Explore as ONGs
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">ONG</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((t) => (
                    <tr key={t.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-800">
                        {getNomeOng(t.destino)}
                      </td>
                      <td className="px-4 py-3 text-green-700 font-semibold">
                        {t.valor} créditos
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(t.data).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default DoadorDashboard
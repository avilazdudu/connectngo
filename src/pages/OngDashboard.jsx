import { Navbar, Footer, Badge } from '../components'
import { useAuth } from '../context/AuthContext'
import { useTransacoes } from '../context/TransacoesContext'
import { Link } from 'react-router-dom'
import usuariosData from '../data/usuarios.json'

function OngDashboard() {
  const { user } = useAuth()
  const { ongs, transacoes, getApoiadoresPorOng } = useTransacoes()

  const ong = ongs.find((o) => o.id === user?.id)
  const apoiadores = getApoiadoresPorOng(user?.id)

  const historico = transacoes.filter(
    (t) => t.origem === user?.id || t.destino === user?.id
  )

  function getNomeDoador(id) {
    return usuariosData.find((u) => u.id === id)?.nome || 'Doador'
  }

  function getDescricaoTransacao(t) {
    if (t.tipo === 'doacao') {
      return `Doação recebida de ${getNomeDoador(t.origem)}`
    }
    if (t.tipo === 'resgate') {
      return 'Resgate de produto no marketplace'
    }
    return 'Transação'
  }

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Badge variant="success" className="mb-2">Painel da ONG</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {ong?.nome || user?.nome}
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe os créditos recebidos, seus apoiadores e o histórico de movimentações.
          </p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Créditos recebidos</p>
            <p className="text-2xl font-extrabold text-green-700">
              {ong?.creditosRecebidos ?? 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Doadores únicos</p>
            <p className="text-2xl font-extrabold text-blue-700">
              {apoiadores.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Beneficiários atendidos</p>
            <p className="text-2xl font-extrabold text-gray-800">
              {ong?.beneficiarios ?? 0}
            </p>
          </div>
        </div>

        {/* CTA marketplace */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-10 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm opacity-90">Use seus créditos</p>
            <p className="text-xl font-bold">
              Resgate produtos e serviços de empresas parceiras
            </p>
          </div>
          <Link
            to="/ong/marketplace"
            className="bg-white text-green-700 font-semibold px-5 py-2 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            Ir para o Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de apoiadores */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Apoiadores / Doadores
            </h2>

            {apoiadores.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500">
                Nenhum apoiador ainda.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {apoiadores.map((apoiador) => (
                  <div
                    key={apoiador.doadorId}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-gray-800 font-medium">
                      {getNomeDoador(apoiador.doadorId)}
                    </span>
                    <span className="text-green-700 font-semibold text-sm">
                      {apoiador.total} créditos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de transações */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Histórico de transações
            </h2>

            {historico.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500">
                Nenhuma transação registrada ainda.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {historico.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-800">{getDescricaoTransacao(t)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        t.tipo === 'doacao' ? 'text-green-700' : 'text-red-500'
                      }`}
                    >
                      {t.tipo === 'doacao' ? '+' : '-'}
                      {t.valor}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default OngDashboard
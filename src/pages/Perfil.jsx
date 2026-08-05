import { useParams, Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button, MetricCard, TransparenciaItem, ProgressBar } from '../components'
import { useTransacoes } from '../context/TransacoesContext'
import usuariosData from '../data/usuarios.json'

function Perfil() {
  const { id } = useParams()
  const { ongs, getHistoricoPorUsuario, getProdutoEEmpresa } = useTransacoes()

  const ong = ongs.find((o) => o.id === id)

  const historico = getHistoricoPorUsuario(ong.id)
  const doacoesRecebidas = historico.filter((t) => t.tipo === 'doacao')
  const resgatesFeitos = historico.filter((t) => t.tipo === 'resgate')

  const totalDoado = doacoesRecebidas.reduce((soma, t) => soma + t.valor, 0)
  const totalResgatado = resgatesFeitos.reduce((soma, t) => soma + t.valor, 0)
  const doadoresUnicos = new Set(doacoesRecebidas.map((t) => t.origem)).size

  const gastosPorEmpresa = resgatesFeitos.reduce((acc, t) => {
    const info = getProdutoEEmpresa(t.destino)
    const chave = info ? info.empresa.nome : 'Desconhecido'
    acc[chave] = (acc[chave] || 0) + t.valor
    return acc
  }, {})

  const gastosArray = Object.entries(gastosPorEmpresa)
    .map(([empresa, valor]) => ({ empresa, valor }))
    .sort((a, b) => b.valor - a.valor)


  return (
    <>
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Relatório de transparência
          </h2>
          <Badge variant="neutral">{linhaDoTempo.length} movimentações</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Acompanhe a origem e o destino de cada crédito recebido por esta organização.
        </p>

        {gastosArray.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Destino dos créditos investidos
            </h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
              {gastosArray.map(({ empresa, valor }) => {
                const percentual = totalResgatado > 0
                  ? Math.round((valor / totalResgatado) * 100)
                  : 0
                return (
                  <div key={empresa}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{empresa}</span>
                      <span className="text-gray-500">
                        {valor} créditos ({percentual}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={valor}
                      max={totalResgatado}
                      showPercentage={false}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {linhaDoTempo.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhuma movimentação registrada até o momento.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {linhaDoTempo.map((item) => (
              <TransparenciaItem
                key={item.id}
                tipo={item.tipo}
                titulo={item.titulo}
                valor={item.valor}
                data={item.data}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Créditos recebidos (doações)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Créditos investidos (resgates)
          </div>
        </div>
      </section>

    </>
  )
}

export default Perfil
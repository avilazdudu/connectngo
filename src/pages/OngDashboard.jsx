import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function OngDashboard() {
  const { user } = useAuth()

  const [ong, setOng] = useState(null)
  const [apoiadores, setApoiadores] = useState([])
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDadosOng() {
      if (!user?.id) return
      setLoading(true)

      try {
        // 1. Carrega os dados específicos da ONG (créditos, beneficiários)
        const { data: ongData, error: erroOng } = await supabase
          .from('ongs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (erroOng) console.error('Erro ao buscar dados da ONG:', erroOng.message)
        if (ongData) setOng(ongData)

        // 2. Busca todas as transações onde a ONG é a destinatária ou a origem (repasse/resgate)
        const { data: transacoesData, error: erroTransacoes } = await supabase
          .from('transacoes')
          .select('*')
          .or(`destino_usuario_id.eq.${user.id},origem.eq.${user.id}`)
          .order('data', { ascending: false })

        if (erroTransacoes) {
          console.error('Erro ao buscar transações:', erroTransacoes.message)
          return
        }

        const transacoes = transacoesData || []

        // 3. Coleta os IDs de doadores para buscar os nomes na tabela usuarios
        const doadoresIds = [
          ...new Set(
            transacoes
              .filter((t) => t.tipo === 'doacao' && t.origem)
              .map((t) => t.origem)
          ),
        ]

        let mapaNomes = new Map()
        if (doadoresIds.length > 0) {
          const { data: usuariosData } = await supabase
            .from('usuarios')
            .select('id, nome')
            .in('id', doadoresIds)

          if (usuariosData) {
            mapaNomes = new Map(usuariosData.map((u) => [u.id, u.nome]))
          }
        }

        // 4. Monta a lista formatada do histórico
        const transacoesFormatadas = transacoes.map((t) => ({
          ...t,
          nomeOrigem: mapaNomes.get(t.origem) || 'Doador Anônimo',
        }))
        setHistorico(transacoesFormatadas)

        // 5. Agrupa e calcula o total por apoiador único
        const acumuladorApoiadores = {}
        transacoes
          .filter((t) => t.tipo === 'doacao' && t.destino_usuario_id === user.id)
          .forEach((t) => {
            if (!acumuladorApoiadores[t.origem]) {
              acumuladorApoiadores[t.origem] = {
                doadorId: t.origem,
                nome: mapaNomes.get(t.origem) || 'Doador',
                total: 0,
              }
            }
            acumuladorApoiadores[t.origem].total += Number(t.valor) || 0
          })

        setApoiadores(Object.values(acumuladorApoiadores))
      } catch (err) {
        console.error('Erro ao carregar dashboard da ONG:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosOng()
  }, [user])

  function getDescricaoTransacao(t) {
    if (t.tipo === 'doacao') {
      return `Doação recebida de ${t.nomeOrigem}`
    }
    if (t.tipo === 'resgate') {
      return 'Resgate de produto no marketplace'
    }
    if (t.tipo === 'repasse') {
      return 'Repasse de créditos'
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
            {user?.nome || 'Minha ONG'}
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
              {loading ? '...' : ong?.creditos_recebidos ?? 0}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Doadores únicos</p>
            <p className="text-2xl font-extrabold text-blue-700">
              {loading ? '...' : apoiadores.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Beneficiários atendidos</p>
            <p className="text-2xl font-extrabold text-gray-800">
              {loading ? '...' : ong?.beneficiarios ?? 0}
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
            className="bg-white text-green-700 font-semibold px-5 py-2 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap text-center"
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

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
                Carregando apoiadores...
              </div>
            ) : apoiadores.length === 0 ? (
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
                      {apoiador.nome}
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

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
                Carregando histórico...
              </div>
            ) : historico.length === 0 ? (
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
                        {t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-'}
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
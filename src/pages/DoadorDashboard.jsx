import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function DoadorDashboard() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [transacoes, setTransacoes] = useState([])
  const [badges, setBadges] = useState([])
  const [mapaNomes, setMapaNomes] = useState(new Map())

  useEffect(() => {
    async function carregarDashboard() {
      if (!user?.id) return
      setLoading(true)

      try {
        // 1. Buscar transações do doador (doações e resgates)
        const { data: transacoesData, error: erroTransacoes } = await supabase
          .from('transacoes')
          .select('*')
          .eq('origem', user.id)
          .order('data', { ascending: false })

        if (erroTransacoes) throw erroTransacoes

        const listaTransacoes = transacoesData || []
        setTransacoes(listaTransacoes)

        // 2. Coletar IDs de destinos para buscar nomes (ONGs, usuários ou produtos)
        const ongIds = [
          ...new Set(
            listaTransacoes
              .filter((t) => t.destino_usuario_id)
              .map((t) => t.destino_usuario_id)
          ),
        ]
        const produtoIds = [
          ...new Set(
            listaTransacoes
              .filter((t) => t.destino_produto_id)
              .map((t) => t.destino_produto_id)
          ),
        ]

        const [resUsuarios, resProdutos, resBadges] = await Promise.all([
          ongIds.length > 0
            ? supabase.from('usuarios').select('id, nome').in('id', ongIds)
            : { data: [] },
          produtoIds.length > 0
            ? supabase.from('produtos').select('id, nome').in('id', produtoIds)
            : { data: [] },
          supabase.from('badges').select('*'),
        ])

        // Cria o mapa de identificadores para nomes legíveis
        const nomesMap = new Map()
        resUsuarios.data?.forEach((u) => nomesMap.set(`user_${u.id}`, u.nome))
        resProdutos.data?.forEach((p) => nomesMap.set(`prod_${p.id}`, p.nome))
        setMapaNomes(nomesMap)

        if (resBadges.data) {
          setBadges(resBadges.data)
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard do doador:', err.message)
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [user])

  // Cálculos de métricas do usuário
  const totalDoado = useMemo(() => {
    return transacoes
      .filter((t) => t.tipo === 'doacao')
      .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)
  }, [transacoes])

  const ongsApoiadas = useMemo(() => {
    const ids = new Set(
      transacoes
        .filter((t) => t.tipo === 'doacao' && t.destino_usuario_id)
        .map((t) => t.destino_usuario_id)
    )
    return ids.size
  }, [transacoes])

  // Avaliação dinâmica de conquistas (Badges)
  const badgesConquistados = useMemo(() => {
    const doacoes = transacoes.filter((t) => t.tipo === 'doacao')
    const mesesDistintos = new Set(
      doacoes.map((t) => t.data?.substring(0, 7)).filter(Boolean)
    )

    return badges.map((badge) => {
      let conquistado = false
      if (badge.id === 'primeira-doacao') conquistado = doacoes.length >= 1
      else if (badge.id === 'doador-frequente') conquistado = doacoes.length >= 5
      else if (badge.id === 'generoso') conquistado = totalDoado >= 500
      else if (badge.id === 'diversidade') conquistado = ongsApoiadas >= 3
      else if (badge.id === 'recorrente') conquistado = mesesDistintos.size >= 2

      return { ...badge, conquistado }
    })
  }, [badges, transacoes, totalDoado, ongsApoiadas])

  function getDescricaoTransacao(t) {
    if (t.tipo === 'doacao') {
      const nomeOng = mapaNomes.get(`user_${t.destino_usuario_id}`) || 'ONG Parceira'
      return `Doação para ${nomeOng}`
    }
    if (t.tipo === 'resgate') {
      const nomeProd = mapaNomes.get(`prod_${t.destino_produto_id}`) || 'Produto no Marketplace'
      return `Resgate: ${nomeProd}`
    }
    return 'Movimentação de Créditos'
  }

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Badge variant="success" className="mb-2">Painel do Doador</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Olá, {user?.nome || 'Doador'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus créditos de impacto social e veja o histórico das suas doações.
            </p>
          </div>

          <Link to="/doador/ongs">
            <Button variant="primary" size="lg">
              Fazer nova doação
            </Button>
          </Link>
        </div>

        {/* Resumo de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Saldo Disponível</p>
            <p className="text-3xl font-extrabold text-green-700">
              {user?.saldoCreditos ?? 0} <span className="text-base font-normal text-gray-500">créditos</span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Total Doado</p>
            <p className="text-3xl font-extrabold text-blue-700">
              {loading ? '...' : totalDoado} <span className="text-base font-normal text-gray-500">créditos</span>
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Causas / ONGs Apoiadas</p>
            <p className="text-3xl font-extrabold text-gray-800">
              {loading ? '...' : ongsApoiadas}
            </p>
          </div>
        </div>

        {/* Conquistas / Badges */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Suas Conquistas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {badgesConquistados.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-xl border text-center transition-all ${
                  b.conquistado
                    ? 'bg-green-50/60 border-green-200 text-gray-800'
                    : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
                }`}
              >
                <div className="text-3xl mb-1">{b.icone}</div>
                <p className="text-xs font-bold text-gray-800">{b.nome}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{b.descricao}</p>
                {b.conquistado && (
                  <span className="inline-block mt-2 text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                    Conquistado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de Transações */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Movimentações</h2>
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Carregando histórico...
            </div>
          ) : transacoes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
              Você ainda não realizou nenhuma doação ou resgate.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {transacoes.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{getDescricaoTransacao(t)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      t.tipo === 'doacao' ? 'text-blue-600' : 'text-orange-600'
                    }`}
                  >
                    -{t.valor} créditos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default DoadorDashboard
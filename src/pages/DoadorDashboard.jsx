import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button, BadgesDoador, ExcluirContaCard } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function DoadorDashboard() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [transacoes, setTransacoes] = useState([])
  const [mapaNomes, setMapaNomes] = useState(new Map())
  const [anoEscolhido, setAnoEscolhido] = useState(null)

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

        const [resUsuarios, resProdutos] = await Promise.all([
          ongIds.length > 0
            ? supabase.from('usuarios').select('id, nome').in('id', ongIds)
            : { data: [] },
          produtoIds.length > 0
            ? supabase.from('produtos').select('id, nome').in('id', produtoIds)
            : { data: [] },
        ])

        // Cria o mapa de identificadores para nomes legíveis
        const nomesMap = new Map()
        resUsuarios.data?.forEach((u) => nomesMap.set(`user_${u.id}`, u.nome))
        resProdutos.data?.forEach((p) => nomesMap.set(`prod_${p.id}`, p.nome))
        setMapaNomes(nomesMap)
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

  const anosComDoacao = useMemo(() => {
    const anos = new Set(
      transacoes
        .filter((t) => t.tipo === 'doacao' && t.data)
        .map((t) => Number(String(t.data).slice(0, 4)))
    )
    return [...anos].sort((a, b) => b - a)
  }, [transacoes])

  const anoComprovante = anoEscolhido ?? anosComDoacao[0]

  const ongsApoiadas = useMemo(() => {
    const ids = new Set(
      transacoes
        .filter((t) => t.tipo === 'doacao' && t.destino_usuario_id)
        .map((t) => t.destino_usuario_id)
    )
    return ids.size
  }, [transacoes])

  // Avaliação dinâmica de conquistas (Badges) agora vive dentro de <BadgesDoador />

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

          <div className="flex gap-3">
            <Link to="/doador/creditos">
              <Button variant="outline" size="lg">
                Adquirir créditos
              </Button>
            </Link>
            <Link to="/doador/ongs">
              <Button variant="primary" size="lg">
                Fazer nova doação
              </Button>
            </Link>
          </div>
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
          <BadgesDoador userId={user?.id} />
        </div>

        {/* Comprovantes de doação */}
        {anosComDoacao.length > 0 && (
          <div className="mb-10 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Comprovante de doações</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Reúne todas as doações do ano em um documento para imprimir ou salvar em PDF.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={anoComprovante}
                onChange={(e) => setAnoEscolhido(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
                aria-label="Ano do comprovante"
              >
                {anosComDoacao.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
              <Link to={`/doador/comprovante?ano=${anoComprovante}`}>
                <Button variant="outline">Gerar comprovante</Button>
              </Link>
            </div>
          </div>
        )}

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
                  <div className="flex items-center gap-4">
                    {t.tipo === 'doacao' && (
                      <Link
                        to={`/doador/comprovante/${t.id}`}
                        className="text-xs text-green-700 font-medium hover:underline"
                      >
                        Comprovante
                      </Link>
                    )}
                    <span
                      className={`text-sm font-bold ${
                        t.tipo === 'doacao' ? 'text-blue-600' : 'text-orange-600'
                      }`}
                    >
                      -{t.valor} créditos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12">
          <ExcluirContaCard creditos={user?.saldoCreditos ?? 0} />
        </div>
      </section>

      <Footer />
    </>
  )
}

export default DoadorDashboard
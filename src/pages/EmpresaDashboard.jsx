import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button, MetricCard } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function EmpresaDashboard() {
  const { user } = useAuth()
  const empresaId = user?.id ? Number(user.id) : null

  const [loading, setLoading] = useState(true)
  const [empresa, setEmpresa] = useState(null)
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [resgates, setResgates] = useState([])

  const carregarDashboard = useCallback(async () => {
    if (!empresaId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [resEmpresa, resProdutos] = await Promise.all([
        supabase.from('empresas').select('*').eq('id', empresaId).maybeSingle(),
        supabase.from('produtos').select('id, nome, creditos_necessarios').eq('empresa_id', empresaId),
      ])

      setEmpresa(resEmpresa.data)

      const produtos = resProdutos.data || []
      setTotalProdutos(produtos.length)

      const produtoIds = produtos.map((p) => p.id)
      const nomesPorProduto = new Map(produtos.map((p) => [p.id, p.nome]))

      if (produtoIds.length > 0) {
        const { data: transacoesData } = await supabase
          .from('transacoes')
          .select('id, origem, destino_produto_id, valor, data')
          .eq('tipo', 'resgate')
          .in('destino_produto_id', produtoIds)
          .order('data', { ascending: false })

        const ongIds = [...new Set((transacoesData || []).map((t) => t.origem))]
        const { data: ongsData } =
          ongIds.length > 0
            ? await supabase.from('usuarios').select('id, nome').in('id', ongIds)
            : { data: [] }

        const nomesPorOng = new Map((ongsData || []).map((o) => [o.id, o.nome]))

        setResgates(
          (transacoesData || []).map((t) => ({
            ...t,
            nomeOng: nomesPorOng.get(t.origem) || 'ONG',
            nomeProduto: nomesPorProduto.get(t.destino_produto_id) || 'Produto',
          }))
        )
      } else {
        setResgates([])
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard da empresa:', err.message)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    carregarDashboard()
  }, [carregarDashboard])

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-500">
          Carregando painel...
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Badge variant="info" className="mb-2">Painel da empresa</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Olá, {user?.nome}
            </h1>
            {empresa?.segmento && (
              <p className="text-gray-600 mt-1">Segmento: {empresa.segmento}</p>
            )}
          </div>

          <Link to="/empresa/produtos">
            <Button variant="primary">Gerenciar produtos</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <MetricCard value={empresa?.creditos_acumulados || 0} label="Créditos acumulados" />
          <MetricCard value={totalProdutos} label="Produtos cadastrados" />
          <MetricCard value={resgates.length} label="Resgates recebidos" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Resgates recentes</h2>

        {resgates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhum resgate registrado ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resgates.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {r.nomeOng} resgatou "{r.nomeProduto}"
                  </p>
                  <p className="text-xs text-gray-400">{r.data}</p>
                </div>
                <span className="font-semibold text-blue-700 whitespace-nowrap">
                  +{r.valor} créditos
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}

export default EmpresaDashboard

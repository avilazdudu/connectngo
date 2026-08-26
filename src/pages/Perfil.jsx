import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button, MetricCard, TransparenciaItem, ProgressBar } from '../components'
import { supabase } from '../services/supabase'

function Perfil() {
  const { id } = useParams()
  const ongId = Number(id)

  const [loading, setLoading] = useState(true)
  const [ong, setOng] = useState(null)
  const [transacoes, setTransacoes] = useState([])
  const [mapaNomes, setMapaNomes] = useState(new Map())
  const [mapaProdutos, setMapaProdutos] = useState(new Map())

  useEffect(() => {
    async function carregarPerfil() {
      if (!ongId) return
      setLoading(true)

      try {
        // 1. Busca dados da ONG e nome na tabela usuarios
        const [resOng, resUsuario] = await Promise.all([
          supabase.from('ongs').select('*').eq('id', ongId).maybeSingle(),
          supabase.from('usuarios').select('id, nome, email').eq('id', ongId).maybeSingle(),
        ])

        if (resOng.data) {
          setOng({
            ...resOng.data,
            nome: resUsuario.data?.nome || 'ONG',
            email: resUsuario.data?.email || '',
          })
        }

        // 2. Busca movimentações onde a ONG é destino (doação) ou origem (resgate/repasse)
        const { data: transacoesData } = await supabase
          .from('transacoes')
          .select('*')
          .or(`destino_usuario_id.eq.${ongId},origem.eq.${ongId}`)
          .order('data', { ascending: false })

        const lista = transacoesData || []
        setTransacoes(lista)

        // 3. Coleta dados complementares para nomes de doadores e empresas parceiras
        const doadoresIds = [...new Set(lista.filter((t) => t.tipo === 'doacao' && t.origem).map((t) => t.origem))]
        const produtosIds = [...new Set(lista.filter((t) => t.destino_produto_id).map((t) => t.destino_produto_id))]

        const [resDoadores, resProds] = await Promise.all([
          doadoresIds.length > 0 ? supabase.from('usuarios').select('id, nome').in('id', doadoresIds) : { data: [] },
          produtosIds.length > 0
            ? supabase.from('produtos').select('id, nome, empresa_id, empresas:empresa_id(usuarios:id(nome))').in('id', produtosIds)
            : { data: [] },
        ])

        const nomesMap = new Map(resDoadores.data?.map((u) => [u.id, u.nome]) || [])
        setMapaNomes(nomesMap)

        const prodsMap = new Map()
        resProds.data?.forEach((p) => {
          prodsMap.set(p.id, {
            nomeProduto: p.nome,
            nomeEmpresa: p.empresas?.usuarios?.nome || 'Empresa Parceira',
          })
        })
        setMapaProdutos(prodsMap)
      } catch (err) {
        console.error('Erro ao carregar perfil da ONG:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarPerfil()
  }, [ongId])

  // Métricas calculadas
  const doacoesRecebidas = useMemo(() => transacoes.filter((t) => t.tipo === 'doacao' && t.destino_usuario_id === ongId), [transacoes, ongId])
  const resgatesFeitos = useMemo(() => transacoes.filter((t) => t.tipo === 'resgate' || t.tipo === 'repasse'), [transacoes])

  const totalDoado = useMemo(() => doacoesRecebidas.reduce((soma, t) => soma + (Number(t.valor) || 0), 0), [doacoesRecebidas])
  const totalResgatado = useMemo(() => resgatesFeitos.reduce((soma, t) => soma + (Number(t.valor) || 0), 0), [resgatesFeitos])
  const doadoresUnicos = useMemo(() => new Set(doacoesRecebidas.map((t) => t.origem)).size, [doacoesRecebidas])

  // Distribuição de gastos por parceiro
  const gastosArray = useMemo(() => {
    const acc = {}
    resgatesFeitos.forEach((t) => {
      const prodInfo = mapaProdutos.get(t.destino_produto_id)
      const empresa = prodInfo?.nomeEmpresa || 'Empresas Parceiras'
      acc[empresa] = (acc[empresa] || 0) + (Number(t.valor) || 0)
    })
    return Object.entries(acc)
      .map(([empresa, valor]) => ({ empresa, valor }))
      .sort((a, b) => b.valor - a.valor)
  }, [resgatesFeitos, mapaProdutos])

  // Linha do tempo formatada
  const linhaDoTempo = useMemo(() => {
    return transacoes.map((t) => {
      const isDoacao = t.tipo === 'doacao'
      const nomeOrigem = mapaNomes.get(t.origem) || 'Doador'
      const prodInfo = mapaProdutos.get(t.destino_produto_id)
      
      return {
        id: t.id,
        tipo: isDoacao ? 'doacao' : 'resgate',
        titulo: isDoacao
          ? `Doação recebida de ${nomeOrigem}`
          : `Resgate: ${prodInfo?.nomeProduto || 'Produto/Serviço'} (${prodInfo?.nomeEmpresa || 'Empresa'})`,
        valor: Number(t.valor),
        data: t.data,
      }
    })
  }, [transacoes, mapaNomes, mapaProdutos])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-500 font-medium">Carregando perfil...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      {/* Cabeçalho da ONG */}
      <section className="bg-gradient-to-b from-green-50 to-white px-4 sm:px-6 py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <img
            src={ong?.imagem || 'https://via.placeholder.com/150'}
            alt={ong?.nome}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <Badge variant="success">{ong?.categoria || 'Assistência Social'}</Badge>
              <Badge variant="info">Região {ong?.regiao || 'Brasil'}</Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800">{ong?.nome}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">{ong?.descricao}</p>
          </div>
        </div>
      </section>

      {/* Métricas */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard value={ong?.creditos_recebidos ?? totalDoado} label="Créditos Arrecadados" />
          <MetricCard value={totalResgatado} label="Créditos Investidos" />
          <MetricCard value={doadoresUnicos} label="Doadores Apoiadores" />
          <MetricCard value={ong?.beneficiarios ?? 0} label="Pessoas Atendidas" />
        </div>
      </section>

      {/* Relatório de Transparência */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Relatório de transparência</h2>
          <Badge variant="neutral">{linhaDoTempo.length} movimentações</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Acompanhe a origem e o destino de cada crédito recebido por esta organização.
        </p>

        {gastosArray.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Destino dos créditos investidos</h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
              {gastosArray.map(({ empresa, valor }) => {
                const percentual = totalResgatado > 0 ? Math.round((valor / totalResgatado) * 100) : 0
                return (
                  <div key={empresa}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{empresa}</span>
                      <span className="text-gray-500">
                        {valor} créditos ({percentual}%)
                      </span>
                    </div>
                    <ProgressBar value={valor} max={totalResgatado} showPercentage={false} />
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

      <Footer />
    </>
  )
}

export default Perfil
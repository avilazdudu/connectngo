import { useEffect, useState, useCallback } from 'react'
import { Navbar, Footer, Badge, ResgateModal, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { getProdutosMarketplace } from '../services/marketplaceService'

function OngMarketplace() {
  const { user } = useAuth()

  const [empresas, setEmpresas] = useState([])
  const [saldoOng, setSaldoOng] = useState(0)
  const [loading, setLoading] = useState(true)

  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  // Agrupa a lista flat de produtos (vinda do service) por empresa, no
  // formato que a tela já espera para renderizar.
  const carregarMarketplace = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)

    try {
      const [produtos, resOng] = await Promise.all([
        getProdutosMarketplace(),
        supabase.from('ongs').select('creditos_recebidos').eq('id', user.id).maybeSingle(),
      ])

      setSaldoOng(Number(resOng.data?.creditos_recebidos) || 0)

      const empresasMap = new Map()
      produtos.forEach((p) => {
        const empresaId = p.empresa?.id
        if (!empresaId) return

        if (!empresasMap.has(empresaId)) {
          empresasMap.set(empresaId, {
            id: empresaId,
            nome: p.empresa.usuario?.nome || 'Empresa Parceira',
            segmento: p.empresa.segmento,
            produtos: [],
          })
        }

        empresasMap.get(empresaId).produtos.push({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          creditosNecessarios: Number(p.creditos_necessarios) || 0,
        })
      })

      setEmpresas(Array.from(empresasMap.values()))
    } catch (err) {
      console.error('Erro ao carregar marketplace:', err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    carregarMarketplace()
  }, [carregarMarketplace])

  function abrirModal(produto, empresa) {
    setProdutoSelecionado(produto)
    setEmpresaSelecionada(empresa)
    setErro('')
  }

  async function handleConfirmarResgate() {
    setErro('')

    if (saldoOng < produtoSelecionado.creditosNecessarios) {
      setErro('Créditos insuficientes para este resgate.')
      return
    }

    try {
      const idTransacao = 't_' + Date.now()
      const dataHoje = new Date().toISOString().split('T')[0]

      const { error: erroTransacao } = await supabase
        .from('transacoes')
        .insert({
          id: idTransacao,
          origem: user.id,
          destino_produto_id: produtoSelecionado.id,
          valor: produtoSelecionado.creditosNecessarios,
          tipo: 'resgate',
          data: dataHoje,
        })

      if (erroTransacao) throw erroTransacao

      const novoSaldoOng = saldoOng - produtoSelecionado.creditosNecessarios
      const { error: erroOng } = await supabase
        .from('ongs')
        .update({ creditos_recebidos: novoSaldoOng })
        .eq('id', user.id)

      if (erroOng) throw erroOng

      const { data: empresaAtual } = await supabase
        .from('empresas')
        .select('creditos_acumulados')
        .eq('id', empresaSelecionada.id)
        .maybeSingle()

      const { error: erroEmpresa } = await supabase
        .from('empresas')
        .update({
          creditos_acumulados: (Number(empresaAtual?.creditos_acumulados) || 0) + produtoSelecionado.creditosNecessarios,
        })
        .eq('id', empresaSelecionada.id)

      if (erroEmpresa) throw erroEmpresa

      setSaldoOng(novoSaldoOng)
      setMensagem(`Resgate de "${produtoSelecionado.nome}" concluído com sucesso!`)
      setProdutoSelecionado(null)
      setEmpresaSelecionada(null)

      setTimeout(() => setMensagem(''), 4000)
    } catch (err) {
      console.error('Erro ao confirmar resgate:', err.message)
      setErro(`Não foi possível concluir o resgate: ${err.message}`)
    }
  }

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Badge variant="info" className="mb-2">Marketplace de Empresas Parceiras</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Resgate produtos com seus créditos
          </h1>
          <p className="text-gray-600 mt-1">
            Saldo disponível: <strong className="text-green-700">{saldoOng} créditos</strong>
          </p>
        </div>

        {mensagem && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {mensagem}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium">Carregando marketplace...</p>
          </div>
        ) : empresas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {empresas.map((empresa) => (
              <div key={empresa.id}>
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  {empresa.nome}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empresa.produtos.map((produto) => {
                    const podeResgatar = saldoOng >= produto.creditosNecessarios

                    return (
                      <div
                        key={produto.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2"
                      >
                        <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                        <p className="text-sm text-gray-600 flex-1">
                          {produto.descricao}
                        </p>
                        <p className="text-sm font-semibold text-blue-700">
                          {produto.creditosNecessarios} créditos
                        </p>
                        <Button
                          variant={podeResgatar ? 'primary' : 'outline'}
                          size="sm"
                          fullWidth
                          disabled={!podeResgatar}
                          onClick={() => abrirModal(produto, empresa)}
                        >
                          {podeResgatar ? 'Resgatar' : 'Créditos insuficientes'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {produtoSelecionado && empresaSelecionada && (
        <ResgateModal
          produto={produtoSelecionado}
          empresaNome={empresaSelecionada.nome}
          saldoDisponivel={saldoOng}
          onClose={() => {
            setProdutoSelecionado(null)
            setEmpresaSelecionada(null)
          }}
          onConfirm={handleConfirmarResgate}
        />
      )}

      {erro && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-md text-sm">
          {erro}
        </div>
      )}

      <Footer />
    </>
  )
}

export default OngMarketplace

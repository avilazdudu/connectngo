import { useState, useEffect, useCallback } from 'react'
import { Navbar, Footer, Badge, Input, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function EmpresaProdutos() {
  const { user } = useAuth()
  const empresaId = user?.id ? Number(user.id) : null

  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [creditos, setCreditos] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // 1. Busca os produtos no banco sem disparar setState síncrono no effect
  const carregarProdutos = useCallback(async () => {
    if (!empresaId) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('criado_em', { ascending: false })

      if (error) throw error

      const formatados = (data || []).map((item) => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        creditosNecessarios: Number(item.creditos_necessarios) || 0,
      }))

      setProdutos(formatados)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err.message)
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  // 2. Inserção do produto com verificação imediata
  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    const valorCreditos = Number(creditos)

    if (!nome.trim() || !creditos || valorCreditos <= 0) {
      setErro('Preencha o nome e um valor em créditos válido.')
      return
    }

    if (!empresaId) {
      setErro('Sessão inválida: faça login como empresa para cadastrar produtos.')
      return
    }

    setSubmitting(true)

    try {
      const idProduto = 'p_' + Date.now()

      const payload = {
        id: idProduto,
        empresa_id: empresaId,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        creditos_necessarios: valorCreditos,
      }

      console.log('Enviando produto para o Supabase:', payload)

      const { data, error } = await supabase
        .from('produtos')
        .insert(payload)
        .select()

      if (error) {
        console.error('Erro detalhado retornado pelo Supabase:', error)
        throw error
      }

      console.log('Produto gravado com sucesso:', data)
      setSucesso(`Produto "${nome.trim()}" cadastrado com sucesso!`)
      setNome('')
      setDescricao('')
      setCreditos('')

      await carregarProdutos()
      setTimeout(() => setSucesso(''), 4000)
    } catch (err) {
      console.error('Falha no cadastro:', err)
      setErro(err.message || 'Erro ao cadastrar produto no banco.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <Badge variant="info" className="mb-2">Catálogo da Empresa</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Produtos e serviços
          </h1>
          <p className="text-gray-600 mt-1">
            Cadastre itens que as ONGs poderão resgatar usando os créditos recebidos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Cadastro */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4">Novo produto</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nome do produto/serviço"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Vale-compras R$50"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva brevemente o produto ou benefício"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 resize-none bg-white"
                  />
                </div>

                <Input
                  label="Valor em créditos"
                  type="number"
                  name="creditos"
                  value={creditos}
                  onChange={(e) => setCreditos(e.target.value)}
                  placeholder="Ex: 200"
                  required
                />

                {erro && <p className="text-sm text-red-500">{erro}</p>}
                {sucesso && <p className="text-sm text-green-700">{sucesso}</p>}

                <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                  {submitting ? 'Cadastrando...' : 'Cadastrar produto'}
                </Button>
              </form>
            </div>
          </div>

          {/* Listagem dos Produtos da Empresa */}
          <div className="lg:col-span-2">
            <h2 className="font-bold text-gray-800 mb-4">
              Produtos cadastrados ({produtos.length})
            </h2>

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                Carregando catálogo...
              </div>
            ) : produtos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                Nenhum produto cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{produto.nome}</h3>
                      {produto.descricao && (
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {produto.descricao}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Custo de resgate:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {produto.creditosNecessarios} créditos
                      </span>
                    </div>
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

export default EmpresaProdutos
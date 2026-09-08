import { useState, useEffect, useCallback } from 'react'
import { Navbar, Footer, Badge, Input, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

function EmpresaProdutos() {
  const { user } = useAuth()
  const empresaId = user?.id ? Number(user.id) : null

  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [creditos, setCreditos] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

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

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome || !creditos || Number(creditos) <= 0) {
      setErro('Preencha nome e um valor em créditos válido.')
      return
    }

    if (!empresaId) {
      setErro('Sessão inválida: faça login como empresa para cadastrar produtos.')
      return
    }

    try {
      const { error } = await supabase.from('produtos').insert({
        id: 'p_' + Date.now(),
        empresa_id: empresaId,
        nome,
        descricao: descricao || null,
        creditos_necessarios: Number(creditos),
      })

      if (error) throw error

      setSucesso(`Produto "${nome}" cadastrado com sucesso!`)
      setNome('')
      setDescricao('')
      setCreditos('')

      await carregarProdutos()
      setTimeout(() => setSucesso(''), 4000)
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err.message)
      setErro(`Não foi possível cadastrar o produto: ${err.message}`)
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
          {/* Formulário de cadastro */}
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
                    placeholder="Descreva brevemente o produto"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 resize-none"
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

                <Button type="submit" variant="primary" fullWidth>
                  Cadastrar produto
                </Button>
              </form>
            </div>
          </div>

          {/* Lista de produtos cadastrados */}
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
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  >
                    <h3 className="font-semibold text-gray-800">{produto.nome}</h3>
                    {produto.descricao && (
                      <p className="text-sm text-gray-600 mt-1">
                        {produto.descricao}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-blue-700 mt-2">
                      {produto.creditosNecessarios} créditos
                    </p>
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

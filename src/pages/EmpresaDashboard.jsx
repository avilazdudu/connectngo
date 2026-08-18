import { useState } from 'react'
import { Navbar, Footer, Badge, Input, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { useTransacoes } from '../context/TransacoesContext'

function EmpresaProdutos() {
  
  const { user } = useAuth()
  const { empresas, adicionarProduto } = useTransacoes()

  const empresa = empresas.find((e) => e.id === user?.id)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [creditos, setCreditos] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome || !creditos || Number(creditos) <= 0) {
      setErro('Preencha nome e um valor em créditos válido.')
      return
    }

    adicionarProduto({
      empresaId: user.id,
      nome,
      descricao,
      creditosNecessarios: creditos,
    })

    setSucesso(`Produto "${nome}" cadastrado com sucesso!`)
    setNome('')
    setDescricao('')
    setCreditos('')

    setTimeout(() => setSucesso(''), 4000)
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
              Produtos cadastrados ({empresa?.produtos.length ?? 0})
            </h2>

            {(!empresa || empresa.produtos.length === 0) ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                Nenhum produto cadastrado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {empresa.produtos.map((produto) => (
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
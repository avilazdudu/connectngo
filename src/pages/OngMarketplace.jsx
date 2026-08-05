import { useState } from 'react'
import { Navbar, Footer, Badge, ResgateModal, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { useTransacoes } from '../context/TransacoesContext'

function OngMarketplace() {
  const { user } = useAuth()
  const { empresas, ongs, resgatar } = useTransacoes()

  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const ong = ongs.find((o) => o.id === user?.id)
  const saldoOng = ong?.creditosRecebidos ?? 0

  function abrirModal(produto, empresa) {
    setProdutoSelecionado(produto)
    setEmpresaSelecionada(empresa)
    setErro('')
  }

  function handleConfirmarResgate() {
    const resultado = resgatar({
      ongId: user.id,
      empresaId: empresaSelecionada.id,
      produto: produtoSelecionado,
    })

    if (!resultado.success) {
      setErro(resultado.message)
      return
    }

    setMensagem(`Resgate de "${produtoSelecionado.nome}" concluído com sucesso!`)
    setProdutoSelecionado(null)
    setEmpresaSelecionada(null)

    setTimeout(() => setMensagem(''), 4000)
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
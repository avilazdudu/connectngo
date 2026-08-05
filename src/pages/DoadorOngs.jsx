import { useState, useMemo } from 'react'
import { Navbar, Footer, Card, FilterSelect, DoacaoModal, Badge } from '../components'
import { useAuth } from '../context/AuthContext'
import { useTransacoes } from '../context/TransacoesContext'

const categorias = ['Todas', 'Fome', 'Saúde', 'Educação', 'Animais', 'Meio Ambiente', 'Assistência Social']
const regioes = ['Todas', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']

function DoadorOngs() {
  const { user } = useAuth()
  const { ongs, doar, getSaldoAtual } = useTransacoes()

  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [regiao, setRegiao] = useState('Todas')
  const [ongSelecionada, setOngSelecionada] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const saldo = getSaldoAtual(user)

  const ongsFiltradas = useMemo(() => {
    return ongs.filter((ong) => {
      const combinaBusca = ong.nome.toLowerCase().includes(busca.toLowerCase())
      const combinaCategoria = categoria === 'Todas' || ong.categoria === categoria
      const combinaRegiao = regiao === 'Todas' || ong.regiao === regiao
      return combinaBusca && combinaCategoria && combinaRegiao
    })
  }, [ongs, busca, categoria, regiao])

  function handleConfirmarDoacao(valor) {
    doar({ doadorId: user.id, ongId: ongSelecionada.id, valor })
    setMensagemSucesso(`Doação de ${valor} créditos enviada para ${ongSelecionada.nome}!`)
    setOngSelecionada(null)

    setTimeout(() => setMensagemSucesso(''), 4000)
  }

  return (
    <>
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Badge variant="info" className="mb-2">Vitrine de ONGs</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Encontre uma causa para apoiar
          </h1>
          <p className="text-gray-600 mt-1">
            Seu saldo atual: <strong className="text-green-700">{saldo} créditos</strong>
          </p>
        </div>

        {mensagemSucesso && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {mensagemSucesso}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Buscar por nome
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex: ONG Esperança"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-800"
            />
          </div>

          <FilterSelect
            label="Categoria"
            value={categoria}
            onChange={setCategoria}
            options={categorias.map((c) => ({ value: c, label: c }))}
          />

          <FilterSelect
            label="Região"
            value={regiao}
            onChange={setRegiao}
            options={regioes.map((r) => ({ value: r, label: r }))}
          />
        </div>

        {/* Resultado */}
        {ongsFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhuma ONG encontrada com esses filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongsFiltradas.map((ong) => (
              <Card
                key={ong.id}
                title={ong.nome}
                description={ong.descricao}
                category={`${ong.categoria} · ${ong.regiao}`}
                arrecadado={ong.creditosRecebidos}
                meta={Math.max(ong.creditosRecebidos + 1000, 3000)}
                actionLabel="Doar créditos"
                onAction={() => setOngSelecionada(ong)}
              />
            ))}
          </div>
        )}
      </section>

      {ongSelecionada && (
        <DoacaoModal
          ong={ongSelecionada}
          saldoDisponivel={saldo}
          onClose={() => setOngSelecionada(null)}
          onConfirm={handleConfirmarDoacao}
        />
      )}

      <Footer />
    </>
  )
}

export default DoadorOngs
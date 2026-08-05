import { useState, useMemo } from 'react'
import { Navbar, Footer, Card, FilterSelect, DoacaoModal, Badge, Button } from '../components'
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
  const [apenasForaSudeste, setApenasForaSudeste] = useState(false) // NOVO
  const [ongSelecionada, setOngSelecionada] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const saldo = getSaldoAtual(user)

  const ongsFiltradas = useMemo(() => {
    return ongs.filter((ong) => {
      const combinaBusca = ong.nome.toLowerCase().includes(busca.toLowerCase())
      const combinaCategoria = categoria === 'Todas' || ong.categoria === categoria
      const combinaRegiao = regiao === 'Todas' || ong.regiao === regiao
      const combinaForaSudeste = !apenasForaSudeste || ong.regiao !== 'Sudeste'
      return combinaBusca && combinaCategoria && combinaRegiao && combinaForaSudeste
    })
  }, [ongs, busca, categoria, regiao, apenasForaSudeste])

  // ... restante do código (handleConfirmarDoacao, return) ...

  return (
    <>
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* ... cabeçalho existente ... */}

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-3">
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

          {/* NOVO: Toggle rápido Fora do Sudeste */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setApenasForaSudeste(!apenasForaSudeste)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                apenasForaSudeste
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              🌍 Fora do Sudeste
              {apenasForaSudeste && <span className="text-green-500">✓</span>}
            </button>
            {apenasForaSudeste && (
              <span className="text-xs text-gray-500">
                Mostrando ONGs das regiões Norte, Nordeste, Centro-Oeste e Sul
              </span>
            )}
          </div>
        </div>

        {/* ... resultado e modal existentes ... */}
      </section>
      <Footer />
    </>
  )
}

export default DoadorOngs
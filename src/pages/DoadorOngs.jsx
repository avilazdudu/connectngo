import { useState, useMemo, useEffect } from 'react'
import { Navbar, Footer, Card, FilterSelect, DoacaoModal, Badge } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

const categorias = ['Todas', 'Fome', 'Saúde', 'Educação', 'Animais', 'Meio Ambiente', 'Assistência Social']
const regioes = ['Todas', 'Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']

function DoadorOngs() {
  const { user, refreshUser } = useAuth()

  const [ongs, setOngs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [regiao, setRegiao] = useState('Todas')
  const [apenasForaSudeste, setApenasForaSudeste] = useState(false)
  const [ongSelecionada, setOngSelecionada] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [erroDoacao, setErroDoacao] = useState('')

  const saldo = user?.saldoCreditos ?? 0

  // 1. Carrega todas as ONGs e seus nomes do banco
  async function carregarOngs() {
    setLoading(true)
    try {
      const { data: ongsData, error: errOngs } = await supabase
        .from('ongs')
        .select('*')

      if (errOngs) throw errOngs

      if (ongsData && ongsData.length > 0) {
        const ids = ongsData.map((o) => o.id)
        const { data: usuariosData, error: errUsers } = await supabase
          .from('usuarios')
          .select('id, nome, email')
          .in('id', ids)

        if (errUsers) throw errUsers

        const mapaNomes = new Map(usuariosData?.map((u) => [u.id, u.nome]) || [])

        const formatadas = ongsData.map((ong) => ({
          id: ong.id,
          nome: mapaNomes.get(ong.id) || 'ONG Parceira',
          cnpj: ong.cnpj,
          categoria: ong.categoria,
          regiao: ong.regiao,
          descricao: ong.descricao,
          creditosRecebidos: Number(ong.creditos_recebidos) || 0,
          beneficiarios: ong.beneficiarios,
          imagem: ong.imagem,
        }))

        setOngs(formatadas)
      }
    } catch (err) {
      console.error('Erro ao carregar lista de ONGs:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarOngs()
  }, [])

  // 2. Filtros de busca
  const ongsFiltradas = useMemo(() => {
    return ongs.filter((ong) => {
      const combinaBusca = ong.nome.toLowerCase().includes(busca.toLowerCase())
      const combinaCategoria = categoria === 'Todas' || ong.categoria === categoria
      const combinaRegiao = regiao === 'Todas' || ong.regiao === regiao
      const combinaForaSudeste = !apenasForaSudeste || ong.regiao !== 'Sudeste'
      return combinaBusca && combinaCategoria && combinaRegiao && combinaForaSudeste
    })
  }, [ongs, busca, categoria, regiao, apenasForaSudeste])

  // 3. Processamento e gravação da doação no Supabase
  async function handleConfirmarDoacao(valor) {
    const valorNumerico = Number(valor)
    setErroDoacao('')

    if (!user?.id) {
      setErroDoacao('Você precisa estar logado para doar.')
      return
    }

    if (valorNumerico <= 0) {
      setErroDoacao('Informe um valor válido.')
      return
    }

    if (saldo < valorNumerico) {
      setErroDoacao('Saldo de créditos insuficiente.')
      return
    }

    try {
      // 1. Gera ID único e insere na tabela transacoes
      const idTransacao = 't_' + Date.now()
      const dataHoje = new Date().toISOString().split('T')[0]

      const { error: errTransacao } = await supabase
        .from('transacoes')
        .insert({
          id: idTransacao,
          origem: user.id,
          destino_usuario_id: ongSelecionada.id,
          valor: valorNumerico,
          tipo: 'doacao',
          data: dataHoje,
        })

      if (errTransacao) throw errTransacao

      // 2. Debita do usuário doador
      const { error: errDoador } = await supabase
        .from('usuarios')
        .update({ saldo_creditos: saldo - valorNumerico })
        .eq('id', user.id)

      if (errDoador) throw errDoador

      // 3. Incrementa na tabela ongs
      const novosCreditos = ongSelecionada.creditosRecebidos + valorNumerico
      const { error: errOng } = await supabase
        .from('ongs')
        .update({ creditos_recebidos: novosCreditos })
        .eq('id', ongSelecionada.id)

      if (errOng) throw errOng

      // 4. Feedback e sincronização
      setMensagemSucesso(`Doação de ${valorNumerico} créditos enviada com sucesso para ${ongSelecionada.nome}!`)
      setOngSelecionada(null)
      
      // Atualiza o estado global de autenticação e a lista na tela
      if (refreshUser) await refreshUser()
      await carregarOngs()

      setTimeout(() => setMensagemSucesso(''), 5000)
    } catch (err) {
      console.error('Erro ao realizar doação:', err.message)
      setErroDoacao(`Não foi possível concluir a doação: ${err.message}`)
    }
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

        {erroDoacao && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {erroDoacao}
          </div>
        )}

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

        {/* Listagem */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium">Carregando ONGs...</p>
          </div>
        ) : ongsFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhuma ONG encontrada com esses filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongsFiltradas.map((ong) => (
              <Card
                key={ong.id}
                image={ong.imagem}
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
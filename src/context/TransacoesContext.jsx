import { createContext, useContext, useState } from 'react'
import transacoesData from '../data/transacoes.json'
import ongsData from '../data/ongs.json'
import empresasData from '../data/empresas.json'

const TransacoesContext = createContext(null)

export function TransacoesProvider({ children }) {
  const [transacoes, setTransacoes] = useState(transacoesData)
  const [ongs, setOngs] = useState(ongsData)
  const [empresas, setEmpresas] = useState(empresasData)
  const [saldosExtras, setSaldosExtras] = useState({})

  function doar({ doadorId, ongId, valor }) {
    const novaTransacao = {
      id: `t-${Date.now()}`,
      origem: doadorId,
      destino: ongId,
      valor,
      tipo: 'doacao',
      data: new Date().toISOString().slice(0, 10),
    }

    setTransacoes((prev) => [novaTransacao, ...prev])

    setOngs((prev) =>
      prev.map((ong) =>
        ong.id === ongId
          ? { ...ong, creditosRecebidos: ong.creditosRecebidos + valor }
          : ong
      )
    )

    setSaldosExtras((prev) => ({
      ...prev,
      [doadorId]: (prev[doadorId] || 0) - valor,
    }))

    return novaTransacao
  }

  function resgatar({ ongId, empresaId, produto }) {
    const ong = ongs.find((o) => o.id === ongId)

    if (!ong || ong.creditosRecebidos < produto.creditosNecessarios) {
      return { success: false, message: 'Créditos insuficientes para este resgate.' }
    }

    const novaTransacao = {
      id: `t-${Date.now()}`,
      origem: ongId,
      destino: produto.id,
      valor: produto.creditosNecessarios,
      tipo: 'resgate',
      data: new Date().toISOString().slice(0, 10),
    }

    setTransacoes((prev) => [novaTransacao, ...prev])

    setOngs((prev) =>
      prev.map((o) =>
        o.id === ongId
          ? { ...o, creditosRecebidos: o.creditosRecebidos - produto.creditosNecessarios }
          : o
      )
    )

    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === empresaId
          ? { ...e, creditosAcumulados: e.creditosAcumulados + produto.creditosNecessarios }
          : e
      )
    )

    return { success: true, transacao: novaTransacao }
  }

  function adicionarProduto({ empresaId, nome, descricao, creditosNecessarios }) {
    const novoProduto = {
      id: `p-${Date.now()}`,
      nome,
      descricao,
      creditosNecessarios: Number(creditosNecessarios),
    }

    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === empresaId
          ? { ...e, produtos: [...e.produtos, novoProduto] }
          : e
      )
    )

    return novoProduto
  }

  function solicitarConversao({ empresaId }) {
    const empresa = empresas.find((e) => e.id === empresaId)

    if (!empresa || empresa.creditosAcumulados <= 0) {
      return { success: false, message: 'Não há créditos disponíveis para conversão.' }
    }

    const valorConvertido = empresa.creditosAcumulados

    const novaTransacao = {
      id: `t-${Date.now()}`,
      origem: empresaId,
      destino: 'fiduciario',
      valor: valorConvertido,
      tipo: 'conversao',
      data: new Date().toISOString().slice(0, 10),
    }

    setTransacoes((prev) => [novaTransacao, ...prev])

    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === empresaId ? { ...e, creditosAcumulados: 0 } : e
      )
    )

    return { success: true, transacao: novaTransacao, valorConvertido }
  }

  function getSaldoAtual(usuario) {
    if (!usuario) return 0
    const ajuste = saldosExtras[usuario.id] || 0
    return usuario.saldoCreditos + ajuste
  }

  function getSaldoOng(ongId) {
    return ongs.find((o) => o.id === ongId)?.creditosRecebidos || 0
  }

  function getSaldoEmpresa(empresaId) {
    return empresas.find((e) => e.id === empresaId)?.creditosAcumulados || 0
  }

  function getHistoricoPorUsuario(usuarioId) {
    return transacoes.filter(
      (t) => t.origem === usuarioId || t.destino === usuarioId
    )
  }

  function getApoiadoresPorOng(ongId) {
    const doacoes = transacoes.filter(
      (t) => t.tipo === 'doacao' && t.destino === ongId
    )

    const totaisPorDoador = doacoes.reduce((acc, t) => {
      acc[t.origem] = (acc[t.origem] || 0) + t.valor
      return acc
    }, {})

    return Object.entries(totaisPorDoador).map(([doadorId, total]) => ({
      doadorId,
      total,
    }))
  }

  function getHistoricoEmpresa(empresaId) {
    const empresa = empresas.find((e) => e.id === empresaId)
    const idsDosProdutos = empresa?.produtos.map((p) => p.id) || []

    return transacoes.filter(
      (t) =>
        (t.tipo === 'resgate' && idsDosProdutos.includes(t.destino)) ||
        (t.tipo === 'conversao' && t.origem === empresaId)
    )
  }

  const value = {
    transacoes,
    ongs,
    empresas,
    doar,
    resgatar,
    adicionarProduto,
    solicitarConversao,
    getSaldoAtual,
    getSaldoOng,
    getSaldoEmpresa,
    getHistoricoPorUsuario,
    getApoiadoresPorOng,
    getHistoricoEmpresa,
    getProdutoEEmpresa,
  }

  return (
    <TransacoesContext.Provider value={value}>
      {children}
    </TransacoesContext.Provider>
  )
}

export function useTransacoes() {
  const context = useContext(TransacoesContext)

  if (!context) {
    throw new Error('useTransacoes deve ser usado dentro de um TransacoesProvider')
  }

  return context
}

function getProdutoEEmpresa(produtoId) {
  for (const empresa of empresas) {
    const produto = empresa.produtos.find((p) => p.id === produtoId)
    if (produto) {
      return { produto, empresa }
    }
  }
  return null
}

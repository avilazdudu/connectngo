import { createContext, useContext, useState } from 'react'
import transacoesData from '../data/transacoes.json'
import ongsData from '../data/ongs.json'

const TransacoesContext = createContext(null)

export function TransacoesProvider({ children }) {
  const [transacoes, setTransacoes] = useState(transacoesData)
  const [ongs, setOngs] = useState(ongsData)
  const [saldosExtras, setSaldosExtras] = useState({}) // ajustes de saldo por usuário nesta sessão

  // Registra uma doação: cria transação, reduz saldo do doador e aumenta créditos da ONG
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

  function getSaldoAtual(usuario) {
    if (!usuario) return 0
    const ajuste = saldosExtras[usuario.id] || 0
    return usuario.saldoCreditos + ajuste
  }

  function getHistoricoPorUsuario(usuarioId) {
    return transacoes.filter(
      (t) => t.origem === usuarioId || t.destino === usuarioId
    )
  }

  const value = {
    transacoes,
    ongs,
    doar,
    getSaldoAtual,
    getHistoricoPorUsuario,
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
import { useTransacoes } from '../context/TransacoesContext'
import { badgesDisponiveis } from '../data/badges'
import BadgeGamificacao from './BadgeGamificacao'

function BadgesDoador({ doadorId }) {
  const { transacoes } = useTransacoes()

  const historicoDoacoes = transacoes.filter(
    (t) => t.tipo === 'doacao' && t.origem === doadorId
  )

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {badgesDisponiveis.map((badge) => {
        const conquistado = badge.condicao(historicoDoacoes)
        return (
          <BadgeGamificacao
            key={badge.id}
            badge={badge}
            conquistado={conquistado}
          />
        )
      })}
    </div>
  )
}

export default BadgesDoador
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../services/supabase'

function BadgesDoador({ userId }) {
  const [badges, setBadges] = useState([])
  const [transacoes, setTransacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [resBadges, resTransacoes] = await Promise.all([
          supabase.from('badges').select('*'),
          supabase
            .from('transacoes')
            .select('valor, tipo, data, destino_usuario_id')
            .eq('origem', userId)
            .eq('tipo', 'doacao'),
        ])

        setBadges(resBadges.data || [])
        setTransacoes(resTransacoes.data || [])
      } catch (err) {
        console.error('Erro ao carregar badges do doador:', err.message)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [userId])

  const badgesConquistados = useMemo(() => {
    const totalDoado = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0)
    const ongsApoiadas = new Set(transacoes.map((t) => t.destino_usuario_id).filter(Boolean)).size
    const mesesDistintos = new Set(
      transacoes.map((t) => t.data?.substring(0, 7)).filter(Boolean)
    ).size

    return badges.map((badge) => {
      let conquistado = false
      if (badge.id === 'primeira-doacao') conquistado = transacoes.length >= 1
      else if (badge.id === 'doador-frequente') conquistado = transacoes.length >= 5
      else if (badge.id === 'generoso') conquistado = totalDoado >= 500
      else if (badge.id === 'diversidade') conquistado = ongsApoiadas >= 3
      else if (badge.id === 'recorrente') conquistado = mesesDistintos >= 2

      return { ...badge, conquistado }
    })
  }, [badges, transacoes])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="col-span-full text-center text-sm text-gray-400 py-4">
          Carregando conquistas...
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {badgesConquistados.map((b) => (
        <div
          key={b.id}
          className={`p-4 rounded-xl border text-center transition-all ${
            b.conquistado
              ? 'bg-green-50/60 border-green-200 text-gray-800'
              : 'bg-gray-50 border-gray-100 opacity-40 grayscale'
          }`}
        >
          <div className="text-3xl mb-1">{b.icone}</div>
          <p className="text-xs font-bold text-gray-800">{b.nome}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{b.descricao}</p>
          {b.conquistado && (
            <span className="inline-block mt-2 text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-full">
              Conquistado
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default BadgesDoador

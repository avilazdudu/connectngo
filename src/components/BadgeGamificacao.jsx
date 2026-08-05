function BadgeGamificacao({ badge, conquistado }) {
    return (
      <div
        className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all ${
          conquistado
            ? 'border-yellow-400 bg-yellow-50 shadow-sm'
            : 'border-gray-200 bg-gray-50 opacity-50'
        }`}
        title={badge.descricao}
      >
        <span className="text-2xl mb-1">{badge.icone}</span>
        <span className="text-xs font-semibold text-gray-700">{badge.nome}</span>
        {!conquistado && (
          <span className="text-[10px] text-gray-400 mt-0.5">Bloqueado</span>
        )}
      </div>
    )
  }
  
  export default BadgeGamificacao
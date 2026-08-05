function ProfileTypeSelector({ value, onChange }) {
  const opcoes = [
    { tipo: 'doador', label: 'Doador', icon: '❤' },
    { tipo: 'ong', label: 'ONG', icon: '🤝' },
    { tipo: 'empresa', label: 'Empresa Parceira', icon: '🏢' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {opcoes.map((opcao) => {
        const selecionado = value === opcao.tipo

        return (
          <button
            key={opcao.tipo}
            type="button"
            onClick={() => onChange(opcao.tipo)}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border-2 text-sm font-medium transition-colors duration-200 ${
              selecionado
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-green-300'
            }`}
          >
            <span className="text-xl">{opcao.icon}</span>
            {opcao.label}
          </button>
        )
      })}
    </div>
  )
}

export default ProfileTypeSelector
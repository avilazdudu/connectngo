function TransparenciaItem({ tipo, titulo, valor, data }) {
    const isEntrada = tipo === 'entrada'
  
    return (
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isEntrada ? 'bg-green-500' : 'bg-blue-500'
            }`}
          />
          <div>
            <p className="text-sm text-gray-800">{titulo}</p>
            <p className="text-xs text-gray-400">
              {new Date(data).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-semibold whitespace-nowrap ${
            isEntrada ? 'text-green-700' : 'text-blue-700'
          }`}
        >
          {isEntrada ? '+' : '-'}
          {valor} créditos
        </span>
      </div>
    )
  }
  
  export default TransparenciaItem
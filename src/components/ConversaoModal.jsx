import Button from './Button'

function ConversaoModal({ valorDisponivel, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Solicitar conversão
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Você está convertendo todos os créditos acumulados em moeda fiduciária.
        </p>

        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
          <p>
            Créditos a converter: <strong>{valorDisponivel}</strong>
          </p>
          <p>
            Saldo após conversão: <strong>0 créditos</strong>
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          O valor equivalente será processado e depositado na conta bancária
          cadastrada da empresa.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" fullWidth onClick={onConfirm}>
            Confirmar conversão
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConversaoModal
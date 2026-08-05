import Button from './Button'

function ResgateModal({ produto, empresaNome, saldoDisponivel, onClose, onConfirm }) {
  const saldoInsuficiente = saldoDisponivel < produto.creditosNecessarios

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Confirmar resgate</h3>
        <p className="text-sm text-gray-600 mb-4">
          Resgatar <strong>{produto.nome}</strong> de <strong>{empresaNome}</strong>.
        </p>

        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
          <p>Custo: <strong>{produto.creditosNecessarios} créditos</strong></p>
          <p>Saldo atual: <strong>{saldoDisponivel} créditos</strong></p>
          <p>Saldo após resgate: <strong>{saldoDisponivel - produto.creditosNecessarios} créditos</strong></p>
        </div>

        {saldoInsuficiente && (
          <p className="text-sm text-red-500 mb-4">
            Sua ONG não possui créditos suficientes para este resgate.
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
            disabled={saldoInsuficiente}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResgateModal
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Input from './Input'

function DoacaoModal({ ong, saldoDisponivel, onClose, onConfirm }) {
  const navigate = useNavigate()
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')
  const [saldoInsuficiente, setSaldoInsuficiente] = useState(false)

  function handleConfirm() {
    const valorNumerico = Number(valor)
    setSaldoInsuficiente(false)

    if (!valorNumerico || valorNumerico <= 0) {
      setErro('Informe um valor válido.')
      return
    }

    if (valorNumerico > saldoDisponivel) {
      setErro('Saldo insuficiente para esse valor.')
      setSaldoInsuficiente(true)
      return
    }

    setErro('')
    onConfirm(valorNumerico)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Doar créditos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Você está doando para <strong>{ong.nome}</strong>.
        </p>

        <Input
          label="Valor em créditos"
          type="number"
          name="valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 50"
          error={erro}
        />

        <p className="text-xs text-gray-500 mt-1 mb-4">
          Saldo disponível: <strong>{saldoDisponivel} créditos</strong>
        </p>

        {saldoInsuficiente && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
            Você não tem créditos suficientes para essa doação.{' '}
            <button
              type="button"
              onClick={() => navigate('/doador/creditos')}
              className="underline font-semibold"
            >
              Adquirir mais créditos
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" fullWidth onClick={handleConfirm}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DoacaoModal

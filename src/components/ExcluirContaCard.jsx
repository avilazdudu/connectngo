import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from './Input'

// Bloco "Excluir conta" usado nos painéis de doador, ONG e empresa.
// `creditos` é o saldo que será perdido com a exclusão.
function ExcluirContaCard({ creditos = 0 }) {
  const { user, excluirConta } = useAuth()
  const navigate = useNavigate()

  const [aberto, setAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  if (!user) return null

  const emailConfere =
    confirmacao.trim().toLowerCase() === (user.email || '').trim().toLowerCase()

  const avisos = []
  if (user.tipo === 'doador') {
    if (creditos > 0) avisos.push(`Seu saldo de ${creditos} créditos será perdido.`)
    avisos.push(
      'Suas doações continuam nos registros das ONGs, mas sem o seu nome (aparecem como "Conta excluída").'
    )
    avisos.push('Seus comentários e curtidas no mural serão removidos.')
    avisos.push('Seus comprovantes de doação deixarão de estar disponíveis.')
  } else if (user.tipo === 'ong') {
    avisos.push('O perfil da ONG, as publicações do mural e as curtidas e comentários delas serão removidos.')
    if (creditos > 0) avisos.push(`Os ${creditos} créditos que a ONG ainda tem serão perdidos.`)
    avisos.push(
      'Os registros das doações recebidas são mantidos, com o nome e o CNPJ da ONG, para que os doadores continuem com seus comprovantes.'
    )
  } else if (user.tipo === 'empresa') {
    avisos.push('Os produtos cadastrados serão removidos do marketplace.')
    if (creditos > 0) avisos.push(`Os ${creditos} créditos acumulados serão perdidos.`)
    avisos.push('Os resgates já feitos continuam nos registros das ONGs, sem o nome do produto.')
  }

  function fechar() {
    if (excluindo) return
    setAberto(false)
    setConfirmacao('')
    setErro('')
  }

  async function handleExcluir() {
    setErro('')
    setExcluindo(true)
    const resultado = await excluirConta(confirmacao)
    if (!resultado.success) {
      setErro(resultado.message)
      setExcluindo(false)
      return
    }
    navigate('/')
  }

  return (
    <>
      <div className="border border-red-200 bg-red-50/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-red-700">Excluir conta</h2>
          <p className="text-sm text-gray-600 mt-1">
            Remove a sua conta e os seus dados pessoais da plataforma. Essa ação não pode ser desfeita.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="px-4 py-2 rounded-lg border border-red-300 text-red-700 font-semibold hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          Excluir minha conta
        </button>
      </div>

      {aberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Excluir a conta?</h3>
            <p className="text-sm text-gray-600 mb-3">O que acontece ao excluir:</p>

            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-4">
              {avisos.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>

            {user.tipo === 'doador' && (
              <p className="text-sm mb-4">
                <Link to="/doador/comprovante" className="text-green-700 underline font-medium">
                  Baixar comprovantes antes de excluir
                </Link>
              </p>
            )}

            <Input
              label={`Para confirmar, digite o e-mail da conta (${user.email})`}
              type="email"
              name="confirmacaoEmail"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={user.email}
              error={erro}
            />

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={fechar}
                disabled={excluindo}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluir}
                disabled={!emailConfere || excluindo}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {excluindo ? 'Excluindo...' : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExcluirContaCard

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar, Footer, Badge, Button } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

const pacotes = [
  { id: 'p100', creditos: 100, destaque: false },
  { id: 'p300', creditos: 300, destaque: true },
  { id: 'p500', creditos: 500, destaque: false },
  { id: 'p1000', creditos: 1000, destaque: false },
]

function ComprarCreditos() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [processando, setProcessando] = useState(null)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  async function handleAdquirir(pacote) {
    if (!user?.id) return

    setProcessando(pacote.id)
    setErro('')
    setSucesso('')

    try {
      const novoSaldo = (user.saldoCreditos || 0) + pacote.creditos

      const { error } = await supabase
        .from('usuarios')
        .update({ saldo_creditos: novoSaldo })
        .eq('id', user.id)

      if (error) throw error

      if (refreshUser) await refreshUser()

      setSucesso(`${pacote.creditos} créditos adicionados ao seu saldo!`)
    } catch (err) {
      console.error('Erro ao adquirir créditos:', err.message)
      setErro(`Não foi possível concluir a operação: ${err.message}`)
    } finally {
      setProcessando(null)
    }
  }

  return (
    <>
      <Navbar />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Badge variant="success" className="mb-2">Adquirir créditos</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Aumente seu saldo de créditos
        </h1>
        <p className="text-gray-600 mt-1 mb-2">
          Saldo atual: <strong className="text-green-700">{user?.saldoCreditos ?? 0} créditos</strong>
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Ambiente de simulação: a aquisição aqui é simbólica, não envolve pagamento real.
        </p>

        {sucesso && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {sucesso}{' '}
            <button
              onClick={() => navigate('/doador/ongs')}
              className="underline font-semibold"
            >
              Doar agora
            </button>
          </div>
        )}

        {erro && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pacotes.map((pacote) => (
            <div
              key={pacote.id}
              className={`bg-white rounded-xl border p-5 flex flex-col gap-3 ${
                pacote.destaque ? 'border-green-400 shadow-md' : 'border-gray-100 shadow-sm'
              }`}
            >
              {pacote.destaque && (
                <Badge variant="success" className="w-fit">Mais popular</Badge>
              )}
              <p className="text-3xl font-extrabold text-gray-800">
                {pacote.creditos} <span className="text-base font-normal text-gray-500">créditos</span>
              </p>
              <Button
                variant={pacote.destaque ? 'primary' : 'outline'}
                fullWidth
                disabled={processando === pacote.id}
                onClick={() => handleAdquirir(pacote)}
              >
                {processando === pacote.id ? 'Processando...' : 'Adquirir'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default ComprarCreditos

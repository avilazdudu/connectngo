import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Navbar, Footer, Button, Input } from '../components'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { VALOR_CREDITO_REAIS, AMBIENTE_SIMULACAO } from '../config/fiscal'

const formatarReais = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Datas vêm como AAAA-MM-DD; formata sem passar por Date para não deslocar o dia por fuso.
function formatarData(iso) {
  if (!iso) return '-'
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Rotas:
//   /doador/comprovante/:id        -> comprovante de uma doação
//   /doador/comprovante?ano=AAAA   -> comprovante consolidado das doações do ano
function ComprovanteDoacao() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const ano = Number(searchParams.get('ano')) || new Date().getFullYear()
  const consolidado = !id

  const [doacoes, setDoacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [emitidoEm, setEmitidoEm] = useState(null)
  // CPF/CNPJ do doador: digitado aqui só para constar no documento, não é salvo.
  const [documento, setDocumento] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user?.id || user.tipo !== 'doador') {
      setCarregando(false)
      return
    }

    let ativo = true

    async function carregar() {
      setCarregando(true)
      setErro('')

      try {
        let consulta = supabase
          .from('transacoes')
          .select('*')
          .eq('origem', user.id)
          .eq('tipo', 'doacao')

        if (id) consulta = consulta.eq('id', id)

        const { data, error } = await consulta.order('data', { ascending: true })
        if (error) throw error

        let lista = data || []
        if (!id) {
          lista = lista.filter((t) => Number(String(t.data).slice(0, 4)) === ano)
        }

        const ongIds = [
          ...new Set(lista.map((t) => t.destino_usuario_id).filter(Boolean)),
        ]

        const [resOngs, resUsuarios] =
          ongIds.length > 0
            ? await Promise.all([
                supabase.from('ongs').select('id, cnpj').in('id', ongIds),
                supabase.from('usuarios').select('id, nome').in('id', ongIds),
              ])
            : [{ data: [] }, { data: [] }]

        const cnpjs = new Map((resOngs.data || []).map((o) => [o.id, o.cnpj]))
        const nomes = new Map((resUsuarios.data || []).map((u) => [u.id, u.nome]))

        if (!ativo) return

        setDoacoes(
          lista.map((t) => ({
            id: t.id,
            data: t.data,
            creditos: Number(t.valor) || 0,
            // destino_nome/destino_documento guardam o nome e o CNPJ da ONG caso ela
            // tenha excluído a conta (ver MIGRACAO_CONTA.sql)
            ongNome: t.destino_nome || nomes.get(t.destino_usuario_id) || 'ONG',
            ongDocumento: t.destino_documento || cnpjs.get(t.destino_usuario_id) || null,
          }))
        )
        setEmitidoEm(new Date())
      } catch (err) {
        console.error('Erro ao carregar comprovante:', err.message)
        if (ativo) setErro('Não foi possível carregar o comprovante. Tente novamente.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [authLoading, user, id, ano])

  const totalCreditos = doacoes.reduce((acc, d) => acc + d.creditos, 0)
  const totalReais = totalCreditos * VALOR_CREDITO_REAIS

  function renderConteudo() {
    if (authLoading || carregando) {
      return <p className="text-center text-gray-500 py-16">Carregando comprovante...</p>
    }

    if (!user || user.tipo !== 'doador') {
      return (
        <div className="text-center py-16 text-gray-600">
          <p className="mb-3">Entre com uma conta de doador para emitir comprovantes de doação.</p>
          <Link to="/login" className="text-green-700 font-semibold underline">
            Ir para o login
          </Link>
        </div>
      )
    }

    if (erro) {
      return <p className="text-center text-red-500 py-16">{erro}</p>
    }

    if (doacoes.length === 0) {
      return (
        <p className="text-center text-gray-500 py-16">
          {consolidado
            ? `Você não fez doações em ${ano}.`
            : 'Doação não encontrada na sua conta.'}
        </p>
      )
    }

    return (
      <>
        <div className="print:hidden bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
          <Input
            label="CPF ou CNPJ do doador (opcional)"
            name="documento"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Ex: 000.000.000-00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Não é salvo na plataforma: aparece apenas neste documento.
          </p>
        </div>

        <article className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 print:border-0 print:p-0 print:rounded-none">
          <header className="text-center mb-6">
            <p className="text-xs uppercase tracking-wide text-gray-400">ConnectNGO</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              {consolidado
                ? `Comprovante de doações — ${ano}`
                : 'Comprovante de doação'}
            </h1>
          </header>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6">
            <div>
              <dt className="text-gray-500">Doador</dt>
              <dd className="font-medium text-gray-800">{user.nome}</dd>
            </div>
            <div>
              <dt className="text-gray-500">CPF/CNPJ</dt>
              <dd className="font-medium text-gray-800">{documento.trim() || 'Não informado'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">E-mail</dt>
              <dd className="font-medium text-gray-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Emitido em</dt>
              <dd className="font-medium text-gray-800">
                {emitidoEm ? emitidoEm.toLocaleString('pt-BR') : '-'}
              </dd>
            </div>
          </dl>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-600">
                  <th className="py-2 pr-3 font-semibold">Data</th>
                  <th className="py-2 pr-3 font-semibold">Nº da transação</th>
                  <th className="py-2 pr-3 font-semibold">ONG beneficiária</th>
                  <th className="py-2 pr-3 font-semibold">CNPJ</th>
                  <th className="py-2 pr-3 font-semibold text-right">Créditos</th>
                  <th className="py-2 font-semibold text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                {doacoes.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap">{formatarData(d.data)}</td>
                    <td className="py-2 pr-3 break-all">{d.id}</td>
                    <td className="py-2 pr-3">{d.ongNome}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{d.ongDocumento || '-'}</td>
                    <td className="py-2 pr-3 text-right">{d.creditos}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {formatarReais(d.creditos * VALOR_CREDITO_REAIS)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {consolidado && (
                <tfoot>
                  <tr className="font-bold text-gray-800">
                    <td className="py-3 pr-3" colSpan={4}>
                      Total de {ano}
                    </td>
                    <td className="py-3 pr-3 text-right">{totalCreditos}</td>
                    <td className="py-3 text-right whitespace-nowrap">{formatarReais(totalReais)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Valor em reais calculado à razão de {formatarReais(VALOR_CREDITO_REAIS)} por crédito.
          </p>

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-2">
            {AMBIENTE_SIMULACAO && (
              <p>
                <strong>Ambiente de simulação:</strong> a aquisição de créditos na plataforma é simbólica e não envolve pagamento real. Este documento não tem validade fiscal.
              </p>
            )}
            <p>
              Este comprovante registra a doação feita na plataforma ConnectNGO. Ele não é nota fiscal nem recibo emitido pela entidade beneficiária.
            </p>
            <p>
              A dedução no Imposto de Renda depende da natureza da entidade que recebe a doação e das regras da Receita Federal. Para pessoas físicas, em geral só são dedutíveis doações a fundos específicos, como os da criança e do adolescente e da pessoa idosa. Para pessoas jurídicas tributadas pelo lucro real, a dedução vale para entidades que cumprem requisitos legais e dentro de limites. Consulte um contador antes de usar este documento na declaração.
            </p>
          </div>
        </article>

        <div className="print:hidden flex flex-wrap gap-3 mt-6">
          <Button variant="primary" onClick={() => window.print()}>
            Imprimir / salvar em PDF
          </Button>
          <Link to="/doador/dashboard">
            <Button variant="outline">Voltar ao painel</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:py-0 print:max-w-none">
        {renderConteudo()}
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </>
  )
}

export default ComprovanteDoacao

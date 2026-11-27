import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

// Contas excluídas são anonimizadas com um e-mail neste domínio (ver MIGRACAO_CONTA.sql)
const DOMINIO_CONTA_EXCLUIDA = '@conta-excluida.invalid'

function contaExcluida(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(DOMINIO_CONTA_EXCLUIDA)
}

function mapUsuario(row) {
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    email: row.email,
    saldoCreditos: Number(row.saldo_creditos) || 0,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ao iniciar, restaura a sessão e atualiza os dados reais do Supabase
  useEffect(() => {
    async function carregarSessao() {
      const stored = localStorage.getItem('connectngo_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Busca os dados mais recentes no banco (ex: saldo atualizado)
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', parsed.id)
            .maybeSingle()

          if (!error && data && contaExcluida(data.email)) {
            // A conta foi excluída (ex.: em outra aba): encerra a sessão local
            localStorage.removeItem('connectngo_user')
          } else if (!error && data) {
            const freshUser = mapUsuario(data)
            setUser(freshUser)
            localStorage.setItem('connectngo_user', JSON.stringify(freshUser))
          } else {
            setUser(parsed)
          }
        } catch (err) {
          console.error('Erro ao restaurar sessão:', err)
        }
      }
      setLoading(false)
    }

    carregarSessao()
  }, [])

  async function login(email) {
    if (!email) return { success: false, message: 'Informe o e-mail.' }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle()

    if (error) {
      return { success: false, message: 'Erro ao consultar usuário no banco.' }
    }

    if (!data || contaExcluida(data.email)) {
      return { success: false, message: 'Usuário não encontrado.' }
    }

    const foundUser = mapUsuario(data)
    setUser(foundUser)
    localStorage.setItem('connectngo_user', JSON.stringify(foundUser))

    return { success: true, user: foundUser }
  }

  async function register(dados) {
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .ilike('email', dados.email.trim())
      .maybeSingle()

    if (existente) {
      return { success: false, message: 'Este e-mail já está cadastrado.' }
    }

    // 1. Cria o usuário base
    const { data: novoUsuarioRow, error: erroUsuario } = await supabase
      .from('usuarios')
      .insert({
        nome: dados.nome,
        tipo: dados.tipo,
        email: dados.email.trim().toLowerCase(),
        saldo_creditos: dados.tipo === 'doador' ? 100 : 0, // Doador ganha saldo inicial se desejado
      })
      .select()
      .single()

    if (erroUsuario) {
      return { success: false, message: `Erro ao criar usuário: ${erroUsuario.message}` }
    }

    // 2. Cria registro na tabela complementar
    if (dados.tipo === 'ong') {
      const { error: erroOng } = await supabase.from('ongs').insert({
        id: novoUsuarioRow.id,
        cnpj: dados.cnpj,
        categoria: dados.categoria || 'Assistência Social',
        regiao: dados.regiao || 'Sul',
        descricao: dados.descricao || '',
        creditos_recebidos: 0,
        beneficiarios: 0,
      })
      if (erroOng) {
        return { success: false, message: `Erro ao salvar ONG: ${erroOng.message}` }
      }
    }

    if (dados.tipo === 'empresa') {
      const { error: erroEmpresa } = await supabase.from('empresas').insert({
        id: novoUsuarioRow.id,
        creditos_acumulados: 0,
        segmento: dados.segmento || 'Varejo',
      })
      if (erroEmpresa) {
        return { success: false, message: `Erro ao salvar empresa: ${erroEmpresa.message}` }
      }
    }

    const novoUsuario = mapUsuario(novoUsuarioRow)
    setUser(novoUsuario)
    localStorage.setItem('connectngo_user', JSON.stringify(novoUsuario))

    return { success: true, user: novoUsuario }
  }

  // Função para recarregar o saldo do usuário após doações ou resgates
  async function refreshUser() {
    if (!user?.id) return
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      const updated = mapUsuario(data)
      setUser(updated)
      localStorage.setItem('connectngo_user', JSON.stringify(updated))
    }
  }

  // Exclui a conta do usuário logado (doador, ONG ou empresa).
  // A regra de exclusão roda no banco, em uma única transação (função excluir_conta).
  async function excluirConta(emailConfirmacao) {
    if (!user?.id) return { success: false, message: 'Nenhum usuário autenticado.' }

    const { error } = await supabase.rpc('excluir_conta', {
      p_usuario_id: user.id,
      p_email: (emailConfirmacao || '').trim(),
    })

    if (error) {
      return { success: false, message: error.message || 'Não foi possível excluir a conta.' }
    }

    setUser(null)
    localStorage.removeItem('connectngo_user')
    return { success: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('connectngo_user')
  }

  const value = {
    user,
    tipo: user?.tipo || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    excluirConta,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
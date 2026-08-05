import { createContext, useState, useContext, useEffect } from 'react'
import usuariosData from '../data/usuarios.json'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('connectngo_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  function login(email) {
    const foundUser = usuariosData.find((u) => u.email === email)

    if (!foundUser) {
      return { success: false, message: 'Usuário não encontrado.' }
    }

    setUser(foundUser)
    localStorage.setItem('connectngo_user', JSON.stringify(foundUser))

    return { success: true, user: foundUser }
  }

  function loginAs(tipo) {
    const foundUser = usuariosData.find((u) => u.tipo === tipo)

    if (!foundUser) {
      return {
        success: false,
        message: `Nenhum usuário do tipo "${tipo}" encontrado.`,
      }
    }

    setUser(foundUser)
    localStorage.setItem('connectngo_user', JSON.stringify(foundUser))

    return { success: true, user: foundUser }
  }

  // Cadastro simulado: cria um novo usuário em memória/localStorage
  // (não persiste no arquivo JSON, apenas na sessão atual)
  function register(dados) {
    const emailJaExiste = usuariosData.some((u) => u.email === dados.email)

    if (emailJaExiste) {
      return { success: false, message: 'Este e-mail já está cadastrado.' }
    }

    const novoUsuario = {
      id: `u-${Date.now()}`,
      nome: dados.nome,
      tipo: dados.tipo,
      email: dados.email,
      saldoCreditos: 0,
      ...(dados.tipo === 'ong' && {
        cnpj: dados.cnpj,
        categoria: dados.categoria,
        descricao: dados.descricao,
      }),
      ...(dados.tipo === 'empresa' && {
        cnpj: dados.cnpj,
        segmento: dados.segmento,
      }),
    }

    setUser(novoUsuario)
    localStorage.setItem('connectngo_user', JSON.stringify(novoUsuario))

    return { success: true, user: novoUsuario }
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
    loginAs,
    register,
    logout,
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
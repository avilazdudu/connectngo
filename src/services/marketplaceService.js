import { supabase } from './supabase'

// Produtos disponíveis no marketplace (/ong/marketplace)
export async function getProdutosMarketplace() {
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      id,
      nome,
      descricao,
      creditos_necessarios,
      empresa:empresa_id (
        id,
        segmento,
        usuario:usuarios!id (nome)
      )
    `)

  if (error) throw error
  return data
}

// Produtos cadastrados por uma empresa específica (/empresa/produtos)
export async function getProdutosPorEmpresa(empresaId) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('empresa_id', empresaId)

  if (error) throw error
  return data
}
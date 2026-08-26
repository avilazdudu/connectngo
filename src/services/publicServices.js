import { supabase } from './supabase'

// Busca as métricas gerais da plataforma
export async function getMetricasPlataforma() {
  const { data, error } = await supabase
    .from('metricas_plataforma')
    .select('*')
    .single()

  if (error) throw error
  return {
    ongsAtivas: data.ongs_ativas,
    impactoEconomicoBilhoes: data.impacto_economico_bilhoes,
    empregosGerados: data.empregos_gerados,
    estadosAtendidos: data.estados_atendidos,
  }
}

// Busca as ONGs em destaque fazendo join com a tabela usuarios (para pegar o nome)
export async function getOngsDestaque() {
  const { data, error } = await supabase
    .from('ongs_destaque')
    .select(`
      ordem,
      ongs:ong_id (
        id,
        cnpj,
        categoria,
        regiao,
        descricao,
        creditos_recebidos,
        beneficiarios,
        imagem,
        usuario:usuarios!id (
          nome
        )
      )
    `)
    .order('ordem', { ascending: true })

  if (error) throw error

  return data.map(item => ({
    id: item.ongs.id,
    nome: item.ongs.usuario?.nome || 'ONG',
    cnpj: item.ongs.cnpj,
    categoria: item.ongs.categoria,
    regiao: item.ongs.regiao,
    descricao: item.ongs.descricao,
    creditosRecebidos: item.ongs.creditos_recebidos,
    beneficiarios: item.ongs.beneficiarios,
    imagem: item.ongs.imagem,
  }))
}
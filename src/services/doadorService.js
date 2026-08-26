import { supabase } from './supabase'

// Lista todas as ONGs para a tela /doador/ongs
export async function getTodasOngs() {
  const { data, error } = await supabase
    .from('ongs')
    .select(`
      id,
      cnpj,
      categoria,
      regiao,
      descricao,
      creditos_recebidos,
      beneficiarios,
      imagem,
      usuario:usuarios!id (nome, email)
    `)

  if (error) throw error
  return data.map(ong => ({
    id: ong.id,
    nome: ong.usuario?.nome,
    email: ong.usuario?.email,
    categoria: ong.categoria,
    regiao: ong.regiao,
    descricao: ong.descricao,
    creditosRecebidos: ong.creditos_recebidos,
    beneficiarios: ong.beneficiarios,
    imagem: ong.imagem,
  }))
}

// Doar créditos de um doador para uma ONG
export async function doarCreditos({ doadorId, ongId, valor }) {
  // 1. Verifica saldo do doador
  const { data: doador, error: erroDoador } = await supabase
    .from('usuarios')
    .select('saldo_creditos')
    .eq('id', doadorId)
    .single()

  if (erroDoador || !doador) throw new Error('Doador não encontrado.')
  if (doador.saldo_creditos < valor) throw new Error('Saldo de créditos insuficiente.')

  // 2. Registra a transação
  const { error: erroTransacao } = await supabase
    .from('transacoes')
    .insert({
      origem: doadorId,
      destino_usuario_id: ongId,
      valor: valor,
      tipo: 'doacao',
      data: new Date().toISOString().split('T')[0],
    })

  if (erroTransacao) throw erroTransacao

  // 3. Atualiza saldo do doador
  await supabase
    .from('usuarios')
    .update({ saldo_creditos: doador.saldo_creditos - valor })
    .eq('id', doadorId)

  // 4. Incrementa creditos_recebidos da ONG
  const { data: ong } = await supabase
    .from('ongs')
    .select('creditos_recebidos')
    .eq('id', ongId)
    .single()

  if (ong) {
    await supabase
      .from('ongs')
      .update({ creditos_recebidos: (ong.creditos_recebidos || 0) + valor })
      .eq('id', ongId)
  }

  return { success: true }
}

// Histórico de transações do doador
export async function getExtratoDoador(doadorId) {
  const { data, error } = await supabase
    .from('transacoes')
    .select(`
      id,
      valor,
      tipo,
      data,
      destino_usuario:destino_usuario_id (nome),
      destino_produto:destino_produto_id (nome)
    `)
    .eq('origem', doadorId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data
}
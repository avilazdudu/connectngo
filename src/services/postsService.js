import { supabase } from './supabase'

// Feed com nome da ONG, contagem de curtidas e de comentários.
export async function getFeed() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      conteudo,
      imagem,
      criado_em,
      ong_id,
      ong:ongs!ong_id ( usuario:usuarios!id (nome) ),
      curtidas:post_curtidas(count),
      comentarios:post_comentarios(count)
    `)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data
}

// IDs dos posts que este usuário já curtiu (pra marcar o coração ativo).
export async function getPostsCurtidosPor(usuarioId) {
  const { data, error } = await supabase
    .from('post_curtidas')
    .select('post_id')
    .eq('usuario_id', usuarioId)

  if (error) throw error
  return new Set((data || []).map((r) => r.post_id))
}

export async function criarPost({ ongId, conteudo, imagem }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ ong_id: ongId, conteudo, imagem: imagem || null })
    .select('id, conteudo, imagem, criado_em, ong_id')
    .single()

  if (error) throw error
  return data
}

export async function curtirPost({ postId, usuarioId }) {
  const { error } = await supabase
    .from('post_curtidas')
    .insert({ post_id: postId, usuario_id: usuarioId })

  if (error) throw error
}

export async function descurtirPost({ postId, usuarioId }) {
  const { error } = await supabase
    .from('post_curtidas')
    .delete()
    .eq('post_id', postId)
    .eq('usuario_id', usuarioId)

  if (error) throw error
}

export async function getComentariosPost(postId) {
  const { data, error } = await supabase
    .from('post_comentarios')
    .select('id, conteudo, criado_em, usuario_id, usuario:usuarios!usuario_id(nome, tipo)')
    .eq('post_id', postId)
    .order('criado_em', { ascending: true })

  if (error) throw error
  return data
}

export async function comentarPost({ postId, usuarioId, conteudo }) {
  const { data, error } = await supabase
    .from('post_comentarios')
    .insert({ post_id: postId, usuario_id: usuarioId, conteudo })
    .select('id, conteudo, criado_em, usuario_id')
    .single()

  if (error) throw error
  return data
}

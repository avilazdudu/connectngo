import { useState } from 'react'
import {
  curtirPost,
  descurtirPost,
  getComentariosPost,
  comentarPost,
} from '../services/postsService'

function formatarData(dataIso) {
  const data = new Date(dataIso)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PostCard({ post, usuarioAtual, curtidoInicial, podeInteragir }) {
  const [curtido, setCurtido] = useState(curtidoInicial)
  const [totalCurtidas, setTotalCurtidas] = useState(post.curtidas?.[0]?.count || 0)
  const [totalComentarios, setTotalComentarios] = useState(post.comentarios?.[0]?.count || 0)

  const [comentariosAbertos, setComentariosAbertos] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [carregandoComentarios, setCarregandoComentarios] = useState(false)
  const [novoComentario, setNovoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [erro, setErro] = useState('')

  const nomeOng = post.ong?.usuario?.nome || 'ONG'

  async function handleCurtir() {
    if (!podeInteragir) return
    setErro('')

    try {
      if (curtido) {
        setCurtido(false)
        setTotalCurtidas((n) => Math.max(0, n - 1))
        await descurtirPost({ postId: post.id, usuarioId: usuarioAtual.id })
      } else {
        setCurtido(true)
        setTotalCurtidas((n) => n + 1)
        await curtirPost({ postId: post.id, usuarioId: usuarioAtual.id })
      }
    } catch (err) {
      // desfaz a atualização otimista se a gravação falhar
      setCurtido((v) => !v)
      setTotalCurtidas((n) => (curtido ? n + 1 : Math.max(0, n - 1)))
      setErro('Não foi possível registrar a curtida.')
      console.error(err.message)
    }
  }

  async function toggleComentarios() {
    const abrindo = !comentariosAbertos
    setComentariosAbertos(abrindo)

    if (abrindo && comentarios.length === 0 && totalComentarios > 0) {
      setCarregandoComentarios(true)
      try {
        const dados = await getComentariosPost(post.id)
        setComentarios(dados)
      } catch (err) {
        console.error('Erro ao carregar comentários:', err.message)
      } finally {
        setCarregandoComentarios(false)
      }
    }
  }

  async function handleEnviarComentario(e) {
    e.preventDefault()
    if (!novoComentario.trim() || !podeInteragir) return

    setEnviandoComentario(true)
    setErro('')

    try {
      const criado = await comentarPost({
        postId: post.id,
        usuarioId: usuarioAtual.id,
        conteudo: novoComentario.trim(),
      })

      setComentarios((prev) => [
        ...prev,
        { ...criado, usuario: { nome: usuarioAtual.nome, tipo: usuarioAtual.tipo } },
      ])
      setTotalComentarios((n) => n + 1)
      setNovoComentario('')
      setComentariosAbertos(true)
    } catch (err) {
      setErro('Não foi possível publicar o comentário.')
      console.error(err.message)
    } finally {
      setEnviandoComentario(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center flex-shrink-0">
          {nomeOng.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 leading-tight">{nomeOng}</p>
          <p className="text-xs text-gray-400">{formatarData(post.criado_em)}</p>
        </div>
      </div>

      <p className="text-gray-700 whitespace-pre-line mb-3">{post.conteudo}</p>

      {post.imagem && (
        <div className="rounded-lg overflow-hidden mb-3 bg-gray-50">
          <img src={post.imagem} alt="" className="w-full max-h-96 object-cover" />
        </div>
      )}

      <div className="flex items-center gap-5 pt-2 border-t border-gray-100 text-sm">
        <button
          type="button"
          onClick={handleCurtir}
          disabled={!podeInteragir}
          className={`flex items-center gap-1.5 font-medium transition-colors ${
            curtido ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
          } ${!podeInteragir ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg
            className="w-5 h-5"
            fill={curtido ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z"
            />
          </svg>
          {totalCurtidas}
        </button>

        <button
          type="button"
          onClick={toggleComentarios}
          className="flex items-center gap-1.5 font-medium text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.19 0-2.326-.204-3.363-.575C7.13 20.083 5 21 5 21c.57-1.14 1-2.5 1-3.5C4.66 16.088 3 14.14 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {totalComentarios}
        </button>
      </div>

      {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}

      {comentariosAbertos && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
          {carregandoComentarios ? (
            <p className="text-sm text-gray-400">Carregando comentários...</p>
          ) : comentarios.length === 0 ? (
            <p className="text-sm text-gray-400">Seja o primeiro a comentar.</p>
          ) : (
            comentarios.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-semibold text-gray-800 mr-1.5">
                  {c.usuario?.nome || 'Usuário'}
                </span>
                <span className="text-gray-600">{c.conteudo}</span>
              </div>
            ))
          )}

          {podeInteragir && (
            <form onSubmit={handleEnviarComentario} className="flex items-center gap-2">
              <input
                type="text"
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={enviandoComentario || !novoComentario.trim()}
                className="text-sm font-semibold text-green-700 hover:text-green-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default PostCard

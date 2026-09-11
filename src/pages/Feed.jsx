import { useState, useEffect, useCallback } from 'react'
import { Navbar, Footer, Badge, Button } from '../components'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { getFeed, getPostsCurtidosPor, criarPost } from '../services/postsService'

function Feed() {
  const { user } = useAuth()
  const isOng = user?.tipo === 'ong'
  // Empresas acompanham o marketplace, não o mural social — mas quem
  // digitar a URL ainda consegue ler os posts, só não curte/comenta.
  const podeInteragir = user?.tipo === 'ong' || user?.tipo === 'doador'

  const [posts, setPosts] = useState([])
  const [curtidos, setCurtidos] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const [conteudo, setConteudo] = useState('')
  const [imagem, setImagem] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [erro, setErro] = useState('')

  const carregarFeed = useCallback(async () => {
    setLoading(true)
    try {
      const [feedData, curtidosSet] = await Promise.all([
        getFeed(),
        user?.id ? getPostsCurtidosPor(user.id) : Promise.resolve(new Set()),
      ])
      setPosts(feedData)
      setCurtidos(curtidosSet)
    } catch (err) {
      console.error('Erro ao carregar o mural:', err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    carregarFeed()
  }, [carregarFeed])

  async function handlePublicar(e) {
    e.preventDefault()
    setErro('')

    if (!conteudo.trim()) {
      setErro('Escreva algo para publicar.')
      return
    }

    setPublicando(true)
    try {
      await criarPost({ ongId: user.id, conteudo: conteudo.trim(), imagem: imagem.trim() })
      setConteudo('')
      setImagem('')
      await carregarFeed()
    } catch (err) {
      setErro(`Não foi possível publicar: ${err.message}`)
    } finally {
      setPublicando(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Badge variant="success" className="mb-2">Mural da comunidade</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Atualizações das ONGs
          </h1>
          <p className="text-gray-600 mt-1">
            {isOng
              ? 'Compartilhe o impacto do seu trabalho com doadores e outras ONGs.'
              : 'Acompanhe, curta e comente as novidades das ONGs que você apoia.'}
          </p>
        </div>

        {isOng && (
          <form
            onSubmit={handlePublicar}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6 flex flex-col gap-3"
          >
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Compartilhe uma novidade, resultado ou agradecimento..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 resize-none"
            />
            <input
              type="text"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              placeholder="URL de uma imagem (opcional)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400 text-sm"
            />

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <Button type="submit" variant="primary" disabled={publicando} className="self-end">
              {publicando ? 'Publicando...' : 'Publicar'}
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium">Carregando mural...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            Nenhuma postagem ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                usuarioAtual={user}
                curtidoInicial={curtidos.has(post.id)}
                podeInteragir={podeInteragir}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}

export default Feed

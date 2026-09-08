import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer, Button, Card, Badge, MetricCard } from '../components'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, isAuthenticated } = useAuth()
  const [metricas, setMetricas] = useState(null)
  const [ongsDestaque, setOngsDestaque] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function carregarDadosHome() {
      setLoading(true)

      try {
        // 1. Buscar métricas da plataforma
        const { data: dataMetricas, error: erroMetricas } = await supabase
          .from('metricas_plataforma')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (erroMetricas) {
          console.error('Erro ao buscar métricas:', erroMetricas.message)
        } else if (dataMetricas) {
          setMetricas(dataMetricas)
        }

        // 2. Buscar ONGs em destaque
        const { data: destaques, error: erroDestaques } = await supabase
          .from('ongs_destaque')
          .select('ong_id, ordem')
          .order('ordem', { ascending: true })

        if (erroDestaques) {
          console.error('Erro ao buscar destaques:', erroDestaques.message)
        } else if (destaques && destaques.length > 0) {
          const ongIds = destaques.map((d) => d.ong_id)

          // Busca dados da tabela ongs e nomes da tabela usuarios
          const [resOngs, resUsuarios] = await Promise.all([
            supabase.from('ongs').select('*').in('id', ongIds),
            supabase.from('usuarios').select('id, nome').in('id', ongIds),
          ])

          if (resOngs.data && resUsuarios.data) {
            const mapaOngs = new Map(resOngs.data.map((o) => [o.id, o]))
            const mapaNomes = new Map(resUsuarios.data.map((u) => [u.id, u.nome]))

            const cardsFormatados = destaques.map((item) => {
              const ong = mapaOngs.get(item.ong_id)
              const nome = mapaNomes.get(item.ong_id) || 'ONG Parceira'

              return {
                id: item.ong_id,
                nome: nome,
                imagem: ong?.imagem || 'https://via.placeholder.com/300x200',
                descricao: ong?.descricao || '',
                categoria: ong?.categoria || 'Geral',
                regiao: ong?.regiao || 'Brasil',
                creditosRecebidos: ong?.creditos_recebidos || 0,
              }
            })

            setOngsDestaque(cardsFormatados)
          }
        }
      } catch (err) {
        console.error('Erro geral ao carregar a página inicial:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosHome()
  }, [])

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-b from-green-50 to-blue-50 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <Badge variant="success">Conectando quem doa, quem transforma e quem apoia</Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
            O elo entre <span className="text-green-700">doadores</span>,{' '}
            <span className="text-blue-700">ONGs</span> e empresas
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            O ConnectNGO cria um ciclo virtuoso de impacto social: doadores geram créditos,
            ONGs recebem apoio direto, e empresas parceiras fecham o ciclo oferecendo
            benefícios reais em troca do engajamento social.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {isAuthenticated ? (
              <>
                <Link to={user.tipo === 'ong' ? `/perfil/${user.id}` : `/${user.tipo}/dashboard`}>
                  <Button variant="primary" size="lg">
                    {user.tipo === 'ong' ? 'Ver Meu Perfil Público' : 'Acessar Meu Painel'}
                  </Button>
                </Link>
                <Link to="/sobre">
                  <Button variant="outline" size="lg">
                    Conheça a história
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/cadastro">
                  <Button variant="primary" size="lg">
                    Quero fazer parte
                  </Button>
                </Link>
                <Link to="/sobre">
                  <Button variant="outline" size="lg">
                    Conheça a história
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
          Como funciona o ciclo ConnectNGO
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Um sistema simples e transparente que transforma boa vontade em impacto mensurável.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
              1
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Doador</h3>
            <p className="text-sm text-gray-600">
              Realiza doações e acumula créditos de impacto que podem ser direcionados a
              ONGs de sua escolha.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              2
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">ONG</h3>
            <p className="text-sm text-gray-600">
              Recebe os créditos e transforma em ações reais: alimentação, educação,
              saúde e assistência social.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
              3
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-800">Empresa</h3>
            <p className="text-sm text-gray-600">
              Patrocina o ecossistema e oferece produtos/benefícios resgatáveis,
              fechando o ciclo de valor social.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
            O Terceiro Setor no Brasil
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            Um setor essencial para a sociedade brasileira — e ainda com muito espaço para crescer.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              value={
                metricas?.ongs_ativas
                  ? Number(metricas.ongs_ativas).toLocaleString('pt-BR')
                  : '815.676'
              }
              label="ONGs ativas no Brasil"
            />
            <MetricCard
              value={metricas?.impacto_economico_bilhoes || '30.50'}
              suffix=" bi"
              label="Impacto econômico anual (R$)"
            />
            <MetricCard
              value={
                metricas?.empregos_gerados
                  ? (Number(metricas.empregos_gerados) / 1000000).toFixed(1)
                  : '3.2'
              }
              suffix=" mi"
              label="Empregos formais gerados"
            />
            <MetricCard
              value={metricas?.estados_atendidos || 26}
              label="Estados com OSCs atuantes"
            />
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Impacto além do Sudeste
            </h2>
            <p className="text-gray-600 mt-1 max-w-xl">
              Regiões Norte, Nordeste, Centro-Oeste e Sul concentram desafios sociais
              urgentes e ONGs que merecem mais visibilidade.
            </p>
          </div>
          <Badge variant="info" className="w-fit">4 regiões em destaque</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium">Carregando ONGs em destaque...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ongsDestaque.map((ong) => (
              <Card
                key={ong.id}
                image={ong.imagem}
                title={ong.nome}
                description={ong.descricao}
                category={`${ong.categoria} · ${ong.regiao}`}
                arrecadado={ong.creditosRecebidos}
                meta={Math.max(ong.creditosRecebidos + 1000, 3000)}
                actionLabel="Doar créditos"
                onAction={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-r from-green-600 to-blue-600 px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Pronto para fazer parte dessa corrente do bem?
          </h2>
          <p className="text-green-50 text-base sm:text-lg">
            Cadastre-se gratuitamente como doador, ONG ou empresa e comece a gerar
            impacto hoje mesmo.
          </p>
          <Link to="/cadastro">
            <Button
              variant="outline"
              size="lg"
              className="bg-white border-white text-green-700 hover:bg-green-50"
            >
              Criar minha conta
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Home
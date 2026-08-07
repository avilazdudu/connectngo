import { Link } from 'react-router-dom'
import { Navbar, Footer, Button, Card, Badge, MetricCard } from '../components'
import metricas from '../data/metricas.json'
import ongsDestaque from '../data/ongsDestaque.json'

function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
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
          </div>
        </div>
      </section>

      {/* Ciclo Doador -> ONG -> Empresa */}
      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
          Como funciona o ciclo ConnectNGO
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Um sistema simples e transparente que transforma boa vontade em impacto mensurável.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xl mb-4">
              1
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Doador</h3>
            <p className="text-sm text-gray-600">
              Realiza doações e acumula créditos de impacto que podem ser direcionados a
              ONGs de sua escolha.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xl mb-4">
              2
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">ONG</h3>
            <p className="text-sm text-gray-600">
              Recebe os créditos e transforma em ações reais: alimentação, educação,
              saúde e assistência social.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xl mb-4">
              3
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Empresa</h3>
            <p className="text-sm text-gray-600">
              Patrocina o ecossistema e oferece produtos/benefícios resgatáveis,
              fechando o ciclo de valor social.
            </p>
          </div>
        </div>
      </section>

      {/* Métricas do Terceiro Setor */}
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
              value={metricas.ongsAtivas.toLocaleString('pt-BR')}
              label="ONGs ativas no Brasil"
            />
            <MetricCard
              value={metricas.impactoEconomicoBilhoes}
              suffix=" bi"
              label="Impacto econômico anual (R$)"
            />
            <MetricCard
              value={(metricas.empregosGerados / 1000000).toFixed(1)}
              suffix=" mi"
              label="Empregos formais gerados"
            />
            <MetricCard
              value={metricas.estadosAtendidos}
              label="Estados com OSCs atuantes"
            />
          </div>
        </div>
      </section>

      {/* ONGs fora do Sudeste */}
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
            onAction={() => setOngSelecionada(ong)}
          />
          ))}
        </div>
      </section>

      {/* CTA final */}
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
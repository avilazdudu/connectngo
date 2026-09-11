import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button } from '../components'

const valores = [
  {
    titulo: 'Transparência',
    texto: 'Cada crédito doado é rastreável: você vê exatamente para onde foi e o que gerou.',
    icone: '🔍',
  },
  {
    titulo: 'Impacto real',
    texto: 'Conectamos diretamente quem doa com quem executa, sem intermediários opacos.',
    icone: '🌱',
  },
  {
    titulo: 'Colaboração',
    texto: 'Doadores, ONGs e empresas parceiras crescem juntos dentro do mesmo ecossistema.',
    icone: '🤝',
  },
]

const passos = [
  {
    numero: '01',
    titulo: 'Doadores contribuem',
    texto: 'Pessoas físicas adquirem créditos e doam para as ONGs que quiserem apoiar.',
  },
  {
    numero: '02',
    titulo: 'ONGs recebem e atuam',
    texto: 'As organizações usam os créditos recebidos para resgatar produtos e serviços de empresas parceiras.',
  },
  {
    numero: '03',
    titulo: 'Empresas parceiras entregam',
    texto: 'Empresas cadastram produtos e serviços que podem ser resgatados pelas ONGs com os créditos recebidos.',
  },
]

function SobreNos() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-blue-50 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <Badge variant="success">Quem somos</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Sobre o ConnectNGO
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Somos uma plataforma que conecta doadores, ONGs e empresas em um só
            ecossistema, tornando a doação mais simples, transparente e com impacto
            mensurável.
          </p>
        </div>
      </section>

      {/* Missão */}
      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Nossa missão
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          Dar visibilidade e recursos a organizações que fazem a diferença, e
          permitir que qualquer pessoa ou empresa participe disso de forma direta,
          acompanhando o resultado de cada contribuição.
        </p>
      </section>

      {/* Como funciona */}
      <section className="bg-gray-50 px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-10">
            Como funciona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {passos.map((passo) => (
              <div
                key={passo.numero}
                className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-2"
              >
                <span className="text-3xl font-extrabold text-green-200">
                  {passo.numero}
                </span>
                <h3 className="text-lg font-bold text-gray-800">{passo.titulo}</h3>
                <p className="text-sm text-gray-600">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-10">
          Nossos valores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {valores.map((valor) => (
            <div key={valor.titulo} className="text-center flex flex-col items-center gap-2">
              <span className="text-4xl">{valor.icone}</span>
              <h3 className="text-lg font-bold text-gray-800">{valor.titulo}</h3>
              <p className="text-sm text-gray-600">{valor.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Quer conhecer a história por trás disso?
          </h2>
          <p className="text-green-50 text-base sm:text-lg">
            Veja como o Terceiro Setor no Brasil evoluiu até chegar aqui.
          </p>
          <Link to="/sobre">
            <Button
              variant="outline"
              size="lg"
              className="bg-white border-white text-green-700 hover:bg-green-50"
            >
              Ver nossa história
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default SobreNos

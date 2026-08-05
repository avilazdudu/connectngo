import { Link } from 'react-router-dom'
import { Navbar, Footer, Badge, Button } from '../components'

function Sobre() {
  const timeline = [
    {
      periodo: 'Décadas de 1930–1970',
      titulo: 'Raízes assistencialistas',
      texto:
        'O Terceiro Setor no Brasil nasce ligado a instituições religiosas e filantrópicas, com foco em caridade e assistência a populações vulneráveis, sem articulação política organizada.',
    },
    {
      periodo: 'Décadas de 1970–1980',
      titulo: 'Movimentos sociais e redemocratização',
      texto:
        'Durante a ditadura militar, surgem organizações não governamentais ligadas a movimentos de direitos humanos, sindicais e comunitários, muitas vezes em oposição ao Estado.',
    },
    {
      periodo: 'Década de 1990',
      titulo: 'Institucionalização das OSCs',
      texto:
        'Com a Constituição de 1988 e o avanço da democracia, o setor se profissionaliza. Surgem marcos legais como o título de OSCIP (1999), regulando a relação entre ONGs e Estado.',
    },
    {
      periodo: 'Anos 2000',
      titulo: 'Expansão e parcerias com empresas',
      texto:
        'O conceito de responsabilidade social corporativa ganha força, e empresas passam a financiar projetos sociais, criando as bases do modelo de parcerias tripartites.',
    },
    {
      periodo: 'Década de 2010',
      titulo: 'Marco Regulatório das OSCs (MROSC)',
      texto:
        'A Lei 13.019/2014 moderniza as regras de parceria entre poder público e organizações da sociedade civil, trazendo mais transparência e segurança jurídica ao setor.',
    },
    {
      periodo: '2020 em diante',
      titulo: 'Era digital e plataformas de impacto',
      texto:
        'Tecnologia e dados passam a conectar diretamente doadores, ONGs e empresas, tornando o impacto social mais transparente, mensurável e acessível — é nesse contexto que nasce o ConnectNGO.',
    },
  ]

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-green-50 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <Badge variant="info">Nossa história e contexto</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            A evolução do Terceiro Setor no Brasil
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Entenda como décadas de mobilização social, marcos legais e inovação
            tecnológica moldaram o ecossistema que inspirou o ConnectNGO.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto">
        <div className="relative border-l-2 border-green-200 pl-6 flex flex-col gap-10">
          {timeline.map((item, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-green-600 border-4 border-green-100" />
              <Badge variant="neutral" className="mb-2">
                {item.periodo}
              </Badge>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                {item.titulo}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Missão */}
      <section className="bg-gray-50 px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Por que o ConnectNGO existe
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Apesar de décadas de avanços, o Terceiro Setor brasileiro ainda enfrenta
            desafios de visibilidade, principalmente fora do eixo Sudeste. O ConnectNGO
            nasce para reduzir essa desigualdade, usando tecnologia para aproximar
            doadores, ONGs e empresas de forma transparente e escalável.
          </p>

          <Link to="/cadastro">
            <Button variant="primary" size="lg" className="mt-2">
              Faça parte dessa história
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Sobre
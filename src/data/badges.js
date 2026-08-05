export const badgesDisponiveis = [
    {
      id: 'primeira-doacao',
      nome: 'Primeira Doação',
      icone: '🌟',
      descricao: 'Realizou sua primeira doação.',
      condicao: (historico) => historico.length >= 1,
    },
    {
      id: 'doador-frequente',
      nome: 'Doador Frequente',
      icone: '🔥',
      descricao: 'Realizou 5 ou mais doações.',
      condicao: (historico) => historico.length >= 5,
    },
    {
      id: 'generoso',
      nome: 'Coração Generoso',
      icone: '💚',
      descricao: 'Doeu mais de 500 créditos no total.',
      condicao: (historico) => {
        const total = historico.reduce((s, t) => s + t.valor, 0)
        return total >= 500
      },
    },
    {
      id: 'diversidade',
      nome: 'Diversidade de Causas',
      icone: '🌈',
      descricao: 'Apoiou 3 ou mais ONGs diferentes.',
      condicao: (historico) => {
        const ongsUnicas = new Set(historico.map((t) => t.destino))
        return ongsUnicas.size >= 3
      },
    },
    {
      id: 'recorrente',
      nome: 'Doador Recorrente',
      icone: '📅',
      descricao: 'Doou em 2 ou mais meses diferentes.',
      condicao: (historico) => {
        const meses = new Set(historico.map((t) => t.data.slice(0, 7)))
        return meses.size >= 2
      },
    },
  ]
/**
 * Conteúdo descritivo de cada capítulo do protocolo Passaporte Capilar.
 * Usado para enriquecer a seção DESIRE do Intelligence Brief.
 */

export type Capitulo =
  | "diagnostico"
  | "tratamento"
  | "selagem"
  | "brilho";

export type CapituloContent = {
  chave: Capitulo;
  /** Título completo do capítulo, conforme aparece no protocolo. */
  titulo: string;
  /** Descrição curta usada no resumo. */
  descricaoCurta: string;
  /** Parágrafo de contexto: o que é, para quê serve, o que resolve. */
  contexto: string;
  /** Itens dechecklist de preparação antes do atendimento. */
  preparacao: string[];
  /** Sinais de que este capítulo pode ser o próximo indicado. */
  indicacao: string[];
  /** Resultados típicos esperados ao final do capítulo. */
  resultadosEsperados: string[];
  /** Orientações de cuidado pós-atendimento. */
  posAtendimento: string[];
};

export const capitulos: Record<Capitulo, CapituloContent> = {
  diagnostico: {
    chave: "diagnostico",
    titulo: "DIAGNÓSTICO",
    descricaoCurta: "Análise técnica e registro do estado atual dos fios.",
    contexto:
      "O diagnóstico é o ponto de partida de toda a jornada. Aqui a profissional avalia a estrutura do fio, o estado da cutícula, o nível de porosidade, a presença de dano químico ou mecânico, e o histórico já informado pela cliente. Este capítulo não altera o cabelo — ele orienta todos os capítulos seguintes.",
    preparacao: [
      "Confirmar histórico de química (tintura, alisamento, progressiva, descoloração)",
      "Solicitar fotos de rotina ou avaliar presencialmente os pontos maisdanificados",
      "Verificar último atendimento registrado no Passaporte",
      "Checar alergias ou sensibilidades já informadas no cadastro",
      "Mapear as zonas do couro cabeludo quanto a oleosidade e descamação",
    ],
    indicacao: [
      "Cliente nova sem registro anterior no Passaporte",
      "Mudança significativa de comportamento dos fios desde o último atendimento",
      "Dúvida sobre qual procedimento é adequado no momento",
      "Cliente que passou por processo químico forte e não teve acompanhamento",
    ],
    resultadosEsperados: [
      "Mapeamento do estado atual dos fios (porosidade, elasticidade, textura)",
      "Identificação das áreas que exigem maior atenção",
      "Registro no Passaporte que fundamenta os próximos capítulos",
      "Definição ou confirmação do protocolo a seguir",
    ],
    posAtendimento: [
      "Registrar observações no Passaporte antes de fechar o próximo capítulo",
      "Orientar a cliente sobre os cuidados de manutenção até o próximo encontro",
      "Confirmar data prevista para o próximo atendimento, se aplicável",
    ],
  },

  tratamento: {
    chave: "tratamento",
    titulo: "TRATAMENTO",
    descricaoCurta: "Reconstrução, nutrição ou hidratação — conforme a necessidade identificada.",
    contexto:
      "O capítulo de tratamento é onde a intervenção acontece. Pode envolver reconstrução capilar (reposição de massa proteica), nutrição (reposição lipídica) ou hidratação (reposição hídrica) — ou a combinação delas. A escolha depende do diagnóstico registrado no capítulo anterior e do estado atual dos fios. É o coração do protocolo Passaporte Capilar.",
    preparacao: [
      "Revisar o diagnóstico e o estado registrado no capítulo anterior",
      "Confirmar quais produtos serão utilizados e suas composições",
      "Verificar presença de produtos anteriores na cliente (shampoo, condicionador em uso)",
      "Ter à disposição os produtos de manutenção indicados para uso em casa",
      "Checar a última vez que a cliente utilizou produto de tratamento profundo",
    ],
    indicacao: [
      "Fios que apresentam quebra, elasticidade reduzida ou aspecto opaco",
      "Resultado do diagnóstico indicando carência proteica, lipídica ou hídrica",
      "Cliente que concluiu o capítulo de diagnóstico e ainda não fez intervenção",
      "Queda acentuada ou sensação de cabelos sem vida, sem causa clínica",
    ],
    resultadosEsperados: [
      "Melhora na resistência e elasticidade dos fios",
      "Redução visível de pontas duplas ou quebra distal",
      "Retorno da luminosidade natural dos fios",
      "Sensação táctil de fios mais encorpados e握fortes",
    ],
    posAtendimento: [
      "Orientar esquema de manutenção em casa (frequência de máscara, leave-in)",
      "Alertar sobre hábitos que podem comprometer o resultado (secador quente, chapinha)",
      "Registrar no Passaporte o procedimento realizado e a resposta observada",
      "Confirmar prazo para reavaliação ou próximo capítulo",
    ],
  },

  selagem: {
    chave: "selagem",
    titulo: "SELAGEM",
    descricaoCurta: "Fechamento das escamas e bloqueio do porosity gap para proteção duradoura.",
    contexto:
      "A selagem é o capítulo de consolidação. Após a reconstrução, existe o porosity gap — a diferença de porosidade entre as partes mais danificadas e as mais saudáveis do mesmo fio. A selagem sela as escamas, uniformiza a superfície e cria uma barreira que protege o trabalho realizado nos capítulos anteriores. É o capítulo que transforma resultado temporário em resultado sustentado.",
    preparacao: [
      "Confirmar que o capítulo de tratamento foi concluído e registrado",
      "Verificar se houve reação alérgica anterior a ácidos ou derivados",
      "Avaliar o nível de porosidade atual — a selagem pressupõe reconstrução prévia",
      "Selecionar o produto de selagem compatível com o perfil do fio",
      "Ter toalha quente ou vaporizador disponível para potencializar a penetração",
    ],
    indicacao: [
      "Fios que passaram por reconstrução e apresentam irregularidade na superfície",
      "Cliente com histórico de frizz intenso mesmo após tratamento",
      "Porosity gap identificado entre raiz e pontas",
      "Desejo de maior duração do resultado do tratamento",
    ],
    resultadosEsperados: [
      "Superfície do fio mais uniforme e com menor atrito",
      "Redução significativa do frizz e da falta de definição",
      "Maior deslizamento ao pentear e brilho reflexivo",
      "Proteção reforçada contra danos externos (umidade, poluição, calor)",
    ],
    posAtendimento: [
      "Orientar uso de leave-in selante compatível com o tipo de fio",
      "Evitar lavagens com shampoo anti-resíduo nas primeiras duas semanas",
      "Registrar no Passaporte o tipo de selagem realizada e o produto utilizado",
      "Alertar que a selagem não substitui o tratamento — periodicidade mantém o resultado",
    ],
  },

  brilho: {
    chave: "brilho",
    titulo: "BRILHO",
    descricaoCurta: "Realce da luminosidade natural com acab amento espelhado.",
    contexto:
      "O capítulo de brilho é o acabamento da jornada. Após reconstruir, nutrir e selar, este capítulo entrega o resultado visível: fios com reflexo espelhado, cor mais viva e movimento natural. Pode ser feito com acidificação, glaze, cronograma capilar integrado ou tratamento térmico controlado — sempre como coroamento do protocolo, nunca como ponto de partida. É o capítulo que a cliente mais compartilha.",
    preparacao: [
      "Confirmar que os capítulos anteriores foram registrados e estão coerentes",
      "Avaliar a cor natural dos fios para definir o tipo de brilho ideal",
      "Verificar se a cliente deseja realce de cor ou brilho neutro",
      "Checar uso recente de tonalizante ou tintura (intervalo mínimo de 15 dias)",
      "Selecionar produtos com pH controlado para acidificação suave",
    ],
    indicacao: [
      "Cliente que completou reconstrução + selagem e busca resultado visual",
      "Fios que estão saudáveis mas sem vitalidade ou reflexo",
      "Preparação para evento ou momento especial da cliente",
      "Cliente que está encerrando um ciclo do protocolo e deseja marca-lo com resultado",
    ],
    resultadosEsperados: [
      "Fios com reflexo espelhado e movimento natural",
      "Cor mais viva — tanto em cabelos naturais quanto coloridos",
      "Sensação táctil de superfície lisa e sedosa",
      "Resultado que se sustenta por semanas quando mantido com cuidados adequados",
    ],
    posAtendimento: [
      "Orientar cronograma de brilho (frequência de acidificação caseira)",
      "Recomendar protetor solar capilar para exposição ao sol",
      "Registrar no Passaporte o capítulo concluído e a percepção da cliente",
      "Agendar reavaliação em janela adequada para o próximo ciclo",
    ],
  },
};

/**
 * Retorna o conteúdo de um capítulo pela sua chave.
 * Usado para exibir detalhes do capítulo na seção DESIRE do brief.
 */
export function getCapitulo(chave: Capitulo): CapituloContent | undefined {
  return capitulos[chave];
}

/**
 * Todas as chaves de capítulo, na ordem do protocolo.
 */
export const ordemCapitulos: Capitulo[] = ["diagnostico", "tratamento", "selagem", "brilho"];

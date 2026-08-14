import { useState, useMemo, useEffect, useRef } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseClient";

/* ─────────── CONFIG ─────────── */

// Links de pagamento Stripe — preencher no .env ou variáveis Vercel
const STRIPE_LINK_MENSAL = process.env.REACT_APP_STRIPE_MENSAL || "https://buy.stripe.com/SUBSTITUIR_MENSAL";
const STRIPE_LINK_ANUAL = process.env.REACT_APP_STRIPE_ANUAL || "https://buy.stripe.com/SUBSTITUIR_ANUAL";
const STRIPE_PORTAL = process.env.REACT_APP_STRIPE_PORTAL || "https://billing.stripe.com/p/login/SUBSTITUIR_PORTAL";

/* ─────────── i18n ─────────── */

const PT = {
  sub: "O teu baralho, sempre contigo",
  bemVindo: "Bem-vindo de volta", criaConta: "Cria a tua conta",
  authSub: "As tuas leituras, só tuas, em segurança.",
  entrar: "Entrar", registar: "Registar", nomePH: "O teu nome",
  passVer: "Mostrar palavra-passe", passOcultar: "Ocultar palavra-passe", passPH: "Palavra-passe (mín. 6 caracteres)",
  preenche: "Preenche o email e a palavra-passe.",
  contaCriada: "Conta criada! Verifica o teu email para confirmar e depois entra.",
  momento: "Um momento…", criarConta: "Criar conta", sair: "Sair",
  tabLeitura: "✦ Leitura", tabHist: "☾ Histórico", tabRel: "◐ Relatório",
  tabHoroscopo: "♓ Horóscopo",
  tabMapa: "✧ Mapa Natal",
  tabPrevisao: "☉ Previsão Anual",
  prevTitulo: "Previsão para",
  prevSub: "O teu ano astrológico, de aniversário a aniversário",
  prevIntro: "A tua previsão anual lê o céu do teu próximo ciclo solar — os grandes movimentos, as oportunidades e os desafios do ano que se abre no teu aniversário.",
  prevGerar: "Gerar a minha previsão",
  prevGerando: "A ler o céu do teu ano... um momento.",
  prevComprar: "A Previsão Anual é um extra que podes adquirir. Revela tudo o que o teu próximo ano astrológico traz.",
  prevVerPlanos: "Ver como adquirir",
  prevRevolucao: "Revolução solar a",
  privExportar: "Extrair os meus dados (PDF)",
  pdfDoc: "Os Meus Dados Astrológicos",
  pdfMapaTitulo: "O Meu Mapa Natal",
  pdfPrevTitulo: "Previsão Anual",
  pdfLeituras: "Histórico de Leituras",
  pdfAsc: "Ascendente", pdfMc: "Meio-Céu", pdfNodo: "Nodo Norte", pdfCasa: "casa",
  pdfVazio: "Ainda não há dados astrológicos para mostrar.",
  pdfRodape: "Documento gerado pela aplicação Oráculo. Os teus dados são teus.",
  mapaTitulo: "O teu Mapa Natal",
  mapaSub: "O céu no instante em que nasceste",
  mapaIntro: "O teu mapa natal é o retrato astrológico único do momento do teu nascimento — os planetas, as casas e os aspetos que moldam quem és. Gera o teu agora.",
  mapaGerar: "Gerar o meu mapa natal",
  mapaGerando: "A ler o céu do teu nascimento... isto pode demorar um momento.",
  mapaSemPerfil: "Preenche a tua data, hora e local de nascimento no perfil para gerar o mapa natal. A hora exata é essencial para as casas e o Ascendente.",
  mapaErro: "Não foi possível gerar o mapa. Tenta de novo.",
  mapaTentar: "Tentar de novo",
  mapaPdf: "Guardar em PDF",
  horoTitulo: "Horóscopo da Semana",
  horoSemanaDe: "Semana de",
  horoCarregar: "A consultar os astros...",
  horoBreve: "O horóscopo desta semana está a ser preparado. Volta em breve.",
  vertente: "Vertente", perguntaLbl: "Pergunta", opcional: "(opcional)",
  perguntaPH: "Ex.: Devo avançar com o novo projeto este mês?",
  tiragemLbl: "Tiragem", carta1: "carta", cartasN: "cartas",
  invTit: "Cartas invertidas", invDesc: "Quando viradas, leem-se como energia bloqueada ou interna",
  baralhar: "Baralhar e tirar as cartas",
  concentra: "Concentra-te na tua questão enquanto as cartas são baralhadas.",
  aBaralhar: "A baralhar… concentra-te na tua questão",
  novaLeitura: "Nova leitura",
  toca: "Toca em cada carta para a revelar — ou", revelaTodas: "revela todas",
  aLer: "A ler as cartas…", tentar: "Tentar novamente",
  guardada: "✓ Leitura guardada na tua conta",
  naoGuardada: "No plano Pro, as tuas leituras ficam guardadas para sempre.",
  conversa: "Conversa sobre esta leitura",
  chatVazio: "Tens dúvidas sobre alguma carta? Queres aprofundar a síntese? Pergunta aqui.",
  chatPH: "Ex.: O que significa A Torre para a minha decisão?",
  enviar: "Enviar", refletir: "☾ a refletir…", outra: "Fazer outra leitura",
  chatErro: "Não consegui responder agora. Tenta de novo.",
  carregando: "A carregar o teu histórico…",
  semLeituras: "Ainda não tens leituras guardadas.",
  primeira: "Fazer a primeira leitura",
  histInstr: "As tuas leituras ficam guardadas na tua conta — dá-lhes um título e acrescenta notas para acompanhares a tua jornada.",
  titulo: "Título", notas: "As tuas notas",
  notasPH: "O que sentiste? O que aconteceu depois? Escreve aqui para voltares a ler mais tarde…",
  guardarAlt: "Guardar alterações", guardado: "✓ Guardado", aGuardar: "A guardar…",
  apagar: "Apagar", confApagar: "Confirmar apagar?",
  mes: "Mês", semMes: "Sem leituras neste mês.",
  leituraS: "leitura", leiturasS: "leituras", invPct: "cartas invertidas",
  vertentes: "Vertentes consultadas", topCartas: "Cartas mais presentes",
  analiseTit: "◐ Análise do mês ◐", regenerar: "Regenerar análise",
  reanalisar: "A reanalisar…", gerarAnalise: "Gerar análise global do mês",
  analisando: "A analisar o teu mês…",
  erroDados: "Não foi possível carregar os teus dados.",
  erroInterp: "Não foi possível obter a interpretação. Tenta novamente.",
  erroGuardar: "A leitura foi interpretada mas não ficou guardada: ",
  limiteTit: "Limite semanal atingido",
  limiteTxt: "No plano gratuito tens uma leitura por semana. Próxima leitura disponível:",
  proxDisp: "Próxima leitura grátis:",
  pub: "Publicidade",
  pubTxt: "Espaço de anúncio discreto (AdSense na versão publicada)",
  disclaimer: "O tarot é uma ferramenta de reflexão e autoconhecimento. As leituras não substituem aconselhamento médico, psicológico, jurídico ou financeiro profissional.",
  videoTit: "Desbloquear mais uma leitura",
  videoTxt: "Vê um vídeo curto e ganha já uma leitura extra, sem esperar.",
  videoBtn: "▶ Ver vídeo e desbloquear",
  videoIndisp: "(Vídeo recompensado disponível na versão publicada da app.)",
  tabPerfil: "✶ Perfil",
  perfilTit: "O teu perfil",
  perfilSub: "Tudo opcional. Quanto mais partilhares, mais pessoal fica a tua leitura.",
  perfilNome: "Nome",
  perfilNasc: "Data de nascimento",
  perfilNascPH: "DD/MM/AAAA",
  perfilHora: "Hora de nascimento",
  perfilHoraPH: "HH:MM (ex. 14:30)",
  perfilHoraAjuda: "Para o ascendente e a lua nas leituras",
  perfilLocal: "Local de nascimento",
  perfilLocalPH: "Cidade, país",
  perfilSigno: "O teu signo solar",
  perfilGenero: "Género",
  perfilGeneroAjuda: "Ajuda a personalizar o tom (opcional)",
  perfilProfissao: "Profissão",
  perfilProfissaoAjuda: "Ajuda a contextualizar leituras de carreira (opcional)",
  generos: ["—", "Feminino", "Masculino", "Não-binário", "Prefiro não dizer"],
  consentTit: "Comunicações Kairos",
  consentTxt: "Aceito receber, ocasionalmente, novidades e ofertas de outros serviços Kairos. Podes retirar este consentimento a qualquer momento. Os teus dados de leitura nunca são partilhados sem esta autorização.",
  perfilGuardar: "Guardar perfil",
  perfilGuardado: "✓ Perfil guardado",
  erroIdade: "Tens de ter pelo menos 18 anos para usar o Oráculo.",
  erroRate: "Demasiados pedidos seguidos. Aguarda um momento e tenta de novo.",
  relCartaMes: "A tua carta do mês",
  relVezes: "vezes",
  relEvolucao: "Como evoluíste",
  relAntes: "antes:",
  relFoco: "Foco",
  relRitmo: "O teu ritmo",
  ritmoManha: "Consultas o Oráculo sobretudo de manhã — começas o dia a ouvir-te.",
  ritmoTarde: "Procuras o Oráculo mais à tarde — uma pausa para refletir no meio do dia.",
  ritmoNoite: "É à noite que mais consultas — o momento de fazer o balanço do dia.",
  ritmoMadrugada: "Consultas o Oráculo na calada da madrugada — quando o mundo silencia.",
  relSint1: "Este mês tiveste",
  relSint2: "sobretudo à volta de",
  relSint3: "com destaque para",
  relSint4: "e uma energia de",
  relElFogo: "ação e paixão", relElTerra: "matéria e concretização", relElAr: "mente e clareza", relElAgua: "emoção e ligação",
  subEstado: "A tua subscrição",
  subAtivo: "Ativa",
  subPlanoAtual: "Plano atual",
  subGerir: "Gerir subscrição e faturas",
  subGerirTxt: "Alterar plano, ver faturas ou cancelar. Abre a página segura de gestão.",
  subCancelarNota: "Podes cancelar a qualquer momento. Manténs o acesso Pro até ao fim do período pago.",
  subComparar: "Free vs Pro",
  subFree: "Free",
  subPro: "Pro",
  subEmBreve: "A gestão de subscrições estará disponível em breve. Para já, contacta o suporte.",
  astroNota: "* Lua aproximada — preenche a hora de nascimento para maior precisão e para veres o teu Ascendente.",
  statDias: "dias com leituras",
  statMedia: "cartas por leitura",
  statMaiores: "Arcanos Maiores",
  statNaipes: "Equilíbrio dos naipes",
  statElemento: "Elemento dominante",
  elFogo: "Fogo · ação e paixão",
  elTerra: "Terra · matéria e trabalho",
  elAr: "Ar · mente e comunicação",
  elAgua: "Água · emoções e relações",
  obTitulo1: "Bem-vindo ao Oráculo",
  obTexto1: "Um espaço de reflexão através do tarot. Escolhes uma tiragem, reveles as cartas, e recebes uma leitura pensada para ti.",
  obTitulo2: "Como funciona uma tiragem",
  obTexto2: "Escolhe o tema (amor, carreira, decisão…) e o tipo de tiragem. Toca em cada carta para a revelar — vês logo o significado. No fim, o Oráculo tece tudo numa leitura completa.",
  obTitulo3: "Torna-a tua",
  obTexto3: "Preenche o perfil com a tua data e hora de nascimento: as leituras passam a cruzar as cartas com o teu Sol, Lua e Ascendente. Quanto mais souber de ti, mais pessoal fica.",
  obSeguinte: "Seguinte",
  obComecar: "Começar",
  obSaltar: "Saltar",
  ajudaTiragem: "Uma tiragem é a forma como as cartas são dispostas. Cada posição tem um significado — quanto mais cartas, mais profunda e detalhada a leitura.",
  ajudaAstro: "☉ Sol: a tua essência e vontade. ☾ Lua: o teu mundo emocional. ↑ Ascendente: a forma como abordas o mundo. O Oráculo cruza os três com as cartas para uma leitura só tua.",
  convTitulo: "Convida e ganha Pro",
  convTxt: "Partilha o teu código. Quando um amigo se regista e faz a primeira leitura, ganham ambos 14 dias de Pro. Até 30 dias no total.",
  convGerar: "Gerar o meu código",
  convCopiar: "Copiar link",
  convCopiado: "Copiado!",
  convJa: "Convites com recompensa:",
  convMax: "máx. 30 dias de Pro",
  memTitulo: "O que o Oráculo sabe sobre ti",
  memTxt: "Factos recolhidos das tuas conversas, usados para tornar as leituras mais pertinentes. Apaga o que não quiseres guardar.",
  memApagar: "Apagar este facto",
  privTitulo: "Privacidade e dados",
  privCodigoBtn: "Gerar código de suporte (24h)",
  privCodigoTxt: "As tuas leituras são privadas. Se pedires ajuda ao suporte, dá-lhes este código — só com ele podem ver o teu histórico, e apenas durante 24 horas.",
  privCodigoGerado: "Código válido por 24h:",
  privApagarHist: "Apagar todo o histórico",
  privApagarHistConf: "Apagar TODAS as tuas leituras e análises? Esta ação não pode ser desfeita.",
  privApagarHistOk: "Histórico apagado.",
  privApagarConta: "Apagar a minha conta",
  privApagarContaConf: "Apagar a tua conta e TODOS os teus dados de forma permanente? Escreve APAGAR para confirmar.",
  privApagarContaOk: "Conta apagada. Até sempre.",
  privErro: "Algo falhou. Tenta de novo.",
  privTit: "Privacidade",
  privTxt: "Os teus dados servem para personalizar as tuas leituras. Não são usados para mais nada sem a tua autorização explícita.",
  soPro: "Exclusivo Pro",
  desbloqueia: "Desbloquear com o Pro",
  proTit: "Oráculo Pro", proSub: "A experiência completa, sem limites",
  proLista: [
    "Leituras ilimitadas, todos os dias",
    "Histórico guardado para sempre, com títulos e notas",
    "O Oráculo lembra-se das tuas leituras e revela padrões",
    "Conversa de aprofundamento após cada leitura",
    "Relatório mensal com análise global por IA",
    "Modelo de IA premium, leituras mais profundas",
    "Sem anúncios",
  ],
  porMes: "/mês", mensal: "Mensal", anual: "Anual",
  poupa: "poupa 25%", equivale: "≈ $3,75/mês",
  assinarMensal: "Assinar mensal — $5/mês",
  assinarAnual: "Assinar anual — $45/ano",
  jaPro: "És Pro ✦ Obrigado por apoiares o Oráculo",
  chatPro: "No Pro podes conversar com o Oráculo sobre cada leitura — tirar dúvidas, aprofundar cartas, pedir conselhos.",
  histPro: "No Pro, todas as leituras ficam guardadas com títulos, notas pessoais e pesquisa.",
  relPro: "No Pro tens o relatório mensal: estatísticas, cartas recorrentes e análise global por IA.",
  vertList: ["Geral", "Amor", "Carreira", "Dinheiro", "Saúde & Energia", "Espiritualidade"],
  tiragens: [
    { id: "dia", nome: "Carta do Dia", desc: "Uma carta para iluminar o teu dia.", pos: ["A tua carta"] },
    { id: "tres", nome: "Três Cartas", desc: "Passado, presente e futuro da questão.", pos: ["Passado", "Presente", "Futuro"] },
    { id: "celta", nome: "Cruz Celta", desc: "A leitura clássica e profunda, em dez posições.",
      pos: ["Situação atual — o presente","O desafio — o que te bloqueia","A base — a raiz da questão","O passado recente","O que podes alcançar — potencial","O futuro próximo","A tua atitude — como te posicionas","Quem te rodeia — influências externas","Esperanças e medos","O resultado provável"] },
  ],
  arcanos: ["O Louco","O Mago","A Sacerdotisa","A Imperatriz","O Imperador","O Hierofante","Os Amantes","O Carro","A Força","O Eremita","A Roda da Fortuna","A Justiça","O Enforcado","A Morte","A Temperança","O Diabo","A Torre","A Estrela","A Lua","O Sol","O Julgamento","O Mundo"],
  naipes: [
    { nome: "Copas", de: "de Copas", el: "Água · emoções" },
    { nome: "Espadas", de: "de Espadas", el: "Ar · mente" },
    { nome: "Paus", de: "de Paus", el: "Fogo · ação" },
    { nome: "Ouros", de: "de Ouros", el: "Terra · matéria" },
  ],
  valores: ["Ás","Dois","Três","Quatro","Cinco","Seis","Sete","Oito","Nove","Dez","Valete","Cavaleiro","Rainha","Rei"],
  arcanoMaior: "Arcano Maior", invertida: "⟲ invertida",
  meses: ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
  semPergunta: "(sem pergunta específica — leitura geral nesta vertente)",
  pCtx: "Contexto da leitura:", pVert: "Vertente", pPerg: "Pergunta do consulente",
  pTir: "Tiragem", pCartas: "Cartas tiradas:",
  pMem: "Leituras anteriores do consulente (usa SÓ se vires padrões relevantes — cartas repetidas, temas recorrentes — e nesse caso menciona-os com naturalidade; caso contrário ignora):",
  pInstr: `Instruções de formato (segue exatamente):
- Para cada carta, escreve uma secção que começa com uma linha "## [Posição] — [Nome da carta]" seguida de um parágrafo curto (3-5 frases) interpretando a carta NESSA posição, na vertente indicada, tendo em conta se está invertida. Sê específico para a pergunta do consulente, nunca genérico.
- No final, escreve uma secção "## Síntese" com 1-2 parágrafos que liguem as cartas entre si e terminem com um conselho prático e concreto.
- Não uses asteriscos, negrito, listas nem emojis. Apenas as linhas "## " e parágrafos.`,
  pAnalise: (mes, ano, resumo, stats) => `Analisa o conjunto de leituras de tarot do consulente em ${mes} de ${ano}:

${resumo}

Estatísticas: ${stats}

Escreve uma análise global do mês com estas secções (formato: linhas "## " para títulos, parágrafos simples, sem asteriscos, listas ou emojis):
## O fio condutor do mês — que tema ou energia dominante atravessa estas leituras (2-4 frases)
## Padrões e cartas recorrentes — o que significam as repetições e a proporção de invertidas (2-4 frases)
## Áreas de atenção — onde as leituras sugerem cuidado ou trabalho interior (2-3 frases)
## Conselho para o próximo mês — orientação prática e concreta (2-3 frases)
Sê específico ao que os dados mostram; nunca genérico.`,
};

const BR = {
  ...PT,
  prevSub: "Seu ano astrológico, de aniversário a aniversário",
  prevGerar: "Gerar minha previsão",
  privExportar: "Extrair meus dados (PDF)",
  pdfDoc: "Meus Dados Astrológicos",
  pdfMapaTitulo: "Meu Mapa Natal",
  pdfRodape: "Documento gerado pelo aplicativo Oráculo. Seus dados são seus.",
  mapaTitulo: "Seu Mapa Natal",
  mapaSub: "O céu no instante em que você nasceu",
  mapaGerar: "Gerar meu mapa natal",
  mapaSemPerfil: "Preencha sua data, hora e local de nascimento no perfil para gerar o mapa natal. A hora exata é essencial para as casas e o Ascendente.",
  convTxt: "Compartilhe seu código. Quando um amigo se cadastra e faz a primeira leitura, ambos ganham 14 dias de Pro. Até 30 dias no total.",
  convGerar: "Gerar meu código",
  convCopiar: "Copiar link",
  horoTitulo: "Horóscopo da Semana",
  horoCarregar: "Consultando os astros...",
  horoBreve: "O horóscopo desta semana está sendo preparado. Volte em breve.",
  erroIdade: "Você precisa ter pelo menos 18 anos para usar o Oráculo.",
  erroRate: "Muitos pedidos seguidos. Aguarde um momento e tente de novo.",
  relCartaMes: "Sua carta do mês",
  relVezes: "vezes",
  relEvolucao: "Como você evoluiu",
  relAntes: "antes:",
  relFoco: "Foco",
  relRitmo: "Seu ritmo",
  ritmoManha: "Você consulta o Oráculo sobretudo de manhã — começa o dia se ouvindo.",
  ritmoTarde: "Procura o Oráculo mais à tarde — uma pausa para refletir no meio do dia.",
  ritmoNoite: "É à noite que mais consulta — o momento de fazer o balanço do dia.",
  ritmoMadrugada: "Consulta o Oráculo na madrugada — quando o mundo silencia.",
  relSint1: "Este mês você teve",
  relSint2: "sobretudo em torno de",
  relSint3: "com destaque para",
  relSint4: "e uma energia de",
  relElFogo: "ação e paixão", relElTerra: "matéria e concretização", relElAr: "mente e clareza", relElAgua: "emoção e ligação",
  subEstado: "Sua assinatura",
  subAtivo: "Ativa",
  subPlanoAtual: "Plano atual",
  subGerir: "Gerenciar assinatura e faturas",
  subGerirTxt: "Alterar plano, ver faturas ou cancelar. Abre a página segura de gerenciamento.",
  subCancelarNota: "Você pode cancelar quando quiser. Mantém o acesso Pro até o fim do período pago.",
  subComparar: "Free vs Pro",
  subFree: "Free",
  subPro: "Pro",
  subEmBreve: "O gerenciamento de assinaturas estará disponível em breve. Por ora, contate o suporte.",
  astroNota: "* Lua aproximada — preencha a hora de nascimento para maior precisão e para ver seu Ascendente.",
  statDias: "dias com leituras",
  statMedia: "cartas por leitura",
  statMaiores: "Arcanos Maiores",
  statNaipes: "Equilíbrio dos naipes",
  statElemento: "Elemento dominante",
  elFogo: "Fogo · ação e paixão",
  elTerra: "Terra · matéria e trabalho",
  elAr: "Ar · mente e comunicação",
  elAgua: "Água · emoções e relações",
  obTitulo1: "Bem-vindo ao Oráculo",
  obTexto1: "Um espaço de reflexão através do tarô. Você escolhe uma tiragem, revela as cartas, e recebe uma leitura pensada para você.",
  obTitulo2: "Como funciona uma tiragem",
  obTexto2: "Escolha o tema (amor, carreira, decisão…) e o tipo de tiragem. Toque em cada carta para revelá-la — você vê logo o significado. No fim, o Oráculo tece tudo numa leitura completa.",
  obTitulo3: "Torne-a sua",
  obTexto3: "Preencha o perfil com sua data e hora de nascimento: as leituras passam a cruzar as cartas com seu Sol, Lua e Ascendente. Quanto mais souber de você, mais pessoal fica.",
  obSeguinte: "Seguinte",
  obComecar: "Começar",
  obSaltar: "Pular",
  memTitulo: "O que o Oráculo sabe sobre você",
  memTxt: "Fatos coletados das suas conversas, usados para tornar as leituras mais pertinentes. Apague o que não quiser guardar.",
  memApagar: "Apagar este fato",
  privTitulo: "Privacidade e dados",
  privCodigoBtn: "Gerar código de suporte (24h)",
  privCodigoTxt: "Suas leituras são privadas. Se pedir ajuda ao suporte, informe este código — só com ele podem ver seu histórico, e apenas por 24 horas.",
  privCodigoGerado: "Código válido por 24h:",
  privApagarHist: "Apagar todo o histórico",
  privApagarHistConf: "Apagar TODAS as suas leituras e análises? Esta ação não pode ser desfeita.",
  privApagarHistOk: "Histórico apagado.",
  privApagarConta: "Apagar minha conta",
  privApagarContaConf: "Apagar sua conta e TODOS os seus dados de forma permanente? Digite APAGAR para confirmar.",
  privApagarContaOk: "Conta apagada. Até sempre.",
  privErro: "Algo falhou. Tente de novo.",
  sub: "Seu baralho, sempre com você",
  bemVindo: "Bem-vindo de volta", criaConta: "Crie sua conta",
  authSub: "Suas leituras, só suas, em segurança.",
  nomePH: "Seu nome", passVer: "Mostrar senha", passOcultar: "Ocultar senha", passPH: "Senha (mín. 6 caracteres)",
  preenche: "Preencha o email e a senha.",
  contaCriada: "Conta criada! Verifique seu email para confirmar e depois entre.",
  perguntaPH: "Ex.: Devo avançar com o novo projeto este mês?",
  invDesc: "Quando viradas, são lidas como energia bloqueada ou interna",
  baralhar: "Embaralhar e tirar as cartas",
  concentra: "Concentre-se na sua questão enquanto as cartas são embaralhadas.",
  aBaralhar: "Embaralhando… concentre-se na sua questão",
  toca: "Toque em cada carta para revelar — ou", revelaTodas: "revele todas",
  aLer: "Lendo as cartas…", tentar: "Tentar novamente",
  guardada: "✓ Leitura salva na sua conta",
  naoGuardada: "No plano Pro, suas leituras ficam salvas para sempre.",
  conversa: "Converse sobre esta leitura",
  chatVazio: "Tem dúvidas sobre alguma carta? Quer aprofundar a síntese? Pergunte aqui.",
  chatErro: "Não consegui responder agora. Tente de novo.",
  carregando: "Carregando seu histórico…",
  semLeituras: "Você ainda não tem leituras salvas.",
  primeira: "Fazer a primeira leitura",
  histInstr: "Suas leituras ficam salvas na sua conta — dê títulos e acrescente notas para acompanhar sua jornada.",
  notas: "Suas notas",
  notasPH: "O que você sentiu? O que aconteceu depois? Escreva aqui para reler mais tarde…",
  guardarAlt: "Salvar alterações", guardado: "✓ Salvo", aGuardar: "Salvando…",
  confApagar: "Confirmar exclusão?",
  limiteTxt: "No plano gratuito você tem uma leitura por semana. Próxima leitura disponível:",
  proxDisp: "Próxima leitura grátis:",
  pubTxt: "Espaço de anúncio discreto (AdSense na versão publicada)",
  disclaimer: "O tarô é uma ferramenta de reflexão e autoconhecimento. As leituras não substituem aconselhamento médico, psicológico, jurídico ou financeiro profissional.",
  videoTit: "Desbloquear mais uma leitura",
  videoTxt: "Assista a um vídeo curto e ganhe agora uma leitura extra, sem esperar.",
  videoBtn: "▶ Assistir vídeo e desbloquear",
  videoIndisp: "(Vídeo recompensado disponível na versão publicada do app.)",
  perfilSub: "Tudo opcional. Quanto mais você compartilhar, mais pessoal fica sua leitura.",
  perfilHoraAjuda: "Para o ascendente e a lua nas leituras",
  perfilLocalPH: "Cidade, país",
  perfilSigno: "Seu signo solar",
  perfilGeneroAjuda: "Ajuda a personalizar o tom (opcional)",
  perfilProfissaoAjuda: "Ajuda a contextualizar leituras de carreira (opcional)",
  generos: ["—", "Feminino", "Masculino", "Não-binário", "Prefiro não dizer"],
  consentTxt: "Aceito receber, ocasionalmente, novidades e ofertas de outros serviços Kairos. Você pode retirar este consentimento a qualquer momento. Seus dados de leitura nunca são compartilhados sem esta autorização.",
  perfilTit: "Seu perfil",
  privTxt: "Seus dados servem para personalizar suas leituras. Não são usados para mais nada sem sua autorização explícita.",
  proLista: [
    "Leituras ilimitadas, todos os dias",
    "Histórico salvo para sempre, com títulos e notas",
    "O Oráculo lembra das suas leituras e revela padrões",
    "Conversa de aprofundamento após cada leitura",
    "Relatório mensal com análise global por IA",
    "Modelo de IA premium, leituras mais profundas",
    "Sem anúncios",
  ],
  poupa: "economize 25%",
  jaPro: "Você é Pro ✦ Obrigado por apoiar o Oráculo",
  chatPro: "No Pro você conversa com o Oráculo sobre cada leitura — tirar dúvidas, aprofundar cartas, pedir conselhos.",
  histPro: "No Pro, todas as leituras ficam salvas com títulos, notas pessoais e busca.",
  relPro: "No Pro você tem o relatório mensal: estatísticas, cartas recorrentes e análise global por IA.",
  erroDados: "Não foi possível carregar seus dados.",
  erroInterp: "Não foi possível obter a interpretação. Tente novamente.",
  erroGuardar: "A leitura foi interpretada mas não ficou salva: ",
  semPergunta: "(sem pergunta específica — leitura geral nesta vertente)",
  pInstr: PT.pInstr.replaceAll("Sê específico", "Seja específico").replaceAll("escreve", "escreva").replaceAll("Não uses", "Não use"),
};

const EN = {
  sub: "Your deck, always with you",
  bemVindo: "Welcome back", criaConta: "Create your account",
  authSub: "Your readings, yours alone, kept safe.",
  entrar: "Sign in", registar: "Sign up", nomePH: "Your name",
  passVer: "Show password", passOcultar: "Hide password", passPH: "Password (min. 6 characters)",
  preenche: "Please fill in email and password.",
  contaCriada: "Account created! Check your email to confirm, then sign in.",
  momento: "One moment…", criarConta: "Create account", sair: "Sign out",
  tabLeitura: "✦ Reading", tabHist: "☾ History", tabRel: "◐ Report",
  tabHoroscopo: "♓ Horoscope",
  tabMapa: "✧ Birth Chart",
  tabPrevisao: "☉ Yearly Forecast",
  prevTitulo: "Forecast for",
  prevSub: "Your astrological year, birthday to birthday",
  prevIntro: "Your yearly forecast reads the sky of your next solar cycle — the major movements, opportunities and challenges of the year that opens on your birthday.",
  prevGerar: "Generate my forecast",
  prevGerando: "Reading the sky of your year... one moment.",
  prevComprar: "The Yearly Forecast is an add-on you can purchase. It reveals everything your next astrological year holds.",
  prevVerPlanos: "See how to get it",
  prevRevolucao: "Solar return on",
  privExportar: "Export my data (PDF)",
  pdfDoc: "My Astrological Data",
  pdfMapaTitulo: "My Birth Chart",
  pdfPrevTitulo: "Yearly Forecast",
  pdfLeituras: "Reading History",
  pdfAsc: "Ascendant", pdfMc: "Midheaven", pdfNodo: "North Node", pdfCasa: "house",
  pdfVazio: "No astrological data to show yet.",
  pdfRodape: "Document generated by the Oráculo app. Your data is yours.",
  mapaTitulo: "Your Birth Chart",
  mapaSub: "The sky at the moment you were born",
  mapaIntro: "Your birth chart is the unique astrological portrait of your moment of birth — the planets, houses and aspects that shape who you are. Generate yours now.",
  mapaGerar: "Generate my birth chart",
  mapaGerando: "Reading the sky of your birth... this may take a moment.",
  mapaSemPerfil: "Fill in your birth date, time and place in your profile to generate the chart. The exact time is essential for the houses and Ascendant.",
  mapaErro: "Could not generate the chart. Please try again.",
  mapaTentar: "Try again",
  mapaPdf: "Save as PDF",
  horoTitulo: "Horoscope of the Week",
  horoSemanaDe: "Week of",
  horoCarregar: "Consulting the stars...",
  horoBreve: "This week's horoscope is being prepared. Come back soon.",
  vertente: "Theme", perguntaLbl: "Question", opcional: "(optional)",
  perguntaPH: "E.g.: Should I move forward with the new project this month?",
  tiragemLbl: "Spread", carta1: "card", cartasN: "cards",
  invTit: "Reversed cards", invDesc: "When reversed, cards read as blocked or internalized energy",
  baralhar: "Shuffle and draw the cards",
  concentra: "Focus on your question while the cards are shuffled.",
  aBaralhar: "Shuffling… focus on your question",
  novaLeitura: "New reading",
  toca: "Tap each card to reveal it — or", revelaTodas: "reveal all",
  aLer: "Reading the cards…", tentar: "Try again",
  guardada: "✓ Reading saved to your account",
  naoGuardada: "With Pro, your readings are saved forever.",
  conversa: "Talk about this reading",
  chatVazio: "Questions about a card? Want to go deeper? Ask here.",
  chatPH: "E.g.: What does The Tower mean for my decision?",
  enviar: "Send", refletir: "☾ reflecting…", outra: "Do another reading",
  chatErro: "Couldn't answer right now. Try again.",
  carregando: "Loading your history…",
  semLeituras: "No saved readings yet.",
  primeira: "Do your first reading",
  histInstr: "Your readings are saved to your account — give them titles and add notes to follow your journey.",
  titulo: "Title", notas: "Your notes",
  notasPH: "How did it feel? What happened afterwards? Write it down to revisit later…",
  guardarAlt: "Save changes", guardado: "✓ Saved", aGuardar: "Saving…",
  apagar: "Delete", confApagar: "Confirm delete?",
  mes: "Month", semMes: "No readings this month.",
  leituraS: "reading", leiturasS: "readings", invPct: "reversed cards",
  vertentes: "Themes consulted", topCartas: "Most present cards",
  analiseTit: "◐ Monthly analysis ◐", regenerar: "Regenerate analysis",
  reanalisar: "Reanalyzing…", gerarAnalise: "Generate monthly analysis",
  analisando: "Analyzing your month…",
  erroDados: "Couldn't load your data.",
  erroInterp: "Couldn't get the interpretation. Please try again.",
  erroGuardar: "The reading was interpreted but not saved: ",
  limiteTit: "Weekly limit reached",
  limiteTxt: "The free plan includes one reading per week. Next reading available:",
  proxDisp: "Next free reading:",
  pub: "Advertisement",
  pubTxt: "Discreet ad slot (AdSense in the published version)",
  disclaimer: "Tarot is a tool for reflection and self-knowledge. Readings are not a substitute for professional medical, psychological, legal or financial advice.",
  videoTit: "Unlock another reading",
  videoTxt: "Watch a short video and get an extra reading right now, no waiting.",
  videoBtn: "▶ Watch video to unlock",
  videoIndisp: "(Rewarded video available in the published app.)",
  tabPerfil: "✶ Profile",
  perfilTit: "Your profile",
  perfilSub: "All optional. The more you share, the more personal your reading becomes.",
  perfilNome: "Name",
  perfilNasc: "Date of birth",
  perfilNascPH: "DD/MM/YYYY",
  perfilHora: "Time of birth",
  perfilHoraPH: "HH:MM (e.g. 14:30)",
  perfilHoraAjuda: "For the ascendant and moon in your readings",
  perfilLocal: "Place of birth",
  perfilLocalPH: "City, country",
  perfilSigno: "Your sun sign",
  perfilGenero: "Gender",
  perfilGeneroAjuda: "Helps personalize the tone (optional)",
  perfilProfissao: "Occupation",
  perfilProfissaoAjuda: "Helps frame career readings (optional)",
  generos: ["—", "Female", "Male", "Non-binary", "Prefer not to say"],
  consentTit: "Kairos communications",
  consentTxt: "I agree to occasionally receive news and offers from other Kairos services. You can withdraw this consent at any time. Your reading data is never shared without this authorization.",
  perfilGuardar: "Save profile",
  perfilGuardado: "✓ Profile saved",
  erroIdade: "You must be at least 18 to use Oráculo.",
  erroRate: "Too many requests in a row. Please wait a moment and try again.",
  relCartaMes: "Your card of the month",
  relVezes: "times",
  relEvolucao: "How you evolved",
  relAntes: "before:",
  relFoco: "Focus",
  relRitmo: "Your rhythm",
  ritmoManha: "You consult Oráculo mostly in the morning — starting the day by listening to yourself.",
  ritmoTarde: "You seek Oráculo more in the afternoon — a pause to reflect mid-day.",
  ritmoNoite: "It's at night you consult most — the moment to take stock of the day.",
  ritmoMadrugada: "You consult Oráculo in the small hours — when the world falls silent.",
  relSint1: "This month you had",
  relSint2: "mostly around",
  relSint3: "notably",
  relSint4: "and an energy of",
  relElFogo: "action and passion", relElTerra: "matter and grounding", relElAr: "mind and clarity", relElAgua: "emotion and connection",
  subEstado: "Your subscription",
  subAtivo: "Active",
  subPlanoAtual: "Current plan",
  subGerir: "Manage subscription & invoices",
  subGerirTxt: "Change plan, view invoices or cancel. Opens the secure management page.",
  subCancelarNota: "You can cancel anytime. You keep Pro access until the end of the paid period.",
  subComparar: "Free vs Pro",
  subFree: "Free",
  subPro: "Pro",
  subEmBreve: "Subscription management will be available soon. For now, please contact support.",
  astroNota: "* Moon is approximate — add your birth time for precision and to see your Ascendant.",
  statDias: "days with readings",
  statMedia: "cards per reading",
  statMaiores: "Major Arcana",
  statNaipes: "Suit balance",
  statElemento: "Dominant element",
  elFogo: "Fire · action and passion",
  elTerra: "Earth · matter and work",
  elAr: "Air · mind and communication",
  elAgua: "Water · emotions and relationships",
  obTitulo1: "Welcome to Oráculo",
  obTexto1: "A space for reflection through tarot. You choose a spread, reveal the cards, and receive a reading made for you.",
  obTitulo2: "How a spread works",
  obTexto2: "Pick a theme (love, career, a decision…) and the type of spread. Tap each card to reveal it — you see its meaning right away. At the end, Oráculo weaves it all into a full reading.",
  obTitulo3: "Make it yours",
  obTexto3: "Fill in your profile with your birth date and time: readings will then cross the cards with your Sun, Moon and Ascendant. The more it knows about you, the more personal it gets.",
  obSeguinte: "Next",
  obComecar: "Begin",
  obSaltar: "Skip",
  ajudaTiragem: "A spread is how the cards are laid out. Each position has a meaning — more cards means a deeper, more detailed reading.",
  ajudaAstro: "☉ Sun: your essence and will. ☾ Moon: your emotional world. ↑ Rising: how you approach the world. Oráculo crosses all three with the cards for a reading that's uniquely yours.",
  convTitulo: "Invite & earn Pro",
  convTxt: "Share your code. When a friend signs up and does their first reading, you both get 14 days of Pro. Up to 30 days total.",
  convGerar: "Generate my code",
  convCopiar: "Copy link",
  convCopiado: "Copied!",
  convJa: "Rewarded invites:",
  convMax: "max. 30 days of Pro",
  memTitulo: "What Oráculo knows about you",
  memTxt: "Facts gathered from your conversations, used to make readings more relevant. Delete anything you'd rather not keep.",
  memApagar: "Delete this fact",
  privTitulo: "Privacy & data",
  privCodigoBtn: "Generate support code (24h)",
  privCodigoTxt: "Your readings are private. If you ask support for help, give them this code — only with it can they see your history, and only for 24 hours.",
  privCodigoGerado: "Code valid for 24h:",
  privApagarHist: "Delete all history",
  privApagarHistConf: "Delete ALL your readings and analyses? This cannot be undone.",
  privApagarHistOk: "History deleted.",
  privApagarConta: "Delete my account",
  privApagarContaConf: "Permanently delete your account and ALL your data? Type APAGAR to confirm.",
  privApagarContaOk: "Account deleted. Farewell.",
  privErro: "Something failed. Please try again.",
  privTit: "Privacy",
  privTxt: "Your data is used to personalize your readings. It is not used for anything else without your explicit consent.",
  signos: { "Capricórnio": "Capricorn", "Aquário": "Aquarius", "Peixes": "Pisces", "Carneiro": "Aries", "Touro": "Taurus", "Gémeos": "Gemini", "Caranguejo": "Cancer", "Leão": "Leo", "Virgem": "Virgo", "Balança": "Libra", "Escorpião": "Scorpio", "Sagitário": "Sagittarius" },
  soPro: "Pro only",
  desbloqueia: "Unlock with Pro",
  proTit: "Oráculo Pro", proSub: "The full experience, no limits",
  proLista: [
    "Unlimited readings, every day",
    "History saved forever, with titles and notes",
    "The Oracle remembers your readings and reveals patterns",
    "Follow-up conversation after each reading",
    "Monthly report with AI-powered global analysis",
    "Premium AI model, deeper readings",
    "No ads",
  ],
  porMes: "/mo", mensal: "Monthly", anual: "Yearly",
  poupa: "save 25%", equivale: "≈ $3.75/mo",
  assinarMensal: "Subscribe monthly — $5/mo",
  assinarAnual: "Subscribe yearly — $45/yr",
  jaPro: "You're Pro ✦ Thank you for supporting Oráculo",
  chatPro: "With Pro you can talk to the Oracle about each reading — ask questions, go deeper, get advice.",
  histPro: "With Pro, every reading is saved with titles, personal notes and search.",
  relPro: "With Pro you get the monthly report: stats, recurring cards and AI global analysis.",
  vertList: ["General", "Love", "Career", "Money", "Health & Energy", "Spirituality"],
  tiragens: [
    { id: "dia", nome: "Card of the Day", desc: "One card to light your day.", pos: ["Your card"] },
    { id: "tres", nome: "Three Cards", desc: "Past, present and future of the matter.", pos: ["Past", "Present", "Future"] },
    { id: "celta", nome: "Celtic Cross", desc: "The classic, deep ten-position reading.",
      pos: ["Current situation — the present","The challenge — what blocks you","The foundation — root of the matter","The recent past","What you can reach — potential","The near future","Your attitude — how you stand","Those around you — external influences","Hopes and fears","The likely outcome"] },
  ],
  arcanos: ["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"],
  naipes: [
    { nome: "Cups", de: "of Cups", el: "Water · emotions" },
    { nome: "Swords", de: "of Swords", el: "Air · mind" },
    { nome: "Wands", de: "of Wands", el: "Fire · action" },
    { nome: "Pentacles", de: "of Pentacles", el: "Earth · matter" },
  ],
  valores: ["Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Page","Knight","Queen","King"],
  arcanoMaior: "Major Arcana", invertida: "⟲ reversed",
  meses: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  semPergunta: "(no specific question — general reading on this theme)",
  pCtx: "Reading context:", pVert: "Theme", pPerg: "Querent's question",
  pTir: "Spread", pCartas: "Cards drawn:",
  pMem: "Querent's previous readings (use ONLY if you see relevant patterns — repeated cards, recurring themes — and mention them naturally; otherwise ignore):",
  pInstr: `Format instructions (follow exactly):
- For each card, write a section starting with a line "## [Position] — [Card name]" followed by a short paragraph (3-5 sentences) interpreting the card IN THAT position, on the given theme, accounting for reversal. Be specific to the querent's question, never generic.
- End with a "## Synthesis" section: 1-2 paragraphs tying the cards together, closing with concrete, practical advice.
- No asterisks, bold, lists or emojis. Only "## " lines and paragraphs.`,
  pAnalise: (mes, ano, resumo, stats) => `Analyze the querent's tarot readings from ${mes} ${ano}:

${resumo}

Statistics: ${stats}

Write a global analysis of the month with these sections (format: "## " lines for titles, plain paragraphs, no asterisks, lists or emojis):
## The thread of the month — the dominant theme or energy across these readings (2-4 sentences)
## Patterns and recurring cards — what the repetitions and reversal ratio mean (2-4 sentences)
## Areas of attention — where the readings suggest care or inner work (2-3 sentences)
## Advice for next month — practical, concrete guidance (2-3 sentences)
Be specific to what the data shows; never generic.`,
};

const LOCALES = { "pt-PT": PT, "pt-BR": BR, "en": EN };
const ROMANOS = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const VALOR_CURTO = ["A","2","3","4","5","6","7","8","9","10","V","C","D","R"];
const NAIPE_KEYS = ["Copas","Espadas","Paus","Ouros"];

function construirBaralho(L) {
  const cartas = [];
  L.arcanos.forEach((nome, i) =>
    cartas.push({ id: `M${i}`, nome, marca: ROMANOS[i], naipe: null, sub: L.arcanoMaior, maior: true })
  );
  L.naipes.forEach((n, ni) =>
    L.valores.forEach((v, i) =>
      cartas.push({ id: `${NAIPE_KEYS[ni]}${i}`, nome: `${v} ${n.de}`, marca: VALOR_CURTO[i], naipe: NAIPE_KEYS[ni], sub: n.el })
    )
  );
  return cartas;
}

/* ─────────── SUPABASE HELPERS ─────────── */

// ─── Supabase SDK helpers ───

async function authRegistar(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { nome } }
  });
  if (error) throw new Error(error.message);
  return data;
}

async function authEntrar(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function authSessaoAtual() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

const dbGet = async (token, path) => {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    }
  });
  if (!r.ok) throw new Error("db");
  return r.json();
};

async function dbCriarLeitura(token, leitura) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leituras`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: "return=representation" },
    body: JSON.stringify(leitura),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Erro a criar leitura");
  return Array.isArray(d) ? d[0] : d;
}

async function dbAtualizarLeitura(token, id, campos) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leituras?id=eq.${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify(campos),
  });
  if (!r.ok) throw new Error("Erro a atualizar leitura");
}

async function dbApagarLeitura(token, id) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leituras?id=eq.${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Erro a apagar leitura");
}

async function dbGuardarAnalise(token, userId, mes, texto) {
  await fetch(`${SUPABASE_URL}/rest/v1/analises_mensais`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: userId, mes, texto }),
  });
}

async function chamarIA(token, messages, tipo, idioma, cartaIds) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/interpretar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages, tipo, idioma, carta_ids: cartaIds || [] }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) {
    const e = new Error(d.error || "Erro na interpretação");
    e.codigo = d.codigo;
    e.proxima = d.proxima;
    throw e;
  }
  return d.texto;
}

function emBlocos(texto) {
  return (texto || "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) =>
    l.startsWith("## ") ? { t: "h", txt: l.slice(3) } : { t: "p", txt: l }
  );
}

function dataPt(iso, L) {
  const d = new Date(iso);
  return `${d.getDate()} ${L.meses[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

async function dbAtualizarPerfil(token, campos) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${campos.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify(campos.dados),
  });
  if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || "Erro a guardar perfil"); }
}

async function dbGuardarConsentimento(token, userId, finalidade, concedido) {
  await fetch(`${SUPABASE_URL}/rest/v1/consentimentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ user_id: userId, finalidade, concedido, atualizado_em: new Date().toISOString() }),
  });
}

// Signo solar a partir da data (cálculo exato, sem dependências)
const SIGNOS = [
  { nome: "Capricórnio", ate: [1, 19] }, { nome: "Aquário", ate: [2, 18] },
  { nome: "Peixes", ate: [3, 20] }, { nome: "Carneiro", ate: [4, 19] },
  { nome: "Touro", ate: [5, 20] }, { nome: "Gémeos", ate: [6, 20] },
  { nome: "Caranguejo", ate: [7, 22] }, { nome: "Leão", ate: [8, 22] },
  { nome: "Virgem", ate: [9, 22] }, { nome: "Balança", ate: [10, 22] },
  { nome: "Escorpião", ate: [11, 21] }, { nome: "Sagitário", ate: [12, 21] },
  { nome: "Capricórnio", ate: [12, 31] },
];
function idadeAnos(dataISO) {
  if (!dataISO) return null;
  const nasc = new Date(dataISO + "T00:00:00");
  if (isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

// ── Astronomia leve: Lua e Ascendente (algoritmos padrão, precisão suficiente para signos)
const SIGNOS_ORD = ["Carneiro","Touro","Gémeos","Caranguejo","Leão","Virgem","Balança","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];
const CIDADES_PT = {
  "lisboa":[38.72,-9.14],"porto":[41.15,-8.61],"braga":[41.55,-8.42],"guimaraes":[41.44,-8.30],
  "vila do conde":[41.35,-8.74],"povoa de varzim":[41.38,-8.76],"matosinhos":[41.18,-8.70],
  "gaia":[41.13,-8.61],"vila nova de gaia":[41.13,-8.61],"coimbra":[40.21,-8.43],"aveiro":[40.64,-8.65],
  "leiria":[39.74,-8.81],"setubal":[38.52,-8.89],"faro":[37.02,-7.93],"evora":[38.57,-7.91],
  "viseu":[40.66,-7.91],"guarda":[40.54,-7.27],"braganca":[41.81,-6.76],"funchal":[32.65,-16.91],
  "ponta delgada":[37.74,-25.67],"viana do castelo":[41.69,-8.83],"santarem":[39.24,-8.69],
  "beja":[38.02,-7.86],"castelo branco":[39.82,-7.49],"portalegre":[39.29,-7.43],"barcelos":[41.53,-8.62],
  "famalicao":[41.41,-8.52],"maia":[41.23,-8.62],"valongo":[41.19,-8.50],
  "sao paulo":[-23.55,-46.63],"rio de janeiro":[-22.91,-43.17],"belo horizonte":[-19.92,-43.94],
  "brasilia":[-15.79,-47.88],"salvador":[-12.97,-38.51],"fortaleza":[-3.72,-38.54],"recife":[-8.05,-34.88],
  "curitiba":[-25.43,-49.27],"porto alegre":[-30.03,-51.23],"luanda":[-8.84,13.23],"maputo":[-25.97,32.58],
  "londres":[51.51,-0.13],"london":[51.51,-0.13],"paris":[48.86,2.35],"madrid":[40.42,-3.70],
};
function coordsDe(local) {
  if (!local) return null;
  const l = local.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  for (const cidade in CIDADES_PT) if (l.includes(cidade)) return CIDADES_PT[cidade];
  return [39.5, -8.0];
}
function diaJuliano(d) { return d.getTime() / 86400000 + 2440587.5; }
// Longitude eclíptica da Lua (série abreviada, erro < ~0.5°, suficiente para o signo)
function luaLongitude(jd) {
  const T = (jd - 2451545) / 36525;
  const L = 218.316 + 481267.8813 * T;
  const M = 134.963 + 477198.8676 * T;
  const Ms = 357.529 + 35999.0503 * T;
  const D = 297.850 + 445267.1115 * T;
  const F = 93.272 + 483202.0175 * T;
  const r = Math.PI / 180;
  let lon = L
    + 6.289 * Math.sin(M * r)
    - 1.274 * Math.sin((2 * D - M) * r)
    + 0.658 * Math.sin(2 * D * r)
    - 0.186 * Math.sin(Ms * r)
    - 0.059 * Math.sin((2 * M - 2 * D) * r)
    - 0.057 * Math.sin((M - 2 * D + Ms) * r)
    + 0.053 * Math.sin((M + 2 * D) * r)
    + 0.046 * Math.sin((2 * D - Ms) * r)
    + 0.041 * Math.sin((M - Ms) * r)
    - 0.035 * Math.sin(D * r)
    - 0.031 * Math.sin((M + Ms) * r)
    - 0.015 * Math.sin((2 * F - 2 * D) * r)
    + 0.011 * Math.sin((M - 4 * D) * r);
  return ((lon % 360) + 360) % 360;
}
function luaSignoDe(dataISO, hora) {
  if (!dataISO) return null;
  const h = hora && /^\d{2}:\d{2}/.test(hora) ? hora : "12:00";
  const d = new Date(dataISO + "T" + h + ":00Z");
  if (isNaN(d.getTime())) return null;
  return { signo: SIGNOS_ORD[Math.floor(luaLongitude(diaJuliano(d)) / 30)], aprox: !(hora && /^\d{2}:\d{2}/.test(hora)) };
}
function ascendenteDe(dataISO, hora, local) {
  if (!dataISO || !hora || !/^\d{2}:\d{2}/.test(hora) || !local) return null;
  const coords = coordsDe(local);
  if (!coords) return null;
  const [lat, lon] = coords;
  const d = new Date(dataISO + "T" + hora + ":00Z");
  if (isNaN(d.getTime())) return null;
  const jd = diaJuliano(d);
  const T = (jd - 2451545) / 36525;
  // Tempo sideral de Greenwich (graus)
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T;
  gst = ((gst % 360) + 360) % 360;
  const lst = ((gst + lon) % 360 + 360) % 360;
  const r = Math.PI / 180;
  const eps = 23.4393 * r, phi = lat * r, ramc = lst * r;
  let asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  let deg = ((asc / r) % 360 + 360) % 360;
  return SIGNOS_ORD[Math.floor(deg / 30)];
}

function signoDe(dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO + "T12:00:00");
  const mes = d.getMonth() + 1, dia = d.getDate();
  for (const s of SIGNOS) {
    if (mes < s.ate[0] || (mes === s.ate[0] && dia <= s.ate[1])) return s.nome;
  }
  return "Capricórnio";
}

// Converte "DD/MM/AAAA" (ou "DD-MM-AAAA", "DDMMAAAA") em ISO "AAAA-MM-DD"
function dataParaISO(txt) {
  if (!txt) return "";
  const limpo = txt.replace(/[^0-9]/g, "");
  if (limpo.length !== 8) return "";
  const dia = limpo.slice(0, 2), mes = limpo.slice(2, 4), ano = limpo.slice(4, 8);
  const d = parseInt(dia, 10), m = parseInt(mes, 10);
  if (d < 1 || d > 31 || m < 1 || m > 12) return "";
  return `${ano}-${mes}-${dia}`;
}

// Converte ISO "AAAA-MM-DD" de volta para "DD/MM/AAAA" (para mostrar)
function isoParaData(iso) {
  if (!iso) return "";
  const p = iso.split("-");
  if (p.length !== 3) return "";
  return `${p[2]}/${p[1]}/${p[0]}`;
}

// Normaliza hora escrita "HHMM" ou "HH:MM" -> "HH:MM"
function horaNormalizar(txt) {
  if (!txt) return "";
  const limpo = txt.replace(/[^0-9]/g, "");
  if (limpo.length < 3) return "";
  const h = limpo.slice(0, 2), min = limpo.slice(2, 4).padEnd(2, "0");
  if (parseInt(h, 10) > 23 || parseInt(min, 10) > 59) return "";
  return `${h}:${min}`;
}

/* ─────────── VISUAIS ─────────── */

const Icone = ({ naipe, size = 22, color = "#8a6a2e" }) => {
  const s = { width: size, height: size, display: "block" };
  const p = { fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (naipe) {
    case "Copas":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 4h12v4a6 6 0 0 1-12 0V4z" /><path {...p} d="M12 14v5M8 19h8" /><path {...p} d="M9 7h6" opacity=".5" /></svg>);
    case "Espadas":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 2v15M12 2l-2.5 4M12 2l2.5 4" /><path {...p} d="M8 17h8M12 17v5" /></svg>);
    case "Paus":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 21V6" /><path {...p} d="M12 6c-2.5-1-3-3.5-1.5-4 1.6-.5 3.5 1.5 1.5 4z" /><path {...p} d="M9 13l3-2 3 2" /></svg>);
    case "Ouros":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3l6 9-6 9-6-9 6-9z" /><circle {...p} cx="12" cy="12" r="2.2" /></svg>);
    default:
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 2l2.2 6.4L21 9l-5.2 4.2L17.5 20 12 16.2 6.5 20l1.7-6.8L3 9l6.8-.6L12 2z" /></svg>);
  }
};

const VersoCarta = () => (
  <svg viewBox="0 0 100 160" style={{ width: "100%", height: "100%", display: "block" }}>
    <defs>
      <radialGradient id="vg" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#251c44" /><stop offset="100%" stopColor="#150f28" />
      </radialGradient>
      <pattern id="meandroV" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 6 V1 H6 V4 H3 V2.5" fill="none" stroke="#c9a35c" strokeWidth="0.9" opacity="0.85" />
      </pattern>
    </defs>
    <rect width="100" height="160" rx="8" fill="url(#vg)" />
    <rect x="4" y="4" width="92" height="8" fill="url(#meandroV)" />
    <rect x="4" y="148" width="92" height="8" fill="url(#meandroV)" />
    <rect x="6" y="15" width="88" height="130" rx="4" fill="none" stroke="#c9a35c" strokeWidth="0.5" opacity="0.5" />
    {[...Array(3)].map((_, i) => (
      <circle key={i} cx="50" cy="80" r={13 + i * 10} fill="none" stroke="#c9a35c" strokeWidth="0.5" opacity={0.55 - i * 0.13} />
    ))}
    <path d="M50 64 l4 11 L66 75.5 l-9 7.5 L60 95 50 88.5 40 95 l3-12 L34 75.5 l12-.5 z" fill="none" stroke="#e8c87e" strokeWidth="1" />
    <path d="M58 34 a8.5 8.5 0 1 0 0 13 a6.8 6.8 0 1 1 0 -13z" fill="#c9a35c" opacity="0.85" />
    {[[16,26],[84,26],[16,134],[84,134],[28,116],[72,40]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1" fill="#e8c87e" opacity="0.8" />
    ))}
    <path d="M50 118 l2.2 6 6.4 .3 -5 4 1.7 6.1 -5.3-3.5 -5.3 3.5 1.7-6.1 -5-4 6.4-.3z" fill="none" stroke="#c9a35c" strokeWidth="0.7" opacity="0.7" />
  </svg>
);

/* Moldura grega + espírito cigano da frente da carta */
const MolduraFrente = ({ maior }) => (
  <svg viewBox="0 0 100 160" preserveAspectRatio="none"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <defs>
      <pattern id="meandroF" width="8" height="7" patternUnits="userSpaceOnUse">
        <path d="M0 5.5 V1 H6 V3.8 H3 V2.2" fill="none" stroke="#8a6a2e" strokeWidth="0.9" opacity="0.9" />
      </pattern>
    </defs>
    {/* faixas de meandro grego, topo e base */}
    <rect x="3" y="3" width="94" height="7" fill="url(#meandroF)" />
    <rect x="3" y="150" width="94" height="7" fill="url(#meandroF)" />
    {/* colunas laterais finas */}
    <line x1="5.5" y1="13" x2="5.5" y2="147" stroke="#8a6a2e" strokeWidth="0.7" opacity="0.55" />
    <line x1="94.5" y1="13" x2="94.5" y2="147" stroke="#8a6a2e" strokeWidth="0.7" opacity="0.55" />
    <line x1="8" y1="13" x2="8" y2="147" stroke="#8a6a2e" strokeWidth="0.35" opacity="0.4" />
    <line x1="92" y1="13" x2="92" y2="147" stroke="#8a6a2e" strokeWidth="0.35" opacity="0.4" />
    {/* cantos: sóis e luas do baralho cigano */}
    <g stroke="#a0522d" strokeWidth="0.7" fill="none" opacity="0.8">
      <circle cx="14" cy="19" r="2.6" />
      {[0,45,90,135,180,225,270,315].map((a) => (
        <line key={a} x1={14 + 3.6 * Math.cos((a * Math.PI) / 180)} y1={19 + 3.6 * Math.sin((a * Math.PI) / 180)}
          x2={14 + 5 * Math.cos((a * Math.PI) / 180)} y2={19 + 5 * Math.sin((a * Math.PI) / 180)} />
      ))}
      <path d="M90 15.5 a4.5 4.5 0 1 0 0 8 a3.6 3.6 0 1 1 0 -8z" fill="#a0522d" stroke="none" opacity="0.75" />
      <path d="M12 138 l1.4 3.6 3.8 .2 -3 2.4 1 3.7 -3.2-2.1 -3.2 2.1 1-3.7 -3-2.4 3.8-.2z" />
      <path d="M88 138 l1.4 3.6 3.8 .2 -3 2.4 1 3.7 -3.2-2.1 -3.2 2.1 1-3.7 -3-2.4 3.8-.2z" />
    </g>
    {/* coroa de louros nos Arcanos Maiores */}
    {maior && (
      <g stroke="#8a6a2e" strokeWidth="0.6" fill="none" opacity="0.5">
        <path d="M30 105 Q26 80 38 60" />
        <path d="M70 105 Q74 80 62 60" />
        {[0,1,2,3,4].map((i) => {
          const t = i / 4;
          const lx = 30 - 4 * (1 - t) + (38 - 30) * t * t;
          const ly = 105 - 45 * t;
          const rx = 100 - lx;
          return (
            <g key={i}>
              <ellipse cx={lx - 2.5} cy={ly} rx="3" ry="1.3" transform={`rotate(-35 ${lx - 2.5} ${ly})`} />
              <ellipse cx={rx + 2.5} cy={ly} rx="3" ry="1.3" transform={`rotate(35 ${rx + 2.5} ${ly})`} />
            </g>
          );
        })}
      </g>
    )}
  </svg>
);

function Ceu() {
  const estrelas = useMemo(
    () => [...Array(70)].map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 1.8 + 0.6, d: (Math.random() * 5 + 2.5).toFixed(2),
      delay: (Math.random() * 6).toFixed(2), o: Math.random() * 0.5 + 0.25,
    })), []
  );
  return (
    <div className="ceu" aria-hidden="true">
      {estrelas.map((e) => (
        <span key={e.id} className="estrela"
          style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.s, height: e.s, "--o": e.o,
            animationDuration: `${e.d}s`, animationDelay: `${e.delay}s` }} />
      ))}
      <span className="estrela-cadente" style={{ animationDelay: "4s" }} />
      <span className="estrela-cadente" style={{ animationDelay: "13s", top: "12%", left: "70%" }} />
    </div>
  );
}

function Carta({ carta, revelada, onClick, compacta, L }) {
  return (
    <div className={`carta-wrap ${compacta ? "compacta" : ""}`}
      onClick={onClick} role="button" tabIndex={0}
      aria-label={revelada ? carta.nome : "—"}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick && onClick()}>
      <div className={`carta-inner ${revelada ? "flipped" : ""}`}>
        <div className="carta-face carta-verso"><VersoCarta /><div className="brilho" /></div>
        <div className={`carta-face carta-frente ${carta.invertida ? "invertida" : ""}`}>
          <MolduraFrente maior={carta.maior} />
          <div className="cf-conteudo">
            <div className="cf-marca">{carta.marca}</div>
            <div className="cf-icone"><Icone naipe={carta.naipe} size={compacta ? 18 : 26} /></div>
            <div className="cf-nome">{carta.nome}</div>
            <div className="cf-sub">{carta.sub}</div>
          </div>
          {carta.invertida && <div className="cf-inv">{L.invertida}</div>}
        </div>
      </div>
      {revelada && <div className="aura" />}
    </div>
  );
}

function Anuncio({ L }) {
  return (
    <aside className="anuncio">
      <span className="anuncio-tag">{L.pub}</span>
      <p>{L.pubTxt}</p>
    </aside>
  );
}

/* ─────────── PAYWALL ─────────── */

function Onboarding({ L, onFechar }) {
  const [passo, setPasso] = useState(0);
  const ecras = [
    { orn: "✦", t: L.obTitulo1, p: L.obTexto1 },
    { orn: "☾", t: L.obTitulo2, p: L.obTexto2 },
    { orn: "✧", t: L.obTitulo3, p: L.obTexto3 },
  ];
  const e = ecras[passo];
  const ultimo = passo === ecras.length - 1;
  return (
    <div className="ob-fundo">
      <div className="ob-caixa">
        <div className="ob-orn">{e.orn}</div>
        <h2 className="ob-titulo">{e.t}</h2>
        <p className="ob-texto">{e.p}</p>
        <div className="ob-pontos">
          {ecras.map((_, i) => <span key={i} className={`ob-ponto ${i === passo ? "ativo" : ""}`} />)}
        </div>
        <button className="cta" onClick={() => (ultimo ? onFechar() : setPasso(passo + 1))}>
          {ultimo ? L.obComecar : L.obSeguinte}
        </button>
        {!ultimo && <button className="ob-saltar" onClick={onFechar}>{L.obSaltar}</button>}
      </div>
    </div>
  );
}

const SIGNOS_ORDEM = ["Carneiro","Touro","Gémeos","Caranguejo","Leão","Virgem","Balança","Escorpião","Sagitário","Capricórnio","Aquário","Peixes"];
const SIGNO_SIMBOLO = { "Carneiro":"♈","Touro":"♉","Gémeos":"♊","Caranguejo":"♋","Leão":"♌","Virgem":"♍","Balança":"♎","Escorpião":"♏","Sagitário":"♐","Capricórnio":"♑","Aquário":"♒","Peixes":"♓" };

const SIGNO_GLIFO = { "Carneiro":"♈","Touro":"♉","Gémeos":"♊","Caranguejo":"♋","Leão":"♌","Virgem":"♍","Balança":"♎","Escorpião":"♏","Sagitário":"♐","Capricórnio":"♑","Aquário":"♒","Peixes":"♓" };
const PLANETA_GLIFO = { "Sol":"☉","Lua":"☾","Mercúrio":"☿","Vénus":"♀","Marte":"♂","Júpiter":"♃","Saturno":"♄","Úrano":"♅","Neptuno":"♆","Plutão":"♇" };
const NODO_GLIFO = "☊";

function RodaAstral({ mapa }) {
  if (!mapa?.planetas) return null;
  const T = 340, C = T / 2, rExt = 158, rSignos = 140, rCasas = 108, rPlanetas = 88;
  const ascLon = mapa.asc.lon;
  // roda gira para pôr o Ascendente à esquerda (leste), como é tradição
  const ang = (lon) => (180 - (lon - ascLon)) * Math.PI / 180;
  const pt = (lon, r) => ({ x: C + r * Math.cos(ang(lon)), y: C - r * Math.sin(ang(lon)) });

  const glifosSignos = [];
  for (let i = 0; i < 12; i++) {
    const meio = i * 30 + 15;
    const p = pt(meio, (rSignos + rExt) / 2);
    glifosSignos.push(<text key={"s"+i} x={p.x} y={p.y} className="roda-glifo-signo" textAnchor="middle" dominantBaseline="central">{SIGNO_GLIFO[SIGNOS_ORDEM[i]]}</text>);
  }
  const linhasSignos = [];
  for (let i = 0; i < 12; i++) {
    const a = pt(i * 30, rExt), b = pt(i * 30, rCasas);
    linhasSignos.push(<line key={"ls"+i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="roda-linha-signo" />);
  }
  // cúspides das casas
  const linhasCasas = (mapa.casas || []).map((c, i) => {
    const a = pt(c.lon, rCasas), b = pt(c.lon, rPlanetas - 20);
    const eixo = (i === 0 || i === 9); // ASC e MC mais fortes
    return <line key={"lc"+i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={eixo ? "roda-eixo" : "roda-linha-casa"} />;
  });
  // planetas (com pequeno desvio se muito próximos)
  const usados = [];
  const glifosPlanetas = Object.entries(mapa.planetas).map(([nome, p]) => {
    let lon = p.lon;
    while (usados.some((u) => Math.abs(u - lon) < 8)) lon += 8;
    usados.push(lon);
    const pos = pt(lon, rPlanetas);
    const posL = pt(lon, rPlanetas - 16);
    return (
      <g key={nome}>
        <text x={pos.x} y={pos.y} className="roda-planeta" textAnchor="middle" dominantBaseline="central">{PLANETA_GLIFO[nome]}</text>
        <text x={posL.x} y={posL.y} className="roda-planeta-grau" textAnchor="middle" dominantBaseline="central">{Math.floor(p.grau)}°</text>
      </g>
    );
  });
  // aspetos (linhas centrais)
  const linhasAspetos = (mapa.aspetos || []).map((a, i) => {
    const pa = pt(mapa.planetas[a.a].lon, rPlanetas - 22);
    const pb = pt(mapa.planetas[a.b].lon, rPlanetas - 22);
    const tenso = a.tipo === "quadratura" || a.tipo === "oposição";
    return <line key={"a"+i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className={tenso ? "roda-asp-tenso" : "roda-asp-harm"} />;
  });

  const glifoNodo = mapa.nodo ? (() => {
    const pos = pt(mapa.nodo.lon, rPlanetas);
    return <text x={pos.x} y={pos.y} className="roda-nodo" textAnchor="middle" dominantBaseline="central">{NODO_GLIFO}</text>;
  })() : null;

  return (
    <svg viewBox={`0 0 ${T} ${T}`} className="roda-svg" role="img" aria-label="Roda astrológica">
      <circle cx={C} cy={C} r={rExt} className="roda-circ" />
      <circle cx={C} cy={C} r={rSignos} className="roda-circ" />
      <circle cx={C} cy={C} r={rCasas} className="roda-circ" />
      <circle cx={C} cy={C} r={rPlanetas - 22} className="roda-circ-int" />
      {linhasSignos}{glifosSignos}{linhasCasas}{linhasAspetos}{glifosPlanetas}{glifoNodo}
    </svg>
  );
}

function EcraPrevisaoAnual({ L, sessao, idioma, perfil }) {
  const [estado, setEstado] = useState("inicio");
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const ano = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const idi = idioma === "en" ? "en" : idioma === "pt-BR" ? "pt-BR" : "pt-PT";
        const d = await dbGet(sessao.token, `previsoes_anuais?select=dados_astro,interpretacao&idioma=eq.${idi}&order=criado_em.desc&limit=1`);
        if (Array.isArray(d) && d.length && d[0].interpretacao) {
          setDados(d[0].dados_astro); setTexto(d[0].interpretacao); setEstado("pronto");
        }
      } catch (e) {}
    })();
  }, [sessao, idioma]);

  async function gerar() {
    setEstado("gerando"); setErro("");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/previsao-anual`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({ idioma, ano }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d?.codigo === "compra_necessaria") { setEstado("comprar"); return; }
        setErro(d?.error || L.mapaErro); setEstado("erro"); return;
      }
      setDados(d.previsao); setTexto(d.interpretacao); setEstado("pronto");
    } catch (e) { setErro(L.mapaErro); setEstado("erro"); }
  }

  const seccoes = texto ? texto.split(/^## /m).filter(Boolean) : [];

  return (
    <div className="mapa-wrap">
      <div className="mapa-cabeca">
        <h2 className="mapa-titulo">{L.prevTitulo} {ano}</h2>
        <p className="mapa-sub">{L.prevSub}</p>
      </div>

      {estado === "inicio" && (
        <div className="mapa-inicio">
          <div className="mapa-simbolo">☉</div>
          <p className="mapa-intro">{L.prevIntro}</p>
          <button className="cta" onClick={gerar}>{L.prevGerar}</button>
        </div>
      )}

      {estado === "comprar" && (
        <div className="mapa-inicio">
          <div className="mapa-simbolo">☉</div>
          <p className="mapa-intro">{L.prevComprar}</p>
          <button className="cta" onClick={() => window.dispatchEvent(new CustomEvent("ir-pro"))}>{L.prevVerPlanos}</button>
        </div>
      )}

      {estado === "gerando" && (
        <div className="mapa-inicio">
          <div className="mapa-simbolo a-girar">☉</div>
          <p className="mapa-intro">{L.prevGerando}</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="mapa-inicio">
          <p className="mapa-erro">{erro}</p>
          <button className="cta" onClick={gerar}>{L.mapaTentar}</button>
        </div>
      )}

      {estado === "pronto" && (
        <div className="mapa-conteudo">
          {dados?.revolucao_solar && <p className="prev-data">{L.prevRevolucao} {new Date(dados.revolucao_solar).toLocaleDateString(idioma === "en" ? "en-GB" : "pt-PT", { day: "numeric", month: "long", year: "numeric" })}</p>}
          <div className="mapa-texto">
            {seccoes.map((s, i) => {
              const nl = s.indexOf("\n");
              const titulo = nl > 0 ? s.slice(0, nl).trim() : "";
              const corpo = nl > 0 ? s.slice(nl).trim() : s.trim();
              return (
                <div key={i} className="mapa-seccao">
                  {titulo && <h3 className="mapa-h3">{titulo}</h3>}
                  {corpo.split("\n\n").map((par, j) => <p key={j} className="mapa-par">{par}</p>)}
                </div>
              );
            })}
          </div>
          <button className="mapa-pdf-btn" onClick={() => window.print()}>{L.mapaPdf}</button>
        </div>
      )}
    </div>
  );
}

function EcraMapaNatal({ L, sessao, idioma, perfil, ehPro }) {
  const [estado, setEstado] = useState("inicio"); // inicio | gerando | pronto | erro | semperfil
  const [mapa, setMapa] = useState(null);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  const perfilCompleto = perfil?.data_nascimento && perfil?.hora_nascimento && perfil?.local_nascimento;

  useEffect(() => {
    // tentar carregar mapa já guardado
    (async () => {
      try {
        const idi = idioma === "en" ? "en" : idioma === "pt-BR" ? "pt-BR" : "pt-PT";
        const d = await dbGet(sessao.token, `mapas_natais?select=dados_astro,interpretacao&idioma=eq.${idi}&limit=1`);
        if (Array.isArray(d) && d.length && d[0].interpretacao) {
          setMapa(d[0].dados_astro); setTexto(d[0].interpretacao); setEstado("pronto");
        }
      } catch (e) {}
    })();
  }, [sessao, idioma]);

  async function gerar() {
    if (!perfilCompleto) { setEstado("semperfil"); return; }
    setEstado("gerando"); setErro("");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/mapa-natal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({ idioma }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d?.error || L.mapaErro); setEstado("erro"); return; }
      setMapa(d.mapa); setTexto(d.interpretacao); setEstado("pronto");
    } catch (e) { setErro(L.mapaErro); setEstado("erro"); }
  }

  const seccoes = texto ? texto.split(/^## /m).filter(Boolean) : [];

  return (
    <div className="mapa-wrap">
      <div className="mapa-cabeca">
        <h2 className="mapa-titulo">{L.mapaTitulo}</h2>
        <p className="mapa-sub">{L.mapaSub}</p>
      </div>

      {estado === "inicio" && (
        <div className="mapa-inicio">
          <div className="mapa-simbolo">✧</div>
          <p className="mapa-intro">{L.mapaIntro}</p>
          <button className="cta" onClick={gerar}>{L.mapaGerar}</button>
        </div>
      )}

      {estado === "semperfil" && (
        <div className="mapa-inicio">
          <p className="mapa-intro">{L.mapaSemPerfil}</p>
        </div>
      )}

      {estado === "gerando" && (
        <div className="mapa-inicio">
          <div className="mapa-simbolo a-girar">✧</div>
          <p className="mapa-intro">{L.mapaGerando}</p>
        </div>
      )}

      {estado === "erro" && (
        <div className="mapa-inicio">
          <p className="mapa-erro">{erro}</p>
          <button className="cta" onClick={gerar}>{L.mapaTentar}</button>
        </div>
      )}

      {estado === "pronto" && mapa && (
        <div className="mapa-conteudo" id="mapa-para-pdf">
          <RodaAstral mapa={mapa} />
          <div className="mapa-tres">
            <div className="mapa-chip"><span className="mapa-chip-g">☉</span> {mapa.planetas?.Sol?.signo}</div>
            <div className="mapa-chip"><span className="mapa-chip-g">☾</span> {mapa.planetas?.Lua?.signo}</div>
            <div className="mapa-chip"><span className="mapa-chip-g">↑</span> {mapa.asc?.signo}</div>
            {mapa.nodo && <div className="mapa-chip"><span className="mapa-chip-g">☊</span> {mapa.nodo.signo}</div>}
          </div>
          <div className="mapa-texto">
            {seccoes.map((s, i) => {
              const nl = s.indexOf("\n");
              const titulo = nl > 0 ? s.slice(0, nl).trim() : "";
              const corpo = nl > 0 ? s.slice(nl).trim() : s.trim();
              return (
                <div key={i} className="mapa-seccao">
                  {titulo && <h3 className="mapa-h3">{titulo}</h3>}
                  {corpo.split("\n\n").map((par, j) => <p key={j} className="mapa-par">{par}</p>)}
                </div>
              );
            })}
          </div>
          <button className="mapa-pdf-btn" onClick={() => window.print()}>{L.mapaPdf}</button>
        </div>
      )}
    </div>
  );
}

function EcraHoroscopo({ L, sessao, idioma, signo }) {
  const [horoscopos, setHoroscopos] = useState(null);
  const [selecionado, setSelecionado] = useState(signo || "Carneiro");
  const [carregando, setCarregando] = useState(true);
  const [semana, setSemana] = useState("");

  useEffect(() => { if (signo) setSelecionado(signo); }, [signo]);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        // idioma da app → idioma guardado (fallback pt-PT)
        const idi = idioma === "en" ? "en" : "pt-PT";
        const dados = await dbGet(sessao.token, `horoscopo_semanal?select=signo,texto,semana_inicio&idioma=eq.${idi}&order=semana_inicio.desc&limit=24`);
        if (Array.isArray(dados) && dados.length) {
          const semanaMaisRecente = dados[0].semana_inicio;
          const daSemana = dados.filter((d) => d.semana_inicio === semanaMaisRecente);
          const mapa = {};
          daSemana.forEach((d) => { mapa[d.signo] = d.texto; });
          setHoroscopos(mapa);
          setSemana(semanaMaisRecente);
        } else {
          setHoroscopos({});
        }
      } catch (e) { setHoroscopos({}); }
      setCarregando(false);
    })();
  }, [sessao, idioma]);

  const textoSel = horoscopos && horoscopos[selecionado];

  return (
    <div className="horo-wrap">
      <div className="horo-cabeca">
        <h2 className="horo-titulo">{L.horoTitulo}</h2>
        {semana && <p className="horo-semana">{L.horoSemanaDe} {new Date(semana).toLocaleDateString(idioma === "en" ? "en-GB" : "pt-PT", { day: "numeric", month: "long" })}</p>}
      </div>

      <div className="horo-signos">
        {SIGNOS_ORDEM.map((s) => (
          <button key={s} className={`horo-signo ${selecionado === s ? "ativo" : ""}`} onClick={() => setSelecionado(s)} aria-label={s}>
            <span className="horo-simb">{SIGNO_SIMBOLO[s]}</span>
            <span className="horo-nome">{s}</span>
          </button>
        ))}
      </div>

      <div className="horo-texto-caixa">
        <div className="horo-texto-cabeca">
          <span className="horo-texto-simb">{SIGNO_SIMBOLO[selecionado]}</span>
          <span className="horo-texto-nome">{selecionado}</span>
        </div>
        {carregando ? (
          <p className="horo-vazio">{L.horoCarregar}</p>
        ) : textoSel ? (
          <p className="horo-texto">{textoSel}</p>
        ) : (
          <p className="horo-vazio">{L.horoBreve}</p>
        )}
      </div>
    </div>
  );
}

function Paywall({ L, userId, ehPro }) {
  const ref = userId ? `?client_reference_id=${userId}` : "";
  return (
    <main className="painel entra">
      <div className="pw-caixa">
        <div className="div-orn">✶ ☾ ✶</div>
        <h2 className="pw-tit">{L.proTit}</h2>
        <p className="pw-sub">{L.proSub}</p>
        {ehPro ? (
          <>
            <div className="sub-estado">
              <div className="sub-linha">
                <span className="sub-lbl">{L.subPlanoAtual}</span>
                <span className="sub-valor">Pro <span className="sub-badge">{L.subAtivo}</span></span>
              </div>
            </div>

            <div className="sub-comparar">
              <div className="rotulo">{L.subComparar}</div>
              <div className="comp-tabela">
                <div className="comp-cab">
                  <span></span><span>{L.subFree}</span><span className="comp-pro">{L.subPro}</span>
                </div>
                {L.proLista.map((f, i) => (
                  <div className="comp-linha" key={i}>
                    <span className="comp-f">{f}</span>
                    <span className="comp-x">—</span>
                    <span className="comp-v">✦</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sub-gerir">
              <p className="sub-gerir-txt">{L.subGerirTxt}</p>
              {STRIPE_PORTAL && STRIPE_PORTAL.indexOf("SUBSTITUIR") === -1 ? (
                <a className="pw-cta bloco" href={`${STRIPE_PORTAL}${ref}`} target="_blank" rel="noreferrer">
                  {L.subGerir}
                </a>
              ) : (
                <p className="sub-embreve">{L.subEmBreve}</p>
              )}
              <p className="sub-nota">{L.subCancelarNota}</p>
            </div>
          </>
        ) : (
          <>
            <ul className="pw-lista">
              {L.proLista.map((f, i) => <li key={i}><span className="pw-check">✦</span>{f}</li>)}
            </ul>
            <div className="pw-planos">
              <a className="pw-plano" href={`${STRIPE_LINK_MENSAL}${ref}`} target="_blank" rel="noreferrer">
                <span className="pw-plano-nome">{L.mensal}</span>
                <span className="pw-preco">$5<small>{L.porMes}</small></span>
                <span className="pw-cta">{L.assinarMensal}</span>
              </a>
              <a className="pw-plano destaque" href={`${STRIPE_LINK_ANUAL}${ref}`} target="_blank" rel="noreferrer">
                <span className="pw-poupa">{L.poupa}</span>
                <span className="pw-plano-nome">{L.anual}</span>
                <span className="pw-preco">$45<small>/{L.anual.toLowerCase().slice(0,3)}</small></span>
                <span className="pw-equiv">{L.equivale}</span>
                <span className="pw-cta">{L.assinarAnual}</span>
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ─────────── AUTH ─────────── */

function EcraAuth({ onSessao, L }) {
  const [modo, setModo] = useState("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submeter() {
    if (!email.trim() || !password) { setMsg({ tipo: "erro", txt: L.preenche }); return; }
    setOcupado(true); setMsg(null);
    try {
      if (modo === "registar") {
        const d = await authRegistar(email.trim(), password, nome.trim());
        // Se veio com código de convite no link, regista-o
        const codConvite = new URLSearchParams(window.location.search).get("convite");
        if (codConvite && d.session) {
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/rpc/registar_convite`, {
              method: "POST",
              headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${d.session.access_token}` },
              body: JSON.stringify({ p_convidado: d.session.user.id, p_codigo: codConvite }),
            });
          } catch (e) { /* não bloquear o registo */ }
        }
        if (d.session) onSessao({ token: d.session.access_token, user: d.session.user });
        else { setMsg({ tipo: "info", txt: L.contaCriada }); setModo("entrar"); }
      } else {
        const d = await authEntrar(email.trim(), password);
        onSessao({ token: d.session.access_token, user: d.session.user });
      }
    } catch (e) {
      setMsg({ tipo: "erro", txt: e.message });
    } finally { setOcupado(false); }
  }

  return (
    <main className="painel entra auth-painel">
      <div className="auth-caixa">
        <div className="div-orn">✶ ☾ ✶</div>
        <h2 className="auth-titulo">{modo === "entrar" ? L.bemVindo : L.criaConta}</h2>
        <p className="auth-sub">{L.authSub}</p>
        <div className="auth-tabs">
          <button className={`tab ${modo === "entrar" ? "ativo" : ""}`} onClick={() => { setModo("entrar"); setMsg(null); }}>{L.entrar}</button>
          <button className={`tab ${modo === "registar" ? "ativo" : ""}`} onClick={() => { setModo("registar"); setMsg(null); }}>{L.registar}</button>
        </div>
        {modo === "registar" && (
          <input className="campo" placeholder={L.nomePH} value={nome} onChange={(e) => setNome(e.target.value)} />
        )}
        <input className="campo" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <div className="campo-pass">
          <input className="campo" type={verPass ? "text" : "password"} placeholder={L.passPH} value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submeter()} autoComplete="current-password" />
          <button type="button" className="olho" onClick={() => setVerPass(!verPass)}
            aria-label={verPass ? L.passOcultar : L.passVer}>{verPass ? "🙈" : "👁"}</button>
        </div>
        {msg && <p className={`auth-msg ${msg.tipo}`}>{msg.txt}</p>}
        <button className="cta" onClick={submeter} disabled={ocupado}>
          {ocupado ? L.momento : modo === "entrar" ? L.entrar : L.criarConta}
        </button>
      </div>
    </main>
  );
}

/* ─────────── HISTÓRICO ─────────── */

function ItemHistorico({ leitura, onAtualizar, onApagar, L }) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState(leitura.titulo);
  const [notas, setNotas] = useState(leitura.notas || "");
  const [confirmar, setConfirmar] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const alterado = titulo !== leitura.titulo || notas !== (leitura.notas || "");

  async function guardar() {
    setOcupado(true);
    await onAtualizar(leitura.id, { titulo: titulo.trim() || leitura.titulo, notas });
    setOcupado(false); setGuardado(true);
    setTimeout(() => setGuardado(false), 1600);
  }

  return (
    <div className="hist-item">
      <button className="hist-cab" onClick={() => setAberto(!aberto)}>
        <div className="hist-cab-txt">
          <div className="hist-titulo">{leitura.titulo}</div>
          <div className="hist-meta">
            <span className="badge">{leitura.vertente}</span>
            <span className="badge claro">{leitura.tiragem_nome}</span>
            <span className="hist-data">{dataPt(leitura.data, L)}</span>
          </div>
        </div>
        <span className={`seta ${aberto ? "rodada" : ""}`}>❯</span>
      </button>
      {aberto && (
        <div className="hist-corpo">
          {leitura.pergunta && <p className="hist-pergunta">“{leitura.pergunta}”</p>}
          <div className="hist-cartas">
            {leitura.cartas.map((c, i) => (
              <span key={i} className={`mini-carta ${c.invertida ? "inv" : ""}`}>
                {c.nome}{c.invertida ? " ⟲" : ""}
              </span>
            ))}
          </div>
          <div className="hist-interp">
            {emBlocos(leitura.interpretacao).map((b, i) =>
              b.t === "h" ? <h4 key={i}>{b.txt}</h4> : <p key={i}>{b.txt}</p>
            )}
          </div>
          <div className="campo-grupo">
            <label className="rotulo">{L.titulo}</label>
            <input className="campo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} />
          </div>
          <div className="campo-grupo">
            <label className="rotulo">{L.notas}</label>
            <textarea className="campo" rows={3} placeholder={L.notasPH}
              value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
          <div className="hist-acoes">
            <button className="cta pequeno" onClick={guardar} disabled={(!alterado && !guardado) || ocupado}>
              {guardado ? L.guardado : ocupado ? L.aGuardar : L.guardarAlt}
            </button>
            {!confirmar ? (
              <button className="ghost perigo" onClick={() => setConfirmar(true)}>{L.apagar}</button>
            ) : (
              <button className="ghost perigo firme" onClick={() => onApagar(leitura.id)}>{L.confApagar}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── PERFIL ─────────── */

function Ajuda({ texto }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span className="ajuda-wrap">
      <button type="button" className="ajuda-btn" onClick={() => setAberto(!aberto)} aria-label="Ajuda">?</button>
      {aberto && (
        <>
          <span className="ajuda-fundo" onClick={() => setAberto(false)} />
          <span className="ajuda-balao" role="tooltip">{texto}</span>
        </>
      )}
    </span>
  );
}

function montarPdfDados(dados, L, idioma) {
  const esc = (s) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const dataStr = new Date().toLocaleDateString(idioma === "en" ? "en-GB" : "pt-PT", { day: "numeric", month: "long", year: "numeric" });
  const perfil = dados?.perfil || {};
  const mapa = (dados?.mapa_natal || [])[0];
  const previsoes = dados?.previsoes_anuais || [];
  const leituras = dados?.leituras || [];

  const paraSeccoesHtml = (texto) => {
    if (!texto) return "";
    return texto.split(/^## /m).filter(Boolean).map((s) => {
      const nl = s.indexOf("\n");
      const titulo = nl > 0 ? s.slice(0, nl).trim() : "";
      const corpo = nl > 0 ? s.slice(nl).trim() : s.trim();
      const pars = corpo.split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("");
      return `${titulo ? `<h3>${esc(titulo)}</h3>` : ""}${pars}`;
    }).join("");
  };

  let corpo = "";

  // Perfil astrológico
  if (mapa?.dados_astro?.planetas) {
    const p = mapa.dados_astro;
    const linhas = Object.entries(p.planetas).map(([n, v]) =>
      `<tr><td>${esc(n)}</td><td>${esc(v.signo)} ${v.grau}°</td><td>${L.pdfCasa} ${v.casa}</td></tr>`).join("");
    const nodoLinha = p.nodo ? `<tr><td>${L.pdfNodo}</td><td>${esc(p.nodo.signo)} ${p.nodo.grau}°</td><td>${L.pdfCasa} ${p.nodo.casa}</td></tr>` : "";
    corpo += `<section><h2>${L.pdfMapaTitulo}</h2>
      <table class="astro"><tr><td>${L.pdfAsc}</td><td>${esc(p.asc.signo)} ${p.asc.grau}°</td><td></td></tr>
      <tr><td>${L.pdfMc}</td><td>${esc(p.mc.signo)} ${p.mc.grau}°</td><td></td></tr>${linhas}${nodoLinha}</table>
      <div class="texto">${paraSeccoesHtml(mapa.interpretacao)}</div></section>`;
  }

  // Previsões anuais
  previsoes.forEach((pv) => {
    corpo += `<section><h2>${L.pdfPrevTitulo} ${pv.dados_astro?.ano || ""}</h2>
      <div class="texto">${paraSeccoesHtml(pv.interpretacao)}</div></section>`;
  });

  // Leituras (resumo)
  if (leituras.length) {
    const linhas = leituras.slice(0, 100).map((l) => {
      const d = l.created_at ? new Date(l.created_at).toLocaleDateString(idioma === "en" ? "en-GB" : "pt-PT") : "";
      return `<li><strong>${esc(d)}</strong> — ${esc(l.tiragem_nome || l.vertente || "")}</li>`;
    }).join("");
    corpo += `<section><h2>${L.pdfLeituras}</h2><ul class="leituras">${linhas}</ul></section>`;
  }

  return `<!DOCTYPE html><html lang="${idioma}"><head><meta charset="utf-8">
<title>${L.pdfDoc} — Oráculo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Outfit:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Outfit', sans-serif; color: #2a2440; line-height: 1.65; padding: 48px 40px; max-width: 720px; margin: 0 auto; }
  .capa { text-align: center; padding: 40px 0 50px; border-bottom: 2px solid #c9a35c; margin-bottom: 40px; }
  .capa .simbolo { font-size: 44px; color: #c9a35c; margin-bottom: 14px; }
  .capa h1 { font-family: 'Cormorant Garamond', serif; font-size: 34px; color: #1a1330; font-weight: 600; margin-bottom: 8px; }
  .capa .sub { font-size: 14px; color: #6a6280; }
  .capa .nome { font-size: 17px; color: #2a2440; margin-top: 16px; }
  section { margin-bottom: 38px; page-break-inside: avoid; }
  h2 { font-family: 'Cormorant Garamond', serif; font-size: 25px; color: #b08430; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5ddc8; }
  h3 { font-family: 'Cormorant Garamond', serif; font-size: 19px; color: #8a6a28; margin: 20px 0 8px; }
  p { margin-bottom: 11px; font-size: 14px; font-weight: 300; }
  table.astro { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
  table.astro td { padding: 6px 10px; font-size: 13px; border-bottom: 1px solid #f0ece0; }
  table.astro td:first-child { font-weight: 500; color: #6a6280; width: 32%; }
  ul.leituras { list-style: none; }
  ul.leituras li { padding: 5px 0; font-size: 12.5px; border-bottom: 1px solid #f4f1e8; font-weight: 300; }
  .rodape { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5ddc8; font-size: 11px; color: #9a92aa; }
  @media print { body { padding: 20px; } @page { margin: 1.5cm; } }
</style></head><body>
<div class="capa">
  <div class="simbolo">✦</div>
  <h1>${L.pdfDoc}</h1>
  <div class="sub">Oráculo · ${dataStr}</div>
  ${perfil.nome ? `<div class="nome">${esc(perfil.nome)}</div>` : ""}
</div>
${corpo || `<p>${L.pdfVazio}</p>`}
<div class="rodape">${L.pdfRodape}</div>
</body></html>`;
}

function SeccaoConvites({ L, sessao, codigoInicial }) {
  const [codigo, setCodigo] = useState(codigoInicial || "");
  const [convites, setConvites] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await dbGet(sessao.token, "convites?select=recompensado&convidante_id=eq." + sessao.user.id);
        setConvites(Array.isArray(c) ? c : []);
      } catch (e) { setConvites([]); }
    })();
  }, [sessao]);

  async function gerarCodigo() {
    setGerando(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/gerar_codigo_convite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({ p_user: sessao.user.id }),
      });
      const novo = await r.json();
      if (typeof novo === "string") setCodigo(novo);
    } catch (e) {}
    setGerando(false);
  }

  const link = codigo ? `https://oraculo-tarot-seven.vercel.app/?convite=${codigo}` : "";
  const recompensados = convites ? convites.filter((c) => c.recompensado).length : 0;

  async function copiar() {
    try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch (e) {}
  }

  return (
    <div className="conv-zona">
      <h3 className="conv-titulo">{L.convTitulo}</h3>
      <p className="conv-txt">{L.convTxt}</p>
      {!codigo ? (
        <button className="conv-btn" onClick={gerarCodigo} disabled={gerando}>{gerando ? "..." : L.convGerar}</button>
      ) : (
        <>
          <div className="conv-codigo-cx">
            <span className="conv-codigo">{codigo}</span>
            <button className="conv-copiar" onClick={copiar}>{copiado ? L.convCopiado : L.convCopiar}</button>
          </div>
          <p className="conv-contador">{L.convJa} {recompensados}/3 · {L.convMax}</p>
        </>
      )}
    </div>
  );
}

function EcraPerfil({ L, idioma, sessao, perfil, onPerfilAtualizado, consentMarketing, onConsent, onSair }) {
  const [nome, setNome] = useState(perfil?.nome || "");
  const [nascTxt, setNascTxt] = useState(isoParaData(perfil?.data_nascimento) || "");
  const [horaTxt, setHoraTxt] = useState(perfil?.hora_nascimento ? perfil.hora_nascimento.slice(0,5) : "");
  const [local, setLocal] = useState(perfil?.local_nascimento || "");
  const nasc = dataParaISO(nascTxt);   // ISO derivado do texto
  const hora = horaNormalizar(horaTxt); // HH:MM derivado do texto
  const [genero, setGenero] = useState(perfil?.genero || "");
  const [profissao, setProfissao] = useState(perfil?.profissao || "");
  const [marketing, setMarketing] = useState(!!consentMarketing);
  const [ocupado, setOcupado] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [erroIdade, setErroIdade] = useState("");
  const [codigoSuporte, setCodigoSuporte] = useState("");
  const [factos, setFactos] = useState([]);
  const [factosAbertos, setFactosAbertos] = useState(false);

  useEffect(() => {
    if (!sessao?.token) return;
    (async () => {
      try {
        const d = await dbGet(sessao.token, "contexto_vida?select=id,facto,criado_em&order=criado_em.desc");
        setFactos(Array.isArray(d) ? d : []);
      } catch (e) {}
    })();
  }, [sessao]);

  async function apagarFacto(id) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/contexto_vida?id=eq.${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
      });
      setFactos((f) => f.filter((x) => x.id !== id));
    } catch (e) {}
  }
  const [privMsg, setPrivMsg] = useState("");
  const [privOcupado, setPrivOcupado] = useState(false);

  async function gerarCodigo() {
    setPrivOcupado(true); setPrivMsg("");
    try {
      const cod = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
      const expira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/codigos_suporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({ user_id: sessao.user.id, codigo: cod, expira_em: expira }),
      });
      if (!r.ok) throw new Error("db");
      setCodigoSuporte(cod);
    } catch (e) { setPrivMsg(L.privErro); }
    setPrivOcupado(false);
  }

  async function exportarDados() {
    setPrivOcupado(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exportar_meus_dados`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({}),
      });
      const dados = await r.json();
      const html = montarPdfDados(dados, L, idioma);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.onload = () => { win.focus(); win.print(); };
      }
    } catch (e) {}
    setPrivOcupado(false);
  }

  async function apagarHistorico() {
    if (!window.confirm(L.privApagarHistConf)) return;
    setPrivOcupado(true); setPrivMsg("");
    try {
      const H = { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` };
      await fetch(`${SUPABASE_URL}/rest/v1/leituras?user_id=eq.${sessao.user.id}`, { method: "DELETE", headers: H });
      await fetch(`${SUPABASE_URL}/rest/v1/analises_mensais?user_id=eq.${sessao.user.id}`, { method: "DELETE", headers: H });
      setPrivMsg(L.privApagarHistOk);
    } catch (e) { setPrivMsg(L.privErro); }
    setPrivOcupado(false);
  }

  async function apagarConta() {
    const conf = window.prompt(L.privApagarContaConf);
    if (conf !== "APAGAR") return;
    setPrivOcupado(true); setPrivMsg("");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/apagar-conta`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${sessao.token}` },
        body: JSON.stringify({ confirmar: "APAGAR" }),
      });
      if (!r.ok) throw new Error("fn");
      window.alert(L.privApagarContaOk);
      onSair();
    } catch (e) { setPrivMsg(L.privErro); setPrivOcupado(false); }
  }

  const signoPt = signoDe(nasc);
  const signoMostra = idioma === "en" && L.signos?.[signoPt] ? L.signos[signoPt] : signoPt;
  const luaCalc = useMemo(() => luaSignoDe(nasc, hora), [nasc, hora]);
  const ascCalc = useMemo(() => ascendenteDe(nasc, hora, local), [nasc, hora, local]);
  const traduzSigno = (s) => (idioma === "en" && L.signos?.[s] ? L.signos[s] : s);

  async function guardar() {
    // Verificação de idade mínima (18 anos) — só quando há data preenchida
    const idade = idadeAnos(nasc);
    if (nasc && idade !== null && idade < 18) {
      setErroIdade(L.erroIdade);
      return;
    }
    setErroIdade("");
    setOcupado(true);
    try {
      await dbAtualizarPerfil(sessao.token, {
        id: sessao.user.id,
        dados: {
          nome: nome.trim(),
          data_nascimento: nasc || null,
          hora_nascimento: hora || null,
          local_nascimento: local.trim() || null,
          signo: signoPt || null,
          genero: genero || null,
          profissao: profissao.trim() || null,
        },
      });
      await dbGuardarConsentimento(sessao.token, sessao.user.id, "marketing_kairos", marketing);
      onPerfilAtualizado({ nome: nome.trim(), data_nascimento: nasc, hora_nascimento: hora, local_nascimento: local, signo: signoPt, genero, profissao });
      onConsent(marketing);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 1800);
    } catch (e) {
      /* silencioso; mantém valores */
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="painel entra">
      <div>
        <h2 className="perfil-tit">{L.perfilTit}</h2>
        <p className="perfil-sub">{L.perfilSub}</p>
      </div>

      <div className="campo-grupo">
        <label className="rotulo">{L.perfilNome}</label>
        <input className="campo" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
      </div>

      <div className="campo-grupo">
        <label className="rotulo">{L.perfilNasc}</label>
        <input
          className="campo"
          type="text"
          inputMode="numeric"
          placeholder={L.perfilNascPH}
          value={nascTxt}
          onChange={(e) => setNascTxt(e.target.value)}
          maxLength={10}
        />
        {signoMostra && <span className="signo-chip">☉ {signoMostra}</span>}
        {luaCalc && <span className="signo-chip lua">☾ {traduzSigno(luaCalc.signo)}{luaCalc.aprox ? "*" : ""}</span>}
        {ascCalc && <span className="signo-chip asc">↑ {traduzSigno(ascCalc)}</span>}
        {(signoMostra || luaCalc) && <Ajuda texto={L.ajudaAstro} />}
        {luaCalc?.aprox && <span className="astro-nota">{L.astroNota}</span>}
      </div>

      <div className="dois-campos">
        <div className="campo-grupo">
          <label className="rotulo">{L.perfilHora}</label>
          <input
            className="campo"
            type="text"
            inputMode="numeric"
            placeholder={L.perfilHoraPH}
            value={horaTxt}
            onChange={(e) => setHoraTxt(e.target.value)}
            maxLength={5}
          />
          <span className="campo-ajuda">{L.perfilHoraAjuda}</span>
        </div>
        <div className="campo-grupo">
          <label className="rotulo">{L.perfilLocal}</label>
          <input className="campo" value={local} placeholder={L.perfilLocalPH} onChange={(e) => setLocal(e.target.value)} maxLength={80} />
        </div>
      </div>

      <div className="dois-campos">
        <div className="campo-grupo">
          <label className="rotulo">{L.perfilGenero}</label>
          <select className="campo" value={genero} onChange={(e) => setGenero(e.target.value)}>
            {L.generos.map((g) => <option key={g} value={g === "—" ? "" : g}>{g}</option>)}
          </select>
          <span className="campo-ajuda">{L.perfilGeneroAjuda}</span>
        </div>
        <div className="campo-grupo">
          <label className="rotulo">{L.perfilProfissao}</label>
          <input className="campo" value={profissao} onChange={(e) => setProfissao(e.target.value)} maxLength={60} />
          <span className="campo-ajuda">{L.perfilProfissaoAjuda}</span>
        </div>
      </div>

      <div className="priv-caixa">
        <div className="priv-tit">⚖ {L.privTit}</div>
        <p>{L.privTxt}</p>
      </div>

      <button className="consent" onClick={() => setMarketing(!marketing)} aria-pressed={marketing}>
        <span className={`check ${marketing ? "on" : ""}`}>{marketing ? "✓" : ""}</span>
        <span>
          <span className="consent-tit">{L.consentTit}</span>
          <span className="consent-txt">{L.consentTxt}</span>
        </span>
      </button>

      {erroIdade && <p className="erro-idade">{erroIdade}</p>}

      <button className="cta" onClick={guardar} disabled={ocupado}>
        {guardado ? L.perfilGuardado : ocupado ? L.aGuardar : L.perfilGuardar}
      </button>

      <SeccaoConvites L={L} sessao={sessao} codigoInicial={perfil?.codigo_convite} />

      <div className="priv-zona">
        <h3 className="priv-titulo">{L.privTitulo}</h3>
        <p className="priv-txt">{L.privCodigoTxt}</p>
        <button className="priv-btn" onClick={gerarCodigo} disabled={privOcupado}>{L.privCodigoBtn}</button>
        {codigoSuporte && (
          <p className="priv-codigo">{L.privCodigoGerado} <b>{codigoSuporte}</b></p>
        )}
        {factos.length > 0 && (
          <div className="mem-bloco">
            <button className="priv-btn" onClick={() => setFactosAbertos(!factosAbertos)}>
              {L.memTitulo} ({factos.length})
            </button>
            {factosAbertos && (
              <div className="mem-lista">
                <p className="mem-txt">{L.memTxt}</p>
                {factos.map((f) => (
                  <div className="mem-item" key={f.id}>
                    <span>{f.facto}</span>
                    <button className="mem-x" onClick={() => apagarFacto(f.id)} title={L.memApagar}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="priv-btn" onClick={exportarDados} disabled={privOcupado}>{L.privExportar}</button>
        <button className="priv-btn" onClick={apagarHistorico} disabled={privOcupado}>{L.privApagarHist}</button>
        <button className="priv-btn priv-perigo" onClick={apagarConta} disabled={privOcupado}>{L.privApagarConta}</button>
        {privMsg && <p className="priv-msg">{privMsg}</p>}
        <a className="priv-link" href="/privacidade.html" target="_blank" rel="noreferrer">
          {idioma === "en" ? "Privacy Policy" : "Política de Privacidade"}
        </a>
      </div>
    </main>
  );
}

/* ─────────── APP ─────────── */

function detetarIdioma() {
  // Deteção automática pelo idioma do dispositivo (rápido, privado, sem depender de rede)
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "pt-PT"]);
  for (const l of langs) {
    const low = (l || "").toLowerCase();
    if (low === "pt-br" || low === "pt_br") return "pt-BR";
    if (low.startsWith("pt")) return "pt-PT";
    if (low.startsWith("en")) return "en";
  }
  return "pt-PT";
}

export default function TarotApp() {
  const [idioma, setIdioma] = useState(detetarIdioma);
  const [idiomaManual, setIdiomaManual] = useState(false); // se o utilizador escolher, não voltamos a auto-detetar
  const L = LOCALES[idioma];
  const BARALHO = useMemo(() => construirBaralho(L), [idioma]);
  const TIRAGENS = L.tiragens;
  const [significados, setSignificados] = useState({}); // { card_id: {direito, invertido} }
  const [consentMarketing, setConsentMarketing] = useState(false);

  function escolherIdioma(id) {
    setIdioma(id);
    setIdiomaManual(true);
  }

  // Refinar PT vs BR por IP quando o dispositivo só diz "pt" genérico (best-effort, nunca bloqueia)
  useEffect(() => {
    if (idiomaManual) return;
    let cancelado = false;
    (async () => {
      try {
        const r = await fetch("https://ipapi.co/json/");
        if (!r.ok) return;
        const d = await r.json();
        if (cancelado || idiomaManual) return;
        if (d.country_code === "BR") setIdioma("pt-BR");
        else if (d.country_code === "PT") setIdioma("pt-PT");
      } catch { /* ignora — fica a deteção do dispositivo */ }
    })();
    return () => { cancelado = true; };
  }, [idiomaManual]);

  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const ehPro = perfil?.plano === "pro" || (perfil?.pro_ate && new Date(perfil.pro_ate) > new Date());

  const [vista, setVista] = useState("nova"); // nova | historico | relatorio | pro
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [ecra, setEcra] = useState("inicio");
  const [vertente, setVertente] = useState(0); // índice
  const [pergunta, setPergunta] = useState("");
  const [tiragemIdx, setTiragemIdx] = useState(1);
  const tiragem = TIRAGENS[tiragemIdx];
  const [usarInvertidas, setUsarInvertidas] = useState(true);
  const [cartas, setCartas] = useState([]);
  const [reveladas, setReveladas] = useState([]);
  const [interpretacao, setInterpretacao] = useState("");
  const [aInterpretar, setAInterpretar] = useState(false);
  const [erro, setErro] = useState("");
  const [proximaLeitura, setProximaLeitura] = useState(null); // free: data da próxima leitura

  const [leituras, setLeituras] = useState([]);
  const [aCarregar, setACarregar] = useState(false);

  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOcupado, setChatOcupado] = useState(false);

  const [mesSel, setMesSel] = useState("");
  const [analiseMes, setAnaliseMes] = useState("");
  const [aAnalisar, setAAnalisar] = useState(false);

  const interpretadoRef = useRef(false);
  const timerRef = useRef(null);
  const chatFimRef = useRef(null);

  const todasReveladas = cartas.length > 0 && reveladas.every(Boolean);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Significados fixos das cartas (instantâneos, sem IA) no idioma ativo, com recurso a PT-PT
  useEffect(() => {
    if (!sessao) return;
    let cancelado = false;
    (async () => {
      try {
        const cols = "card_id,palavras_direito,palavras_invertido,texto_direito,texto_invertido,direito,invertido";
        let dados = await dbGet(sessao.token, `significados_cartas?idioma=eq.${idioma}&select=${cols}`);
        if ((!dados || !dados.length) && idioma !== "pt-PT") {
          dados = await dbGet(sessao.token, `significados_cartas?idioma=eq.pt-PT&select=${cols}`);
        }
        if (cancelado) return;
        const mapa = {};
        (dados || []).forEach((d) => { mapa[d.card_id] = {
          palavrasD: d.palavras_direito || d.direito,
          palavrasI: d.palavras_invertido || d.invertido,
          textoD: d.texto_direito || "",
          textoI: d.texto_invertido || "",
        }; });
        setSignificados(mapa);
      } catch { /* sem significados fixos; a IA continua a funcionar */ }
    })();
    return () => { cancelado = true; };
  }, [sessao, idioma]);

  // Recuperar sessão guardada no localStorage ao arrancar
  useEffect(() => {
    authSessaoAtual().then((session) => {
      if (session) setSessao({ token: session.access_token, user: session.user });
    }).catch(() => {});
    // Ouvir mudanças de sessão (refresh automático de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSessao({ token: session.access_token, user: session.user });
      else setSessao(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessao) return;
    setACarregar(true);
    (async () => {
      try {
        const p = await dbGet(sessao.token, "profiles?select=plano,nome,data_nascimento,hora_nascimento,local_nascimento,signo,genero,profissao,pro_ate,codigo_convite");
        setPerfil(p[0] || null);
        try {
          const cons = await dbGet(sessao.token, "consentimentos?finalidade=eq.marketing_kairos&select=concedido");
          setConsentMarketing(!!cons[0]?.concedido);
        } catch { /* sem consentimento ainda */ }
        const proAtivo = p[0]?.plano === "pro" || (p[0]?.pro_ate && new Date(p[0].pro_ate) > new Date());
        if (proAtivo) {
          const ls = await dbGet(sessao.token, "leituras?select=*&order=data.desc");
          setLeituras(ls);
        } else {
          // free: verificar disponibilidade da leitura semanal
          const desde = new Date(Date.now() - 7 * 864e5).toISOString();
          const usos = await dbGet(sessao.token, `uso_ia?tipo=eq.leitura&created_at=gte.${desde}&select=created_at&order=created_at.asc`);
          if (usos.length >= 1) {
            setProximaLeitura(new Date(new Date(usos[0].created_at).getTime() + 7 * 864e5));
          }
        }
      } catch {
        setErro(L.erroDados);
      } finally {
        setACarregar(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, chatOcupado]);

  const meses = useMemo(() => {
    const agora = new Date();
    const atual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
    const set = new Set([atual]);
    leituras.forEach((l) => set.add(l.data.slice(0, 7)));
    return [...set].sort().reverse();
  }, [leituras]);

  useEffect(() => { if (!mesSel && meses.length) setMesSel(meses[0]); }, [meses, mesSel]);

  useEffect(() => {
    if (!mesSel || !sessao || !ehPro) return;
    setAnaliseMes("");
    dbGet(sessao.token, `analises_mensais?mes=eq.${mesSel}&select=texto`)
      .then((d) => setAnaliseMes(d[0]?.texto || ""))
      .catch(() => {});
  }, [mesSel, sessao, ehPro]);

  const leiturasMes = useMemo(
    () => leituras.filter((l) => l.data.slice(0, 7) === mesSel),
    [leituras, mesSel]
  );

  const statsMes = useMemo(() => {
    const analisar = (arr) => {
      const porVertente = {}, porCarta = {};
      let invertidas = 0, totalCartas = 0, maiores = 0;
      const porNaipe = { Copas: 0, Espadas: 0, Paus: 0, Ouros: 0 };
      const dias = new Set();
      const horas = { manha: 0, tarde: 0, noite: 0, madrugada: 0 };
      arr.forEach((l) => {
        porVertente[l.vertente] = (porVertente[l.vertente] || 0) + 1;
        const d = l.data ? new Date(l.data) : null;
        if (d) {
          dias.add(l.data.slice(0, 10));
          const h = d.getHours();
          if (h >= 6 && h < 12) horas.manha++;
          else if (h >= 12 && h < 19) horas.tarde++;
          else if (h >= 19 && h < 24) horas.noite++;
          else horas.madrugada++;
        }
        (l.cartas || []).forEach((cc) => {
          porCarta[cc.nome] = (porCarta[cc.nome] || 0) + 1;
          totalCartas++;
          if (cc.invertida) invertidas++;
          const id = cc.id || "";
          if (id.startsWith("M")) maiores++;
          else { const n = ["Copas", "Espadas", "Paus", "Ouros"].find((x) => id.startsWith(x)); if (n) porNaipe[n]++; }
        });
      });
      const naipes = Object.entries(porNaipe).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
      const elementos = { Copas: "agua", Espadas: "ar", Paus: "fogo", Ouros: "terra" };
      const cartaTop = Object.entries(porCarta).sort((a, b) => b[1] - a[1])[0] || null;
      const vertTop = Object.entries(porVertente).sort((a, b) => b[1] - a[1])[0] || null;
      const ritmo = Object.entries(horas).sort((a, b) => b[1] - a[1])[0];
      return {
        total: arr.length, totalCartas,
        vertentes: Object.entries(porVertente).sort((a, b) => b[1] - a[1]),
        topCartas: Object.entries(porCarta).sort((a, b) => b[1] - a[1]).slice(0, 5),
        pctInv: totalCartas ? Math.round((invertidas / totalCartas) * 100) : 0,
        pctMaiores: totalCartas ? Math.round((maiores / totalCartas) * 100) : 0,
        naipes, naipeDom: naipes.length ? naipes[0][0] : null,
        elementoDom: naipes.length ? elementos[naipes[0][0]] : null,
        diasAtivos: dias.size,
        mediaCartas: arr.length ? (totalCartas / arr.length).toFixed(1) : 0,
        cartaTop, vertTop,
        ritmo: ritmo && ritmo[1] > 0 ? ritmo[0] : null,
      };
    };
    const atual = analisar(leiturasMes);
    // mês anterior para comparação
    const idx = meses.indexOf(mesSel);
    const mesAnt = idx >= 0 && idx < meses.length - 1 ? meses[idx + 1] : null;
    const leiturasAnt = mesAnt ? leituras.filter((l) => l.data.slice(0, 7) === mesAnt) : [];
    const anterior = mesAnt ? analisar(leiturasAnt) : null;
    return { ...atual, anterior, mesAnt };
  }, [leiturasMes, leituras, meses, mesSel]);

  /* ── leitura ── */

  // Vídeo recompensado: liberta uma leitura extra no free.
  // Na versão publicada (PWA/loja) liga-se aqui o SDK real (AdMob/Unity Ads);
  // o callback de "recompensa concedida" deve chamar concederRecompensa().
  const [videoAReproduzir, setVideoAReproduzir] = useState(false);
  function verVideoRecompensado() {
    setVideoAReproduzir(true);
    // Simulação do tempo de visualização; substituir pelo callback do SDK de anúncios
    setTimeout(() => {
      setVideoAReproduzir(false);
      concederRecompensa();
    }, 2500);
  }
  function concederRecompensa() {
    // Liberta o limite localmente; o servidor continua a impor o limite real por segurança.
    setProximaLeitura(null);
  }

  function baralharETirar() {
    if (!ehPro && proximaLeitura && proximaLeitura > new Date()) return;
    const b = [...BARALHO];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    setCartas(b.slice(0, tiragem.pos.length).map((c) => ({ ...c, invertida: usarInvertidas && Math.random() < 0.2 })));
    setReveladas(new Array(tiragem.pos.length).fill(false));
    setInterpretacao(""); setChat([]); setErro("");
    interpretadoRef.current = false;
    setEcra("baralhar");
    timerRef.current = setTimeout(() => setEcra("leitura"), 2400);
  }

  const revelar = (i) => setReveladas((r) => r.map((v, k) => (k === i ? true : v)));
  const revelarTodas = () => cartas.forEach((_, i) => setTimeout(() => revelar(i), i * 280));

  useEffect(() => {
    if (todasReveladas && !interpretadoRef.current) {
      interpretadoRef.current = true;
      interpretar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todasReveladas]);

  function contextoMemoria() {
    if (!ehPro) return "";
    const vert = L.vertList[vertente];
    const recentes = leituras
      .filter((l) => l.vertente === vert)
      .concat(leituras.filter((l) => l.vertente !== vert))
      .slice(0, 3);
    if (!recentes.length) return "";
    const linhas = recentes.map((l) => {
      const cs = (l.cartas || []).map((c) => c.nome + (c.invertida ? " ⟲" : "")).join(", ");
      return `- ${l.data.slice(0, 10)} · ${l.vertente}${l.pergunta ? ` · "${l.pergunta}"` : ""} · ${cs}`;
    }).join("\n");
    return `\n${L.pMem}\n${linhas}\n`;
  }

  function sigDe(carta) {
    const s = significados[carta.id];
    if (!s) return null;
    return {
      palavras: carta.invertida ? s.palavrasI : s.palavrasD,
      texto: carta.invertida ? s.textoI : s.textoD,
    };
  }

  function promptLeitura() {
    const lista = cartas
      .map((c, i) => {
        const sig = sigDe(c);
        const base = sig ? ` [significado base: ${sig.palavras}${sig.texto ? " — " + sig.texto : ""}]` : "";
        return `${i + 1}. ${tiragem.pos[i]}: ${c.nome}${c.invertida ? " (⟲)" : ""}${base}`;
      })
      .join("\n");
    return `${L.pCtx}
- ${L.pVert}: ${L.vertList[vertente]}
- ${L.pPerg}: ${pergunta.trim() ? `"${pergunta.trim()}"` : L.semPergunta}
- ${L.pTir}: ${tiragem.nome}

${L.pCartas}
${lista}
${contextoMemoria()}
${L.pInstr}`;
  }

  async function interpretar() {
    setAInterpretar(true); setErro("");
    try {
      const texto = await chamarIA(sessao.token, [{ role: "user", content: promptLeitura() }], "leitura", idioma, cartas.map((c) => c.id));
      setInterpretacao(texto);
      if (!ehPro) setProximaLeitura(new Date(Date.now() + 7 * 864e5));
      if (ehPro) await guardarLeitura(texto);
    } catch (e) {
      if (e.codigo === "limite_semanal") {
        setProximaLeitura(e.proxima ? new Date(e.proxima) : null);
        setErro(`${L.limiteTxt} ${e.proxima ? dataPt(e.proxima, L) : ""}`);
      } else if (e.codigo === "rate_limit") {
        setErro(L.erroRate);
      } else {
        setErro(e.message || L.erroInterp);
      }
      interpretadoRef.current = false;
    } finally {
      setAInterpretar(false);
    }
  }

  async function guardarLeitura(texto) {
    const titulo = pergunta.trim() ? pergunta.trim().slice(0, 60) : `${tiragem.nome} · ${L.vertList[vertente]}`;
    try {
      const nova = await dbCriarLeitura(sessao.token, {
        user_id: sessao.user.id,
        data: new Date().toISOString(),
        vertente: L.vertList[vertente],
        pergunta: pergunta.trim(),
        tiragem_nome: tiragem.nome,
        posicoes: tiragem.pos,
        cartas: cartas.map((c) => ({ id: c.id, nome: c.nome, invertida: c.invertida })),
        interpretacao: texto,
        titulo, notas: "",
      });
      setLeituras((ls) => [nova, ...ls]);
    } catch (e) {
      setErro(L.erroGuardar + e.message);
    }
  }

  async function atualizarLeitura(id, campos) {
    try {
      await dbAtualizarLeitura(sessao.token, id, campos);
      setLeituras((ls) => ls.map((x) => (x.id === id ? { ...x, ...campos } : x)));
    } catch (e) { setErro(e.message); }
  }

  async function apagarLeitura(id) {
    try {
      await dbApagarLeitura(sessao.token, id);
      setLeituras((ls) => ls.filter((x) => x.id !== id));
    } catch (e) { setErro(e.message); }
  }

  async function enviarChat() {
    const q = chatInput.trim();
    if (!q || chatOcupado || !ehPro) return;
    const novoChat = [...chat, { de: "tu", txt: q }];
    setChat(novoChat); setChatInput(""); setChatOcupado(true);
    try {
      const mensagens = [
        { role: "user", content: promptLeitura() },
        { role: "assistant", content: interpretacao },
        ...novoChat.map((m) => ({ role: m.de === "tu" ? "user" : "assistant", content: m.txt })),
      ];
      const resposta = await chamarIA(sessao.token, mensagens, "chat", idioma);
      setChat((c) => [...c, { de: "oraculo", txt: resposta }]);
    } catch {
      setChat((c) => [...c, { de: "oraculo", txt: L.chatErro }]);
    } finally { setChatOcupado(false); }
  }

  async function gerarAnaliseMes() {
    if (!leiturasMes.length || !ehPro) return;
    setAAnalisar(true); setErro("");
    const resumo = leiturasMes.map((l) => {
      const cs = (l.cartas || []).map((c) => c.nome + (c.invertida ? " ⟲" : "")).join(", ");
      return `- ${l.data.slice(0, 10)} · ${l.vertente} · ${l.tiragem_nome}${l.pergunta ? ` · "${l.pergunta}"` : ""} · ${cs}`;
    }).join("\n");
    const [ano, mesN] = mesSel.split("-");
    const stats = `${statsMes.total} ${L.leiturasS}; top: ${statsMes.topCartas.map(([n, c]) => `${n} (${c}x)`).join(", ") || "—"}; ${statsMes.pctInv}% ⟲`;
    try {
      const texto = await chamarIA(
        sessao.token,
        [{ role: "user", content: L.pAnalise(L.meses[parseInt(mesN) - 1], ano, resumo, stats) }],
        "analise", idioma
      );
      setAnaliseMes(texto);
      await dbGuardarAnalise(sessao.token, sessao.user.id, mesSel, texto);
    } catch (e) {
      setErro(e.message || L.erroInterp);
    } finally { setAAnalisar(false); }
  }

  function novaLeitura() {
    setEcra("inicio"); setVista("nova");
    setCartas([]); setReveladas([]);
    setInterpretacao(""); setChat([]); setErro("");
    interpretadoRef.current = false;
  }

  function sair() {
    setSessao(null); setPerfil(null); setLeituras([]); setProximaLeitura(null);
    novaLeitura();
  }

  const blocos = useMemo(() => emBlocos(interpretacao), [interpretacao]);
  const blocosAnalise = useMemo(() => emBlocos(analiseMes), [analiseMes]);
  const seta = (agora, antes) => (agora > antes ? "↑" : agora < antes ? "↓" : "=");

  // Síntese em linguagem natural do mês
  const sinteseRel = useMemo(() => {
    if (!leiturasMes.length) return "";
    const s = statsMes;
    const partes = [];
    partes.push(`${L.relSint1} ${s.total} ${s.total === 1 ? L.leituraS.toLowerCase() : L.leiturasS.toLowerCase()}`);
    if (s.vertTop) partes.push(`${L.relSint2} ${s.vertTop[0].toLowerCase()}`);
    if (s.cartaTop && s.cartaTop[1] > 1) partes.push(`${L.relSint3} ${s.cartaTop[0]}`);
    if (s.elementoDom) {
      const el = s.elementoDom === "fogo" ? L.relElFogo : s.elementoDom === "terra" ? L.relElTerra
        : s.elementoDom === "ar" ? L.relElAr : L.relElAgua;
      partes.push(`${L.relSint4} ${el}`);
    }
    return partes.join(". ") + ".";
  }, [leiturasMes, statsMes, L]);

  const maxVert = statsMes.vertentes.length ? statsMes.vertentes[0][1] : 1;
  const bloqueado = !ehPro && proximaLeitura && proximaLeitura > new Date();

  // Onboarding no primeiro login de cada utilizador
  useEffect(() => {
    if (!sessao?.user?.id) return;
    try {
      const chave = `ob_visto_${sessao.user.id}`;
      if (!localStorage.getItem(chave)) setMostrarOnboarding(true);
    } catch (e) {}
  }, [sessao]);

  function fecharOnboarding() {
    setMostrarOnboarding(false);
    try { localStorage.setItem(`ob_visto_${sessao.user.id}`, "1"); } catch (e) {}
  }

  function irPara(v) {
    const destino = ((v === "historico" || v === "relatorio") && !ehPro) ? "pro" : v;
    setVista(destino);
    try { window.history.pushState({ vista: destino }, ""); } catch (e) {}
  }

  // Botão "voltar" do telemóvel: navega entre separadores em vez de sair da app
  useEffect(() => {
    try { window.history.replaceState({ vista: "nova" }, ""); } catch (e) {}
    const aoVoltar = (ev) => {
      const v = ev.state?.vista;
      if (v) setVista(v);
      else setVista("nova");
    };
    window.addEventListener("popstate", aoVoltar);
    const irProHandler = () => irPara("pro");
    window.addEventListener("ir-pro", irProHandler);
    return () => { window.removeEventListener("popstate", aoVoltar); window.removeEventListener("ir-pro", irProHandler); };
  }, []);

  return (
    <div className="app">
      <style>{css}</style>
      {mostrarOnboarding && <Onboarding L={L} onFechar={fecharOnboarding} />}
      <Ceu />

      <header className="topo">
        <div className="linguas">
          {[["pt-PT", "PT"], ["pt-BR", "BR"], ["en", "EN"]].map(([id, lbl]) => (
            <button key={id} className={`lingua ${idioma === id ? "ativo" : ""}`} onClick={() => escolherIdioma(id)}>{lbl}</button>
          ))}
        </div>
        <div className="topo-orn">✶&nbsp;&nbsp;☾&nbsp;&nbsp;✶</div>
        <h1>Oráculo</h1>
        <p className="topo-sub">{L.sub}</p>
        {sessao && (
          <div className="conta-linha">
            <span className="conta-nome">
              {perfil?.nome || sessao.user.email}
              <button className={`badge plano ${ehPro ? "pro" : ""}`} onClick={() => irPara("pro")}>
                {ehPro ? "✦ Pro" : "Free"}
              </button>
            </span>
            <button className="link" onClick={sair}>{L.sair}</button>
          </div>
        )}
      </header>

      {!sessao ? (
        <EcraAuth onSessao={setSessao} L={L} />
      ) : (
        <>
          <nav className="tabs" role="tablist">
            <button role="tab" className={`tab ${vista === "nova" ? "ativo" : ""}`} onClick={() => irPara("nova")}>{L.tabLeitura}</button>
            <button role="tab" className={`tab ${vista === "historico" ? "ativo" : ""}`} onClick={() => irPara("historico")}>
              {L.tabHist}{!ehPro ? " 🔒" : leituras.length ? ` (${leituras.length})` : ""}
            </button>
            <button role="tab" className={`tab ${vista === "relatorio" ? "ativo" : ""}`} onClick={() => irPara("relatorio")}>
              {L.tabRel}{!ehPro ? " 🔒" : ""}
            </button>
            <button role="tab" className={`tab ${vista === "horoscopo" ? "ativo" : ""}`} onClick={() => irPara("horoscopo")}>{L.tabHoroscopo}</button>
            <button role="tab" className={`tab ${vista === "mapa" ? "ativo" : ""}`} onClick={() => irPara("mapa")}>{L.tabMapa}{!ehPro ? " 🔒" : ""}</button>
            <button role="tab" className={`tab ${vista === "previsao" ? "ativo" : ""}`} onClick={() => irPara("previsao")}>{L.tabPrevisao}</button>
            <button role="tab" className={`tab ${vista === "perfil" ? "ativo" : ""}`} onClick={() => irPara("perfil")}>{L.tabPerfil}</button>
          </nav>

          {vista === "pro" && <Paywall L={L} userId={sessao.user.id} ehPro={ehPro} />}

          {vista === "horoscopo" && (
            <EcraHoroscopo L={L} sessao={sessao} idioma={idioma} signo={perfil?.signo} />
          )}

          {vista === "mapa" && (
            <EcraMapaNatal L={L} sessao={sessao} idioma={idioma} perfil={perfil} ehPro={ehPro} />
          )}

          {vista === "previsao" && (
            <EcraPrevisaoAnual L={L} sessao={sessao} idioma={idioma} perfil={perfil} />
          )}

          {vista === "perfil" && (
            <EcraPerfil
              L={L} idioma={idioma} sessao={sessao} perfil={perfil}
              onSair={sair}
              consentMarketing={consentMarketing}
              onConsent={setConsentMarketing}
              onPerfilAtualizado={(campos) => setPerfil((p) => ({ ...(p || {}), ...campos }))}
            />
          )}

          {/* ───── NOVA LEITURA ───── */}
          {vista === "nova" && ecra === "inicio" && (
            <main className="painel entra">
              {bloqueado && (
                <div className="limite-caixa">
                  <div className="limite-tit">☾ {L.limiteTit}</div>
                  <p>{L.proxDisp} <strong>{dataPt(proximaLeitura.toISOString(), L)}</strong></p>
                  <div className="video-oferta">
                    <div className="video-oferta-tit">{L.videoTit}</div>
                    <p>{L.videoTxt}</p>
                    {videoAReproduzir ? (
                      <div className="video-a-ver"><span className="lua-spin">☾</span> …</div>
                    ) : (
                      <button className="cta pequeno" onClick={verVideoRecompensado}>{L.videoBtn}</button>
                    )}
                    <span className="video-indisp">{L.videoIndisp}</span>
                  </div>
                  <button className="link" onClick={() => irPara("pro")}>{L.desbloqueia}</button>
                </div>
              )}

              <section>
                <div className="rotulo">{L.vertente}</div>
                <div className="chips">
                  {L.vertList.map((v, i) => (
                    <button key={v} className={`chip ${vertente === i ? "ativo" : ""}`} onClick={() => setVertente(i)}>{v}</button>
                  ))}
                </div>
              </section>

              <section>
                <div className="rotulo">{L.perguntaLbl} <span className="opcional">{L.opcional}</span></div>
                <textarea className="campo" rows={2} placeholder={L.perguntaPH}
                  value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
              </section>

              <section>
                <div className="rotulo">{L.tiragemLbl} <Ajuda texto={L.ajudaTiragem} /></div>
                <div className="tiragens">
                  {TIRAGENS.map((t, i) => (
                    <button key={t.id} className={`tiragem ${tiragemIdx === i ? "ativo" : ""}`} onClick={() => setTiragemIdx(i)}>
                      <span className="t-nome">{t.nome}</span>
                      <span className="t-n">{t.pos.length} {t.pos.length === 1 ? L.carta1 : L.cartasN}</span>
                      <span className="t-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <button className="toggle-linha" onClick={() => setUsarInvertidas(!usarInvertidas)} aria-pressed={usarInvertidas}>
                <span>
                  <span className="tg-titulo">{L.invTit}</span>
                  <span className="tg-desc">{L.invDesc}</span>
                </span>
                <span className={`switch ${usarInvertidas ? "on" : ""}`}><span className="bola" /></span>
              </button>

              <button className="cta" onClick={baralharETirar} disabled={bloqueado}>{L.baralhar}</button>
              <p className="nota">{L.concentra}</p>

              {!ehPro && <Anuncio L={L} />}
            </main>
          )}

          {vista === "nova" && ecra === "baralhar" && (
            <main className="ritual entra" aria-live="polite">
              <div className="baralho-anim">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div className="ba-carta" key={i} style={{ "--i": i }}><VersoCarta /></div>
                ))}
              </div>
              <p className="ritual-txt">{L.aBaralhar}</p>
            </main>
          )}

          {vista === "nova" && ecra === "leitura" && (
            <main className="painel entra">
              <div className="leitura-cab">
                <div>
                  <div className="l-tiragem">{tiragem.nome} · {L.vertList[vertente]}</div>
                  {pergunta.trim() && <div className="l-pergunta">“{pergunta.trim()}”</div>}
                </div>
                <button className="ghost" onClick={novaLeitura}>{L.novaLeitura}</button>
              </div>

              {!todasReveladas && (
                <p className="instrucao">{L.toca} <button className="link" onClick={revelarTodas}>{L.revelaTodas}</button>.</p>
              )}

              <div className={`mesa ${tiragem.id}`}>
                {cartas.map((c, i) => (
                  <div className="posto" key={c.id} style={{ "--deal": `${i * 130}ms` }}>
                    <Carta carta={c} revelada={reveladas[i]} compacta={tiragem.pos.length > 3} onClick={() => revelar(i)} L={L} />
                    <div className="posto-rotulo">
                      <span className="posto-num">{cartas.length > 1 ? i + 1 : "✶"}</span>
                      {tiragem.pos[i].split(" — ")[0]}
                    </div>
                    {reveladas[i] && sigDe(c) && (
                      <div className="posto-sig">
                        <p className="posto-sig-palavras">{sigDe(c).palavras}</p>
                        {sigDe(c).texto && <p className="posto-sig-texto">{sigDe(c).texto}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {aInterpretar && (
                <div className="aLer"><div className="lua-spin">☾</div><p>{L.aLer}</p></div>
              )}

              {erro && (
                <div className="erro"><p>{erro}</p>
                  {!interpretacao && !bloqueado && <button className="cta pequeno" onClick={interpretar}>{L.tentar}</button>}
                  {bloqueado && <button className="cta pequeno" onClick={() => irPara("pro")}>{L.desbloqueia}</button>}
                </div>
              )}

              {blocos.length > 0 && (
                <>
                  <article className="interpretacao">
                    <div className="div-orn">✶ ✶ ✶</div>
                    {blocos.map((b, i) =>
                      b.t === "h"
                        ? <h3 key={i} className="bloco" style={{ "--bd": `${i * 90}ms` }}>{b.txt}</h3>
                        : <p key={i} className="bloco" style={{ "--bd": `${i * 90}ms` }}>{b.txt}</p>
                    )}
                    <div className="div-orn fim">☾</div>
                    <p className={ehPro ? "guardada" : "nao-guardada"}>{ehPro ? L.guardada : L.naoGuardada}</p>
                    <p className="disclaimer-leitura">{L.disclaimer}</p>
                  </article>

                  {ehPro ? (
                    <section className="chatSec">
                      <div className="rotulo">{L.conversa}</div>
                      <div className="chat-caixa">
                        {chat.length === 0 && <p className="chat-vazio">{L.chatVazio}</p>}
                        {chat.map((m, i) => (
                          <div key={i} className={`bolha ${m.de === "tu" ? "minha" : ""}`}>{m.txt}</div>
                        ))}
                        {chatOcupado && <div className="bolha pensar">{L.refletir}</div>}
                        <div ref={chatFimRef} />
                      </div>
                      <div className="chat-linha">
                        <input className="campo" placeholder={L.chatPH}
                          value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && enviarChat()} />
                        <button className="cta pequeno" onClick={enviarChat} disabled={chatOcupado || !chatInput.trim()}>{L.enviar}</button>
                      </div>
                    </section>
                  ) : (
                    <div className="bloqueio">
                      <span className="badge">{L.soPro}</span>
                      <p>{L.chatPro}</p>
                      <button className="cta pequeno" onClick={() => irPara("pro")}>{L.desbloqueia}</button>
                    </div>
                  )}

                  <button className="cta" onClick={novaLeitura}>{L.outra}</button>
                  {!ehPro && <Anuncio L={L} />}
                </>
              )}
            </main>
          )}

          {/* ───── HISTÓRICO (Pro) ───── */}
          {vista === "historico" && ehPro && (
            <main className="painel entra">
              {aCarregar ? (
                <p className="nota">{L.carregando}</p>
              ) : leituras.length === 0 ? (
                <div className="vazio">
                  <div className="vazio-orn">☾</div>
                  <p>{L.semLeituras}</p>
                  <button className="cta pequeno" onClick={() => setVista("nova")}>{L.primeira}</button>
                </div>
              ) : (
                <>
                  <p className="instrucao">{L.histInstr}</p>
                  <div className="hist-lista">
                    {leituras.map((l) => (
                      <ItemHistorico key={l.id} leitura={l} onAtualizar={atualizarLeitura} onApagar={apagarLeitura} L={L} />
                    ))}
                  </div>
                </>
              )}
            </main>
          )}

          {/* ───── RELATÓRIO (Pro) ───── */}
          {vista === "relatorio" && ehPro && (
            <main className="painel entra">
              <section>
                <div className="rotulo">{L.mes}</div>
                <div className="chips">
                  {meses.map((m) => {
                    const [a, mn] = m.split("-");
                    return (
                      <button key={m} className={`chip ${mesSel === m ? "ativo" : ""}`} onClick={() => setMesSel(m)}>
                        {L.meses[parseInt(mn) - 1]} {a}
                      </button>
                    );
                  })}
                </div>
              </section>

              {leiturasMes.length === 0 ? (
                <div className="vazio"><div className="vazio-orn">◐</div><p>{L.semMes}</p></div>
              ) : (
                <>
                  {sinteseRel && (
                    <section className="rel-sintese">
                      <div className="rel-sintese-orn">✦ ☾ ✦</div>
                      <p className="rel-sintese-txt">{sinteseRel}</p>
                    </section>
                  )}

                  {statsMes.cartaTop && (
                    <section className="rel-carta-mes">
                      <div className="rotulo">{L.relCartaMes}</div>
                      <div className="rel-carta-caixa">
                        <span className="rel-carta-nome">{statsMes.cartaTop[0]}</span>
                        <span className="rel-carta-vezes">{statsMes.cartaTop[1]}× {L.relVezes}</span>
                      </div>
                    </section>
                  )}

                  {statsMes.anterior && statsMes.anterior.total > 0 && (
                    <section className="rel-evolucao">
                      <div className="rotulo">{L.relEvolucao}</div>
                      <div className="rel-evo-linhas">
                        <div className="rel-evo">
                          <span className="rel-evo-lbl">{L.leiturasS}</span>
                          <span className="rel-evo-cmp">
                            {statsMes.total} <em>{seta(statsMes.total, statsMes.anterior.total)}</em>
                            <small>{L.relAntes} {statsMes.anterior.total}</small>
                          </span>
                        </div>
                        {statsMes.vertTop && statsMes.anterior.vertTop && (
                          <div className="rel-evo">
                            <span className="rel-evo-lbl">{L.relFoco}</span>
                            <span className="rel-evo-cmp">
                              {statsMes.vertTop[0]}
                              {statsMes.vertTop[0] !== statsMes.anterior.vertTop[0] &&
                                <small>{L.relAntes} {statsMes.anterior.vertTop[0]}</small>}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {statsMes.ritmo && (
                    <section className="rel-ritmo">
                      <div className="rotulo">{L.relRitmo}</div>
                      <p className="rel-ritmo-txt">
                        {statsMes.ritmo === "manha" ? L.ritmoManha
                          : statsMes.ritmo === "tarde" ? L.ritmoTarde
                          : statsMes.ritmo === "noite" ? L.ritmoNoite : L.ritmoMadrugada}
                      </p>
                    </section>
                  )}

                  <section className="stats">
                    <div className="stat-grande">
                      <span className="stat-num">{statsMes.total}</span>
                      <span className="stat-lbl">{statsMes.total === 1 ? L.leituraS : L.leiturasS}</span>
                    </div>
                    <div className="stat-grande">
                      <span className="stat-num">{statsMes.pctInv}%</span>
                      <span className="stat-lbl">{L.invPct}</span>
                    </div>
                  </section>

                  <section className="stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-num">{statsMes.diasAtivos}</span>
                      <span className="stat-mini-lbl">{L.statDias}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-num">{statsMes.mediaCartas}</span>
                      <span className="stat-mini-lbl">{L.statMedia}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-num">{statsMes.pctMaiores}%</span>
                      <span className="stat-mini-lbl">{L.statMaiores}</span>
                    </div>
                  </section>

                  {statsMes.elementoDom && (
                    <section className="elemento-caixa">
                      <div className="rotulo">{L.statElemento}</div>
                      <p className="elemento-txt">
                        {statsMes.elementoDom === "fogo" ? L.elFogo
                          : statsMes.elementoDom === "terra" ? L.elTerra
                          : statsMes.elementoDom === "ar" ? L.elAr : L.elAgua}
                      </p>
                    </section>
                  )}

                  {statsMes.naipes.length > 0 && (
                    <section>
                      <div className="rotulo">{L.statNaipes}</div>
                      <div className="naipes-barra">
                        {statsMes.naipes.map(([n, q]) => (
                          <div key={n} className={`naipe-seg naipe-${n.toLowerCase()}`}
                            style={{ flex: q }} title={`${n}: ${q}`}>
                            <span className="naipe-lbl">{n}</span>
                            <span className="naipe-n">{q}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="rotulo">{L.vertentes}</div>
                    <div className="barras">
                      {statsMes.vertentes.map(([v, n]) => (
                        <div className="barra-linha" key={v}>
                          <span className="barra-lbl">{v}</span>
                          <div className="barra-trilho">
                            <div className="barra-fill" style={{ width: `${(n / maxVert) * 100}%` }} />
                          </div>
                          <span className="barra-n">{n}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="rotulo">{L.topCartas}</div>
                    <div className="hist-cartas">
                      {statsMes.topCartas.map(([n, c]) => (
                        <span key={n} className="mini-carta">{n} <em>×{c}</em></span>
                      ))}
                    </div>
                  </section>

                  {blocosAnalise.length > 0 ? (
                    <article className="interpretacao">
                      <div className="div-orn">{L.analiseTit}</div>
                      {blocosAnalise.map((b, i) =>
                        b.t === "h" ? <h3 key={i}>{b.txt}</h3> : <p key={i}>{b.txt}</p>
                      )}
                      <button className="ghost" onClick={gerarAnaliseMes} disabled={aAnalisar}>
                        {aAnalisar ? L.reanalisar : L.regenerar}
                      </button>
                    </article>
                  ) : aAnalisar ? (
                    <div className="aLer"><div className="lua-spin">☾</div><p>{L.analisando}</p></div>
                  ) : (
                    <button className="cta" onClick={gerarAnaliseMes}>{L.gerarAnalise}</button>
                  )}
                  {erro && <div className="erro"><p>{erro}</p></div>}
                </>
              )}
            </main>
          )}
        </>
      )}
      <footer className="rodape">{L.disclaimer}</footer>
    </div>
  );
}

/* ─────────── ESTILO ─────────── */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  position: relative; min-height: 100vh;
  background:
    radial-gradient(ellipse 90% 55% at 50% -12%, rgba(98,72,168,.32), transparent),
    radial-gradient(ellipse 65% 45% at 85% 112%, rgba(170,124,58,.12), transparent),
    radial-gradient(ellipse 50% 35% at 8% 90%, rgba(60,40,110,.22), transparent),
    #100c1c;
  color: #ece4d4; font-family: 'Jost', system-ui, sans-serif; font-weight: 300;
  padding: 24px 18px 70px; overflow-x: hidden;
}

.ceu { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.estrela { position: absolute; border-radius: 50%; background: #f0e9da; opacity: var(--o, .4); animation: cintilar ease-in-out infinite; }
@keyframes cintilar { 0%, 100% { opacity: var(--o, .4); transform: scale(1); } 50% { opacity: calc(var(--o, .4) * .25); transform: scale(.7); } }
.estrela-cadente {
  position: absolute; top: 6%; left: 15%; width: 70px; height: 1px;
  background: linear-gradient(90deg, transparent, #e8c87e, transparent);
  opacity: 0; transform: rotate(-28deg); animation: cadente 18s linear infinite;
}
@keyframes cadente { 0%, 96% { opacity: 0; transform: rotate(-28deg) translateX(0); } 97% { opacity: .9; } 100% { opacity: 0; transform: rotate(-28deg) translateX(220px); } }

.mapa-wrap { max-width: 640px; margin: 0 auto; }
.mapa-cabeca { text-align: center; margin-bottom: 24px; }
.mapa-titulo { font-family: 'Cormorant Garamond', serif; font-size: 28px; color: #e8c87e; margin-bottom: 4px; }
.mapa-sub { font-size: 13px; color: #948aae; }
.mapa-inicio { text-align: center; padding: 40px 20px; }
.mapa-simbolo { font-size: 54px; color: #c9a35c; margin-bottom: 20px; }
.mapa-simbolo.a-girar { animation: girar 3s linear infinite; }
@keyframes girar { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.mapa-intro { font-size: 15px; color: #b8aecb; line-height: 1.6; max-width: 400px; margin: 0 auto 24px; }
.mapa-erro { font-size: 14px; color: #c97a7a; margin-bottom: 18px; }
.roda-svg { width: 100%; max-width: 340px; display: block; margin: 0 auto 20px; }
.roda-circ { fill: none; stroke: rgba(201,163,92,.25); stroke-width: 1; }
.roda-circ-int { fill: none; stroke: rgba(150,130,200,.12); stroke-width: 1; }
.roda-linha-signo { stroke: rgba(201,163,92,.18); stroke-width: 1; }
.roda-linha-casa { stroke: rgba(150,130,200,.14); stroke-width: .8; }
.roda-eixo { stroke: rgba(201,163,92,.6); stroke-width: 1.5; }
.roda-glifo-signo { fill: #c9a35c; font-size: 15px; }
.roda-planeta { fill: #e9e3f2; font-size: 15px; }
.roda-planeta-grau { fill: #948aae; font-size: 7px; }
.roda-nodo { fill: #b89dd6; font-size: 13px; }
.roda-asp-harm { stroke: rgba(120,160,200,.3); stroke-width: .7; }
.roda-asp-tenso { stroke: rgba(200,120,120,.28); stroke-width: .7; }
.mapa-tres { display: flex; justify-content: center; gap: 12px; margin-bottom: 26px; }
.mapa-chip { background: rgba(30,22,54,.5); border: 1px solid rgba(201,163,92,.28); border-radius: 20px; padding: 7px 15px; font-size: 13.5px; color: #cdbdf0; }
.mapa-chip-g { color: #e8c87e; margin-right: 4px; }
.mapa-seccao { margin-bottom: 24px; }
.mapa-h3 { font-family: 'Cormorant Garamond', serif; font-size: 21px; color: #e8c87e; margin-bottom: 10px; }
.mapa-par { font-size: 15px; line-height: 1.7; color: #cdbdf0; margin-bottom: 12px; }
.mapa-pdf-btn { display: block; margin: 30px auto 0; background: rgba(201,163,92,.14); color: #e6c885; border: 1px solid rgba(201,163,92,.4); border-radius: 11px; padding: 12px 26px; font-size: 14px; cursor: pointer; }
@media print { .tabs, .topo, .mapa-pdf-btn, .mapa-cabeca { display: none !important; } .mapa-par, .mapa-h3 { color: #1a1330 !important; } body { background: #fff !important; } }
.prev-data { text-align: center; font-size: 13px; color: #948aae; margin-bottom: 20px; font-style: italic; }
.horo-wrap { max-width: 640px; margin: 0 auto; }
.horo-cabeca { text-align: center; margin-bottom: 22px; }
.horo-titulo { font-family: 'Cormorant Garamond', serif; font-size: 27px; color: #e8c87e; margin-bottom: 4px; }
.horo-semana { font-size: 13px; color: #948aae; }
.horo-signos { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 24px; }
.horo-signo { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; background: rgba(30,22,54,.4); border: 1px solid rgba(150,130,200,.15); border-radius: 11px; cursor: pointer; transition: all .18s; }
.horo-signo:hover { border-color: rgba(201,163,92,.4); }
.horo-signo.ativo { background: linear-gradient(160deg, rgba(201,163,92,.18), rgba(30,22,54,.5)); border-color: rgba(201,163,92,.55); }
.horo-simb { font-size: 20px; color: #cdbdf0; }
.horo-signo.ativo .horo-simb { color: #e8c87e; }
.horo-nome { font-size: 9.5px; color: #948aae; letter-spacing: .2px; }
.horo-signo.ativo .horo-nome { color: #cdbdf0; }
.horo-texto-caixa { background: linear-gradient(160deg, rgba(30,22,54,.55), rgba(13,10,26,.4)); border: 1px solid rgba(201,163,92,.22); border-radius: 16px; padding: 26px 24px; min-height: 160px; }
.horo-texto-cabeca { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid rgba(150,130,200,.15); }
.horo-texto-simb { font-size: 30px; color: #e8c87e; }
.horo-texto-nome { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #e9e3f2; }
.horo-texto { font-size: 16px; line-height: 1.7; color: #cdbdf0; }
.horo-vazio { font-size: 15px; color: #948aae; font-style: italic; text-align: center; padding: 30px 0; }
@media (max-width: 480px) { .horo-signos { grid-template-columns: repeat(4, 1fr); } }
.topo, .painel, .ritual, .tabs { position: relative; z-index: 1; }

.topo { text-align: center; margin-bottom: 20px; }
.linguas { display: flex; justify-content: flex-end; gap: 5px; max-width: 560px; margin: 0 auto 4px; }
.lingua {
  background: rgba(30,24,48,.5); color: #8d83a5; border: 1px solid rgba(201,163,92,.25);
  border-radius: 7px; padding: 3px 9px; font-family: inherit; font-size: 11px;
  letter-spacing: 1px; cursor: pointer; transition: all .2s;
}
.lingua.ativo { background: #c9a35c; color: #14101f; border-color: #c9a35c; font-weight: 500; }
.topo-orn { color: #c9a35c; letter-spacing: 6px; font-size: 13px; opacity: .85; }
.topo h1 {
  font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 44px;
  letter-spacing: 7px; text-transform: uppercase; margin-top: 6px;
  background: linear-gradient(180deg, #f6efe0 30%, #cdb98a);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.topo-sub { color: #8d83a5; font-size: 12.5px; letter-spacing: 3px; text-transform: uppercase; margin-top: 5px; }
.conta-linha { display: flex; justify-content: center; align-items: center; gap: 14px; margin-top: 10px; font-size: 13px; color: #9a8fb4; }
.conta-nome { display: inline-flex; align-items: center; gap: 8px; }
.badge.plano { border: none; cursor: pointer; font-family: inherit; background: rgba(141,131,165,.25); color: #b8aecb; }
.badge.plano.pro { background: linear-gradient(180deg, #e0bd72, #c9a35c); color: #14101f; }

.tabs {
  display: flex; flex-wrap: wrap; gap: 6px; max-width: 560px; margin: 0 auto 26px;
  background: rgba(30,24,48,.55); border: 1px solid rgba(201,163,92,.25);
  border-radius: 22px; padding: 6px; justify-content: center;
}
.tab {
  flex: 0 1 auto; background: transparent; color: #9a8fb4; border: none;
  border-radius: 999px; padding: 9px 15px; font-family: inherit;
  font-size: 13px; cursor: pointer; transition: all .25s; white-space: nowrap;
}
.tab.ativo { background: linear-gradient(180deg, #e0bd72, #c9a35c); color: #14101f; font-weight: 500; }

@media (max-width: 560px) {
  .tab { padding: 8px 13px; font-size: 12.5px; }
}

.entra { animation: surgir .55s cubic-bezier(.2,.7,.3,1) both; }
@keyframes surgir { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

.painel { max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: 26px; }

.auth-painel { padding-top: 8px; }
.auth-caixa {
  background: rgba(28,22,46,.72); backdrop-filter: blur(6px);
  border: 1px solid rgba(201,163,92,.3); border-radius: 16px;
  padding: 30px 26px; display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
.auth-titulo { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 28px; color: #f0e9da; text-align: center; }
.auth-sub { text-align: center; color: #8d83a5; font-size: 13.5px; margin-top: -6px; }
.auth-tabs { display: flex; gap: 6px; background: rgba(16,12,28,.6); border: 1px solid rgba(201,163,92,.2); border-radius: 999px; padding: 4px; }
.auth-msg { text-align: center; font-size: 13.5px; }
.auth-msg.erro { color: #d28a8a; }
.auth-msg.info { color: #9bbf9b; }

.rotulo { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #c9a35c; margin-bottom: 10px; display: block; }
.opcional { color: #8d83a5; letter-spacing: 1px; text-transform: none; }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  background: rgba(30,24,48,.4); color: #b8aecb;
  border: 1px solid rgba(201,163,92,.35); border-radius: 999px;
  padding: 8px 16px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all .22s;
}
.chip:hover { border-color: #c9a35c; color: #ece4d4; transform: translateY(-1px); }
.chip.ativo {
  background: linear-gradient(180deg, #e0bd72, #c9a35c);
  border-color: #c9a35c; color: #14101f; font-weight: 500;
  box-shadow: 0 4px 16px rgba(201,163,92,.35);
}

.campo-pass { position: relative; }
.campo-pass .campo { width: 100%; padding-right: 46px; }
.olho { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: none; border: none;
  font-size: 17px; cursor: pointer; padding: 6px 8px; opacity: .7; transition: opacity .2s; }
.olho:hover { opacity: 1; }
.campo {
  width: 100%; background: rgba(30,24,48,.7); color: #ece4d4;
  border: 1px solid rgba(201,163,92,.3); border-radius: 10px;
  padding: 12px 14px; font-family: inherit; font-size: 15px; resize: vertical;
  transition: border-color .2s, box-shadow .2s;
}
.campo:focus { outline: none; border-color: #c9a35c; box-shadow: 0 0 0 3px rgba(201,163,92,.2); }
.campo::placeholder { color: #6f6589; }
.campo-grupo { margin-top: 14px; }

.tiragens { display: flex; flex-direction: column; gap: 10px; }
.tiragem {
  text-align: left; background: rgba(30,24,48,.55); color: inherit;
  border: 1px solid rgba(201,163,92,.25); border-radius: 12px;
  padding: 14px 16px; cursor: pointer; font-family: inherit; transition: all .25s;
  display: grid; grid-template-columns: 1fr auto; gap: 2px 12px;
}
.tiragem:hover { border-color: rgba(201,163,92,.65); transform: translateY(-1px); }
.tiragem.ativo { border-color: #c9a35c; background: rgba(201,163,92,.1); box-shadow: 0 0 0 1px rgba(201,163,92,.4), 0 6px 22px rgba(201,163,92,.12); }
.t-nome { font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 600; color: #f0e9da; }
.t-n { color: #c9a35c; font-size: 12.5px; letter-spacing: 1.5px; align-self: center; }
.t-desc { grid-column: 1 / -1; color: #8d83a5; font-size: 13.5px; }

.toggle-linha {
  display: flex; justify-content: space-between; align-items: center; gap: 14px;
  background: rgba(30,24,48,.45); border: 1px solid rgba(201,163,92,.22);
  border-radius: 12px; padding: 13px 16px; cursor: pointer;
  color: inherit; font-family: inherit; text-align: left; transition: border-color .2s;
}
.toggle-linha:hover { border-color: rgba(201,163,92,.5); }
.tg-titulo { display: block; font-size: 14.5px; color: #ece4d4; }
.tg-desc { display: block; font-size: 12.5px; color: #8d83a5; margin-top: 2px; }
.switch { flex: none; width: 44px; height: 24px; border-radius: 999px; background: rgba(141,131,165,.35); position: relative; transition: background .25s; }
.switch .bola { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #ece4d4; transition: transform .25s cubic-bezier(.3,.8,.4,1.2); }
.switch.on { background: #c9a35c; }
.switch.on .bola { transform: translateX(20px); background: #14101f; }

.cta {
  background: linear-gradient(180deg, #e0bd72, #c9a35c); color: #14101f;
  border: none; border-radius: 12px; padding: 15px;
  font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 500;
  letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
  position: relative; overflow: hidden; transition: transform .15s, box-shadow .25s;
}
.cta::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%);
  transform: translateX(-110%); animation: varrer 4.5s ease-in-out infinite;
}
@keyframes varrer { 0%, 70% { transform: translateX(-110%); } 88%, 100% { transform: translateX(110%); } }
.cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,163,92,.4); }
.cta:disabled { opacity: .55; cursor: default; transform: none; box-shadow: none; }
.cta.pequeno { padding: 10px 18px; font-size: 13px; letter-spacing: 1.5px; }
.nota { text-align: center; color: #9a8fb4; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 16px; }

.limite-caixa {
  background: rgba(201,163,92,.08); border: 1px solid rgba(201,163,92,.4);
  border-radius: 14px; padding: 18px; text-align: center;
  display: flex; flex-direction: column; gap: 10px; align-items: center;
}
.limite-tit { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #e8c87e; }
.limite-caixa p { color: #c9c0b2; font-size: 14px; }

.anuncio {
  border: 1px dashed rgba(141,131,165,.35); border-radius: 10px;
  padding: 12px 14px; text-align: center; color: #6f6589; font-size: 12.5px;
  background: rgba(30,24,48,.3);
}
.anuncio-tag { display: block; font-size: 9.5px; letter-spacing: 2px; text-transform: uppercase; color: #58506e; margin-bottom: 4px; }

.bloqueio {
  background: rgba(28,22,46,.6); border: 1px solid rgba(201,163,92,.25);
  border-radius: 14px; padding: 18px; text-align: center;
  display: flex; flex-direction: column; gap: 10px; align-items: center;
}
.bloqueio p { color: #b8aecb; font-size: 14px; max-width: 380px; }

.pw-caixa {
  background: rgba(28,22,46,.75); backdrop-filter: blur(6px);
  border: 1px solid rgba(201,163,92,.35); border-radius: 18px;
  padding: 30px 24px; display: flex; flex-direction: column; gap: 16px;
  box-shadow: 0 24px 70px rgba(0,0,0,.5);
}
.pw-tit { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 32px; text-align: center; color: #e8c87e; }
.pw-sub { text-align: center; color: #9a8fb4; font-size: 14px; margin-top: -8px; }
.pw-ja { text-align: center; color: #9bbf9b; font-size: 15px; }
.pw-lista { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.pw-lista li { color: #ddd5c6; font-size: 14.5px; display: flex; gap: 10px; align-items: baseline; }
.pw-check { color: #c9a35c; font-size: 12px; }
.pw-planos { display: flex; gap: 12px; }
.pw-plano {
  flex: 1; position: relative; text-decoration: none; text-align: center;
  background: rgba(30,24,48,.6); border: 1px solid rgba(201,163,92,.3);
  border-radius: 14px; padding: 18px 12px; display: flex; flex-direction: column; gap: 6px;
  transition: all .25s;
}
.pw-plano:hover { border-color: #c9a35c; transform: translateY(-2px); }
.pw-plano.destaque { border-color: #c9a35c; background: rgba(201,163,92,.1); box-shadow: 0 0 0 1px rgba(201,163,92,.45); }
.pw-poupa {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  background: #c9a35c; color: #14101f; font-size: 10.5px; font-weight: 500;
  letter-spacing: 1px; text-transform: uppercase; border-radius: 999px; padding: 3px 10px;
}
.pw-plano-nome { color: #9a8fb4; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
.pw-preco { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 600; color: #f0e9da; }
.pw-preco small { font-size: 15px; color: #9a8fb4; }
.pw-equiv { color: #c9a35c; font-size: 12.5px; }
.pw-cta { margin-top: 6px; color: #e8c87e; font-size: 12.5px; letter-spacing: 1px; text-transform: uppercase; }

.ritual { display: flex; flex-direction: column; align-items: center; gap: 34px; padding-top: 50px; min-height: 50vh; }
.baralho-anim { position: relative; width: 130px; height: 200px; }
.ba-carta {
  position: absolute; inset: 0; border-radius: 9px; overflow: hidden;
  border: 1px solid rgba(201,163,92,.5); box-shadow: 0 10px 30px rgba(0,0,0,.55);
  animation: embaralhar 1.15s cubic-bezier(.45,.05,.4,1) infinite;
  animation-delay: calc(var(--i) * .14s);
}
@keyframes embaralhar {
  0% { transform: translate(0,0) rotate(0deg); }
  25% { transform: translate(58px,-14px) rotate(9deg); }
  50% { transform: translate(0,-26px) rotate(0deg); z-index: 2; }
  75% { transform: translate(-58px,-12px) rotate(-9deg); }
  100% { transform: translate(0,0) rotate(0deg); }
}
.ritual-txt { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 21px; color: #cdb98a; text-align: center; animation: pulsar 1.8s ease-in-out infinite; }
@keyframes pulsar { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }

.leitura-cab { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.l-tiragem { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #c9a35c; }
.l-pergunta { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-style: italic; color: #d8cfe6; margin-top: 4px; }
.ghost {
  background: transparent; color: #8d83a5; border: 1px solid rgba(141,131,165,.4);
  border-radius: 999px; padding: 7px 14px; font-family: inherit; font-size: 12.5px;
  cursor: pointer; white-space: nowrap; transition: all .2s;
}
.ghost:hover { color: #ece4d4; border-color: #ece4d4; }
.ghost.perigo { color: #c98484; border-color: rgba(201,132,132,.4); }
.ghost.perigo:hover, .ghost.perigo.firme { color: #e8a0a0; border-color: #e8a0a0; }
.ghost:disabled { opacity: .5; cursor: default; }

.instrucao { color: #9a8fb4; font-size: 14px; text-align: center; }
.link { background: none; border: none; color: #c9a35c; font: inherit; cursor: pointer; text-decoration: underline; }

.mesa { display: flex; flex-wrap: wrap; gap: 18px 16px; justify-content: center; }
.mesa.celta { gap: 14px 10px; }

.posto {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  animation: distribuir .6s cubic-bezier(.2,.8,.3,1) both;
  animation-delay: var(--deal, 0ms);
}
@keyframes distribuir { from { opacity: 0; transform: translateY(-40px) rotate(-4deg) scale(.92); } to { opacity: 1; transform: none; } }
.posto-rotulo { font-size: 11.5px; letter-spacing: 1px; text-transform: uppercase; color: #8d83a5; text-align: center; max-width: 112px; line-height: 1.35; }
.posto-num { display: inline-block; color: #c9a35c; margin-right: 5px; font-family: 'Cormorant Garamond', serif; font-size: 14px; }

.carta-wrap { position: relative; width: 128px; height: 205px; perspective: 1000px; cursor: pointer; }
.carta-wrap.compacta { width: 96px; height: 154px; }
.carta-wrap:hover .carta-inner:not(.flipped) { transform: translateY(-6px); }
.carta-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .8s cubic-bezier(.35,.05,.25,1); }
.carta-inner.flipped { transform: rotateY(180deg); }
.carta-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 9px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.55); }
.carta-verso { border: 1px solid rgba(201,163,92,.5); }
.brilho {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(115deg, transparent 38%, rgba(232,200,126,.22) 50%, transparent 62%);
  transform: translateX(-120%); animation: brilhar 5s ease-in-out infinite;
}
@keyframes brilhar { 0%, 60% { transform: translateX(-120%); } 80%, 100% { transform: translateX(120%); } }
.carta-frente {
  transform: rotateY(180deg);
  background: linear-gradient(165deg, #f5eedd, #e6d9bd);
  border: 1px solid #c9a35c;
  display: flex; align-items: center; justify-content: center; color: #2a2138;
}
.aura {
  position: absolute; inset: -10px; border-radius: 16px; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(232,200,126,.35), transparent 70%);
  animation: aurear 1.3s ease-out both; animation-delay: .35s;
}
@keyframes aurear { from { opacity: 0; transform: scale(.8); } 40% { opacity: 1; } to { opacity: 0; transform: scale(1.25); } }
.cf-conteudo { position: relative; display: flex; flex-direction: column; align-items: center; gap: 7px; text-align: center; padding: 14px 12px; }
.carta-frente.invertida .cf-conteudo, .carta-frente.invertida > svg { transform: rotate(180deg); }
.cf-marca { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #8a6a2e; letter-spacing: 2px; }
.cf-nome { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; line-height: 1.2; }
.compacta .cf-nome { font-size: 13px; }
.compacta .cf-marca { font-size: 17px; }
.cf-sub { font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color: #8a7c5e; }
.cf-inv { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; font-size: 9.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #a0522d; }

.aLer { text-align: center; color: #c9a35c; padding: 18px 0 4px; }
.lua-spin { font-size: 30px; animation: girar 2.4s linear infinite; display: inline-block; }
@keyframes girar { to { transform: rotate(360deg); } }
.aLer p { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-style: italic; margin-top: 6px; }

.erro { text-align: center; color: #d28a8a; display: flex; flex-direction: column; gap: 12px; align-items: center; }

.interpretacao {
  background: rgba(28,22,46,.72); backdrop-filter: blur(6px);
  border: 1px solid rgba(201,163,92,.3); border-radius: 16px;
  padding: 28px 24px 32px; display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
.div-orn { text-align: center; color: #c9a35c; letter-spacing: 8px; font-size: 13px; }
.div-orn.fim { font-size: 20px; margin-top: 6px; }
.interpretacao h3 { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 22px; color: #e8c87e; margin-top: 8px; line-height: 1.25; }
.interpretacao p { line-height: 1.78; font-size: 15.5px; color: #ddd5c6; }
.bloco { animation: surgir .6s ease both; animation-delay: var(--bd, 0ms); }
.guardada { text-align: center; color: #9bbf9b; font-size: 13px; letter-spacing: 1px; }
.nao-guardada { text-align: center; color: #c9a35c; font-size: 13px; font-style: italic; }

.chatSec { display: flex; flex-direction: column; gap: 10px; }
.chat-caixa {
  background: rgba(28,22,46,.6); border: 1px solid rgba(201,163,92,.22);
  border-radius: 14px; padding: 14px; max-height: 320px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
}
.chat-vazio { color: #8d83a5; font-size: 13.5px; font-style: italic; text-align: center; }
.bolha {
  max-width: 86%; padding: 10px 14px; border-radius: 14px; font-size: 14.5px; line-height: 1.6;
  background: rgba(201,163,92,.12); border: 1px solid rgba(201,163,92,.25);
  color: #ddd5c6; align-self: flex-start; animation: surgir .35s ease both;
}
.bolha.minha { align-self: flex-end; background: rgba(98,72,168,.25); border-color: rgba(141,131,165,.4); color: #e8e2f2; }
.bolha.pensar { font-style: italic; color: #c9a35c; }
.chat-linha { display: flex; gap: 8px; }
.chat-linha .campo { flex: 1; }

.hist-lista { display: flex; flex-direction: column; gap: 12px; }
.hist-item { background: rgba(28,22,46,.6); border: 1px solid rgba(201,163,92,.25); border-radius: 14px; overflow: hidden; transition: border-color .2s; }
.hist-item:hover { border-color: rgba(201,163,92,.5); }
.hist-cab {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  gap: 12px; background: none; border: none; color: inherit;
  font-family: inherit; text-align: left; padding: 15px 16px; cursor: pointer;
}
.hist-titulo { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 600; color: #f0e9da; }
.hist-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 5px; }
.badge { font-size: 10.5px; letter-spacing: 1.2px; text-transform: uppercase; color: #14101f; background: #c9a35c; border-radius: 999px; padding: 2px 9px; }
.badge.claro { background: rgba(201,163,92,.18); color: #cdb98a; border: 1px solid rgba(201,163,92,.35); }
.hist-data { color: #8d83a5; font-size: 12px; }
.seta { color: #c9a35c; transition: transform .25s; font-size: 13px; }
.seta.rodada { transform: rotate(90deg); }
.hist-corpo { padding: 0 16px 18px; display: flex; flex-direction: column; gap: 12px; animation: surgir .35s ease both; }
.hist-pergunta { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 17px; color: #d8cfe6; }
.hist-cartas { display: flex; flex-wrap: wrap; gap: 7px; }
.mini-carta { font-size: 12.5px; color: #e0d6c0; background: rgba(201,163,92,.12); border: 1px solid rgba(201,163,92,.3); border-radius: 8px; padding: 4px 10px; }
.mini-carta.inv { color: #d8a48a; border-color: rgba(216,164,138,.4); }
.mini-carta em { color: #c9a35c; font-style: normal; }
.hist-interp { border-left: 2px solid rgba(201,163,92,.4); padding-left: 14px; display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
.hist-interp h4 { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: #e8c87e; font-weight: 600; }
.hist-interp p { font-size: 14px; line-height: 1.65; color: #c9c0b2; }
.hist-acoes { display: flex; justify-content: space-between; align-items: center; gap: 10px; }

.vazio { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 30px 0; color: #9a8fb4; }
.vazio-orn { font-size: 38px; color: #c9a35c; opacity: .7; }

.stats { display: flex; gap: 12px; }
.stat-grande {
  flex: 1; background: rgba(28,22,46,.6); border: 1px solid rgba(201,163,92,.25);
  border-radius: 14px; padding: 18px; text-align: center; display: flex; flex-direction: column; gap: 4px;
}
.stat-num { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 600; color: #e8c87e; }
.stat-lbl { font-size: 11.5px; letter-spacing: 2px; text-transform: uppercase; color: #8d83a5; }
.barras { display: flex; flex-direction: column; gap: 9px; }
.barra-linha { display: grid; grid-template-columns: 110px 1fr 26px; align-items: center; gap: 10px; }
.barra-lbl { font-size: 13px; color: #b8aecb; }
.barra-trilho { height: 8px; background: rgba(141,131,165,.2); border-radius: 999px; overflow: hidden; }
.barra-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #8a6a2e, #e0bd72); animation: crescer .8s cubic-bezier(.2,.7,.3,1) both; transform-origin: left; }
@keyframes crescer { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.barra-n { font-size: 13px; color: #c9a35c; text-align: right; font-family: 'Cormorant Garamond', serif; font-weight: 600; }

.posto-sig {
  max-width: 240px; margin: 6px auto 0; text-align: center;
  animation: surgir .5s ease both;
}
.posto-sig-palavras {
  font-size: 12.5px; line-height: 1.4; color: #c9a35c;
  font-family: 'Cormorant Garamond', serif; font-weight: 600;
  letter-spacing: .3px; margin-bottom: 5px;
}
.posto-sig-texto {
  font-size: 12px; line-height: 1.55; color: #b0a6c4;
  font-family: 'Cormorant Garamond', serif; font-style: italic;
}
.video-oferta {
  width: 100%; background: rgba(98,72,168,.14); border: 1px solid rgba(141,131,165,.35);
  border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; align-items: center;
}
.video-oferta-tit { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #cdb8f0; }
.video-oferta p { color: #b8aecb; font-size: 13.5px; }
.video-a-ver { color: #c9a35c; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.video-indisp { color: #6f6589; font-size: 11px; font-style: italic; }
.disclaimer-leitura {
  text-align: center; color: #8d83a5; font-size: 11.5px; line-height: 1.5;
  border-top: 1px solid rgba(201,163,92,.18); padding-top: 12px; margin-top: 2px;
}
.erro-idade { color: #e8a0a0; font-size: 13px; text-align: center; margin-top: 4px; }
.rodape {
  position: relative; z-index: 1; max-width: 560px; margin: 40px auto 0;
  text-align: center; color: #58506e; font-size: 11px; line-height: 1.6;
  border-top: 1px solid rgba(141,131,165,.15); padding-top: 16px;
}
.perfil-tit { font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 28px; color: #f0e9da; }
.perfil-sub { color: #9a8fb4; font-size: 13.5px; margin-top: 2px; }
.dois-campos { display: flex; gap: 12px; }
.dois-campos .campo-grupo { flex: 1; margin-top: 14px; }
.campo-ajuda { display: block; color: #8d83a5; font-size: 11.5px; margin-top: 4px; font-style: italic; }
select.campo { cursor: pointer; }
.rel-sintese { background: linear-gradient(135deg, rgba(201,163,92,.12), rgba(110,80,180,.1)); border: 1px solid rgba(201,163,92,.28); border-radius: 16px; padding: 22px 22px 24px; margin-bottom: 22px; text-align: center; }
.rel-sintese-orn { color: #c9a35c; letter-spacing: 5px; font-size: 13px; margin-bottom: 12px; }
.rel-sintese-txt { font-family: 'Cormorant Garamond', serif; font-size: 19px; line-height: 1.5; color: #e9e3f2; font-style: italic; }
.rel-carta-mes { margin-bottom: 20px; }
.rel-carta-caixa { display: flex; align-items: center; justify-content: space-between; background: rgba(30,22,54,.5); border: 1px solid rgba(201,163,92,.25); border-radius: 13px; padding: 16px 20px; }
.rel-carta-nome { font-family: 'Cormorant Garamond', serif; font-size: 23px; color: #e8c87e; }
.rel-carta-vezes { font-size: 12.5px; color: #948aae; }
.rel-evolucao { margin-bottom: 20px; }
.rel-evo-linhas { display: flex; flex-direction: column; gap: 10px; }
.rel-evo { display: flex; justify-content: space-between; align-items: center; background: rgba(30,22,54,.4); border: 1px solid rgba(150,130,200,.15); border-radius: 11px; padding: 13px 16px; }
.rel-evo-lbl { font-size: 13px; color: #948aae; }
.rel-evo-cmp { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #cdbdf0; display: flex; align-items: center; gap: 8px; }
.rel-evo-cmp em { font-style: normal; color: #c9a35c; }
.rel-evo-cmp small { font-family: 'Jost', sans-serif; font-size: 11px; color: #948aae; }
.rel-ritmo { margin-bottom: 22px; }
.rel-ritmo-txt { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-style: italic; color: #b8aecb; line-height: 1.5; }
.stats-mini { display: flex; gap: 10px; margin-bottom: 20px; }
.stat-mini { flex: 1; background: rgba(30,22,54,.5); border: 1px solid rgba(150,130,200,.16);
  border-radius: 13px; padding: 14px 8px; text-align: center; }
.stat-mini-num { display: block; font-family: 'Cormorant Garamond', serif; font-size: 26px; color: #c9a35c; line-height: 1; }
.stat-mini-lbl { display: block; font-size: 10.5px; color: #948aae; margin-top: 6px; line-height: 1.3; }
.elemento-caixa { margin-bottom: 20px; }
.elemento-txt { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #cdbdf0; font-style: italic; }
.naipes-barra { display: flex; gap: 3px; height: 54px; border-radius: 11px; overflow: hidden; margin-bottom: 20px; }
.naipe-seg { display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 42px; transition: .3s; }
.naipe-lbl { font-size: 10px; letter-spacing: .5px; opacity: .85; }
.naipe-n { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; }
.naipe-copas { background: rgba(90,130,200,.35); color: #b9d0f0; }
.naipe-espadas { background: rgba(150,150,180,.32); color: #d6d6e8; }
.naipe-paus { background: rgba(200,110,70,.32); color: #f0c3a8; }
.naipe-ouros { background: rgba(180,150,70,.32); color: #f0dda8; }
.ob-fundo { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse 80% 50% at 50% 25%, rgba(110,80,180,.32), transparent), rgba(13,10,26,.97);
  padding: 26px; animation: surgir .4s ease both; }
.ob-caixa { max-width: 340px; width: 100%; text-align: center; }
.ob-orn { color: #c9a35c; font-size: 30px; margin-bottom: 18px; letter-spacing: 6px; }
.ob-titulo { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 600; color: #e9e3f2; margin-bottom: 14px; line-height: 1.15; }
.ob-texto { font-size: 15px; line-height: 1.65; color: #b8aecb; margin-bottom: 26px; }
.ob-pontos { display: flex; gap: 7px; justify-content: center; margin-bottom: 22px; }
.ob-ponto { width: 7px; height: 7px; border-radius: 50%; background: rgba(150,130,200,.3); transition: .3s; }
.ob-ponto.ativo { background: #c9a35c; width: 20px; border-radius: 4px; }
.ob-saltar { display: block; margin: 14px auto 0; background: none; border: none; color: #948aae;
  font-family: inherit; font-size: 13.5px; cursor: pointer; text-decoration: underline; }
.sub-estado { background: rgba(201,163,92,.08); border: 1px solid rgba(201,163,92,.3); border-radius: 14px; padding: 16px 18px; margin-bottom: 22px; }
.sub-linha { display: flex; justify-content: space-between; align-items: center; }
.sub-lbl { font-size: 13px; color: #948aae; }
.sub-valor { font-family: 'Cormorant Garamond', serif; font-size: 21px; color: #e8c87e; display: flex; align-items: center; gap: 8px; }
.sub-badge { font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; background: rgba(123,179,126,.2); color: #7bb37e; padding: 3px 9px; border-radius: 99px; }
.sub-comparar { margin-bottom: 22px; }
.comp-tabela { border: 1px solid rgba(150,130,200,.18); border-radius: 13px; overflow: hidden; }
.comp-cab, .comp-linha { display: grid; grid-template-columns: 1fr 52px 52px; align-items: center; }
.comp-cab { background: rgba(201,163,92,.1); padding: 9px 14px; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; color: #948aae; text-align: center; }
.comp-cab span:first-child { text-align: left; }
.comp-pro { color: #e8c87e; }
.comp-linha { padding: 11px 14px; border-top: 1px solid rgba(150,130,200,.12); font-size: 13.5px; }
.comp-f { color: #b8aecb; line-height: 1.35; }
.comp-x { text-align: center; color: #5d5670; }
.comp-v { text-align: center; color: #c9a35c; }
.sub-gerir { text-align: center; }
.sub-gerir-txt { font-size: 13.5px; color: #948aae; margin-bottom: 14px; }
.pw-cta.bloco { display: block; padding: 13px; border-radius: 99px; background: linear-gradient(180deg,#e8c87e,#c9a35c); color: #0d0a1a; font-weight: 600; text-decoration: none; }
.sub-embreve { font-size: 13px; color: #d9a441; background: rgba(217,164,65,.08); border: 1px solid rgba(217,164,65,.25); border-radius: 11px; padding: 12px; }
.sub-nota { font-size: 11.5px; color: #948aae; margin-top: 12px; font-style: italic; }
.signo-chip.lua { color: #b9c6f0; border-color: rgba(150,170,230,.3); }
.signo-chip.asc { color: #f0c8a8; border-color: rgba(220,160,110,.3); }
.astro-nota { display: block; font-size: 11px; color: #948aae; margin-top: 6px; font-style: italic; }
.mem-bloco { margin-bottom: 9px; }
.mem-lista { background: rgba(13,10,26,.5); border: 1px solid rgba(150,130,200,.18); border-radius: 11px; padding: 14px 16px; margin-top: 8px; }
.mem-txt { font-size: 12px; color: #948aae; margin-bottom: 12px; line-height: 1.5; }
.mem-item { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #b8aecb; padding: 8px 0; border-top: 1px solid rgba(150,130,200,.1); }
.mem-item:first-of-type { border-top: none; }
.mem-x { background: none; border: none; color: #948aae; font-size: 19px; cursor: pointer; line-height: 1; padding: 0 4px; flex: none; }
.mem-x:hover { color: #c97a7a; }
.ajuda-wrap { position: relative; display: inline-flex; vertical-align: middle; }
.ajuda-btn { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(201,163,92,.5); background: rgba(201,163,92,.12); color: #e6c885; font-size: 11px; line-height: 1; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
.ajuda-fundo { position: fixed; inset: 0; z-index: 40; }
.ajuda-balao { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); z-index: 41; width: 230px; background: #1a1330; border: 1px solid rgba(201,163,92,.35); border-radius: 10px; padding: 12px 14px; font-size: 12.5px; line-height: 1.5; color: #cdbdf0; box-shadow: 0 8px 28px rgba(0,0,0,.4); text-align: left; font-weight: 400; }
.conv-zona { margin-top: 34px; padding-top: 22px; border-top: 1px solid rgba(150,130,200,.18); }
.conv-titulo { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #e8c87e; margin-bottom: 6px; }
.conv-txt { font-size: 13px; color: #948aae; line-height: 1.55; margin-bottom: 14px; }
.conv-btn { background: linear-gradient(180deg, #e6c885, #c9a35c); color: #1a1330; border: none; border-radius: 10px; padding: 11px 20px; font-size: 14px; font-weight: 600; cursor: pointer; }
.conv-codigo-cx { display: flex; align-items: center; gap: 10px; background: rgba(13,10,26,.5); border: 1px solid rgba(201,163,92,.3); border-radius: 11px; padding: 12px 16px; margin-bottom: 10px; }
.conv-codigo { font-family: 'Cormorant Garamond', serif; font-size: 24px; letter-spacing: 3px; color: #e8c87e; flex: 1; }
.conv-copiar { background: rgba(201,163,92,.15); color: #e6c885; border: 1px solid rgba(201,163,92,.35); border-radius: 8px; padding: 8px 14px; font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.conv-contador { font-size: 12px; color: #948aae; }
.priv-zona { margin-top: 34px; padding-top: 22px; border-top: 1px solid rgba(150,130,200,.18); }
.priv-titulo { font-family: 'Cormorant Garamond', serif; font-size: 21px; color: #cdbdf0; margin-bottom: 8px; font-weight: 600; }
.priv-txt { font-size: 13px; line-height: 1.55; color: #948aae; margin-bottom: 14px; }
.priv-btn { display: block; width: 100%; margin-bottom: 9px; background: rgba(30,22,54,.55);
  border: 1px solid rgba(150,130,200,.25); border-radius: 11px; padding: 12px 16px; color: #b8aecb;
  font-family: inherit; font-size: 14px; cursor: pointer; transition: .2s; }
.priv-btn:hover:not(:disabled) { border-color: rgba(201,163,92,.5); color: #e9e3f2; }
.priv-btn:disabled { opacity: .5; cursor: default; }
.priv-perigo { border-color: rgba(201,122,122,.35); color: #c97a7a; }
.priv-perigo:hover:not(:disabled) { border-color: #c97a7a; color: #e08b8b; }
.priv-codigo { font-size: 14px; color: #c9a35c; text-align: center; margin: 4px 0 12px; letter-spacing: 1px; }
.priv-codigo b { font-size: 19px; font-family: 'Cormorant Garamond', serif; letter-spacing: 3px; }
.priv-link { display:block; text-align:center; margin-top:14px; font-size:13px; color:#948aae; text-decoration:underline; }
.priv-msg { font-size: 13px; color: #7bb37e; text-align: center; margin-top: 8px; }
.signo-chip {
  display: inline-block; margin-top: 8px; background: rgba(201,163,92,.15);
  border: 1px solid rgba(201,163,92,.4); color: #e8c87e; border-radius: 999px;
  padding: 4px 14px; font-size: 13px; font-family: 'Cormorant Garamond', serif; letter-spacing: 1px;
}
.priv-caixa {
  background: rgba(30,24,48,.4); border: 1px solid rgba(141,131,165,.25);
  border-radius: 12px; padding: 13px 15px;
}
.priv-tit { color: #b8aecb; font-size: 13px; letter-spacing: 1px; margin-bottom: 4px; }
.priv-caixa p { color: #8d83a5; font-size: 12.5px; line-height: 1.55; }
.consent {
  display: flex; gap: 12px; align-items: flex-start; text-align: left;
  background: rgba(30,24,48,.45); border: 1px solid rgba(201,163,92,.22);
  border-radius: 12px; padding: 14px 16px; cursor: pointer; color: inherit; font-family: inherit;
  transition: border-color .2s;
}
.consent:hover { border-color: rgba(201,163,92,.45); }
.consent .check {
  flex: none; width: 22px; height: 22px; border-radius: 6px; margin-top: 1px;
  border: 1px solid rgba(201,163,92,.5); display: flex; align-items: center; justify-content: center;
  color: #14101f; font-size: 13px; transition: background .2s;
}
.consent .check.on { background: #c9a35c; border-color: #c9a35c; }
.consent-tit { display: block; font-size: 14px; color: #ece4d4; margin-bottom: 3px; }
.consent-txt { display: block; font-size: 12px; color: #8d83a5; line-height: 1.5; }

@media (prefers-reduced-motion: reduce) {
  .carta-inner, .posto, .bloco, .entra, .bolha { transition: none; animation: none; opacity: 1; }
  .lua-spin, .ba-carta, .brilho, .cta::after, .estrela, .estrela-cadente, .aura, .ritual-txt, .barra-fill { animation: none; }
}
@media (max-width: 420px) {
  .topo h1 { font-size: 34px; }
  .carta-wrap { width: 104px; height: 167px; }
  .carta-wrap.compacta { width: 86px; height: 138px; }
  .barra-linha { grid-template-columns: 92px 1fr 24px; }
  .tab { font-size: 12px; }
  .pw-planos { flex-direction: column; }
  .dois-campos { flex-direction: column; gap: 0; }
}
`;

import { useState, useMemo, useEffect, useRef } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseClient";

/* ─────────── CONFIG ─────────── */

// Links de pagamento Stripe — preencher no .env ou variáveis Vercel
const STRIPE_LINK_MENSAL = process.env.REACT_APP_STRIPE_MENSAL || "https://buy.stripe.com/SUBSTITUIR_MENSAL";
const STRIPE_LINK_ANUAL = process.env.REACT_APP_STRIPE_ANUAL || "https://buy.stripe.com/SUBSTITUIR_ANUAL";

/* ─────────── i18n ─────────── */

const PT = {
  sub: "O teu baralho, sempre contigo",
  bemVindo: "Bem-vindo de volta", criaConta: "Cria a tua conta",
  authSub: "As tuas leituras, só tuas, em segurança.",
  entrar: "Entrar", registar: "Registar", nomePH: "O teu nome",
  passPH: "Palavra-passe (mín. 6 caracteres)",
  preenche: "Preenche o email e a palavra-passe.",
  contaCriada: "Conta criada! Verifica o teu email para confirmar e depois entra.",
  momento: "Um momento…", criarConta: "Criar conta", sair: "Sair",
  tabLeitura: "✦ Leitura", tabHist: "☾ Histórico", tabRel: "◐ Relatório",
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
  perfilHora: "Hora de nascimento",
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
      pos: ["O Presente — a situação atual","O Desafio — o que cruza o caminho","A Raiz — a base da questão","O Passado — o que fica para trás","A Coroa — objetivo e potencial","O Futuro Próximo","Tu — a tua atitude","O Ambiente — influências externas","Esperanças e Medos","O Resultado"] },
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
  sub: "Seu baralho, sempre com você",
  bemVindo: "Bem-vindo de volta", criaConta: "Crie sua conta",
  authSub: "Suas leituras, só suas, em segurança.",
  nomePH: "Seu nome", passPH: "Senha (mín. 6 caracteres)",
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
  passPH: "Password (min. 6 characters)",
  preenche: "Please fill in email and password.",
  contaCriada: "Account created! Check your email to confirm, then sign in.",
  momento: "One moment…", criarConta: "Create account", sair: "Sign out",
  tabLeitura: "✦ Reading", tabHist: "☾ History", tabRel: "◐ Report",
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
  perfilHora: "Time of birth",
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
      pos: ["The Present — current situation","The Challenge — what crosses your path","The Root — foundation of the matter","The Past — what is left behind","The Crown — goal and potential","The Near Future","You — your attitude","The Environment — external influences","Hopes and Fears","The Outcome"] },
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

async function chamarIA(token, messages, tipo, idioma) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/interpretar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages, tipo, idioma }),
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
function signoDe(dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO + "T12:00:00");
  const mes = d.getMonth() + 1, dia = d.getDate();
  for (const s of SIGNOS) {
    if (mes < s.ate[0] || (mes === s.ate[0] && dia <= s.ate[1])) return s.nome;
  }
  return "Capricórnio";
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

function Paywall({ L, userId, ehPro }) {
  const ref = userId ? `?client_reference_id=${userId}` : "";
  return (
    <main className="painel entra">
      <div className="pw-caixa">
        <div className="div-orn">✶ ☾ ✶</div>
        <h2 className="pw-tit">{L.proTit}</h2>
        <p className="pw-sub">{L.proSub}</p>
        {ehPro ? (
          <p className="pw-ja">{L.jaPro}</p>
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
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submeter() {
    if (!email.trim() || !password) { setMsg({ tipo: "erro", txt: L.preenche }); return; }
    setOcupado(true); setMsg(null);
    try {
      if (modo === "registar") {
        const d = await authRegistar(email.trim(), password, nome.trim());
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
        <input className="campo" type="password" placeholder={L.passPH} value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submeter()} autoComplete="current-password" />
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

function EcraPerfil({ L, idioma, sessao, perfil, onPerfilAtualizado, consentMarketing, onConsent }) {
  const [nome, setNome] = useState(perfil?.nome || "");
  const [nasc, setNasc] = useState(perfil?.data_nascimento || "");
  const [hora, setHora] = useState(perfil?.hora_nascimento || "");
  const [local, setLocal] = useState(perfil?.local_nascimento || "");
  const [genero, setGenero] = useState(perfil?.genero || "");
  const [profissao, setProfissao] = useState(perfil?.profissao || "");
  const [marketing, setMarketing] = useState(!!consentMarketing);
  const [ocupado, setOcupado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const signoPt = signoDe(nasc);
  const signoMostra = idioma === "en" && L.signos?.[signoPt] ? L.signos[signoPt] : signoPt;

  async function guardar() {
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
        <input className="campo" type="date" value={nasc} onChange={(e) => setNasc(e.target.value)} />
        {signoMostra && <span className="signo-chip">☉ {signoMostra}</span>}
      </div>

      <div className="dois-campos">
        <div className="campo-grupo">
          <label className="rotulo">{L.perfilHora}</label>
          <input className="campo" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
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

      <button className="cta" onClick={guardar} disabled={ocupado}>
        {guardado ? L.perfilGuardado : ocupado ? L.aGuardar : L.perfilGuardar}
      </button>
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
  const ehPro = perfil?.plano === "pro";

  const [vista, setVista] = useState("nova"); // nova | historico | relatorio | pro
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
        let dados = await dbGet(sessao.token, `significados_cartas?idioma=eq.${idioma}&select=card_id,direito,invertido`);
        if ((!dados || !dados.length) && idioma !== "pt-PT") {
          dados = await dbGet(sessao.token, `significados_cartas?idioma=eq.pt-PT&select=card_id,direito,invertido`);
        }
        if (cancelado) return;
        const mapa = {};
        (dados || []).forEach((d) => { mapa[d.card_id] = { direito: d.direito, invertido: d.invertido }; });
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
        const p = await dbGet(sessao.token, "profiles?select=plano,nome,data_nascimento,hora_nascimento,local_nascimento,signo,genero,profissao");
        setPerfil(p[0] || null);
        try {
          const cons = await dbGet(sessao.token, "consentimentos?finalidade=eq.marketing_kairos&select=concedido");
          setConsentMarketing(!!cons[0]?.concedido);
        } catch { /* sem consentimento ainda */ }
        if (p[0]?.plano === "pro") {
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
    const total = leiturasMes.length;
    const porVertente = {}; const porCarta = {};
    let invertidas = 0, totalCartas = 0;
    leiturasMes.forEach((l) => {
      porVertente[l.vertente] = (porVertente[l.vertente] || 0) + 1;
      (l.cartas || []).forEach((c) => {
        porCarta[c.nome] = (porCarta[c.nome] || 0) + 1;
        totalCartas++;
        if (c.invertida) invertidas++;
      });
    });
    return {
      total,
      vertentes: Object.entries(porVertente).sort((a, b) => b[1] - a[1]),
      topCartas: Object.entries(porCarta).sort((a, b) => b[1] - a[1]).slice(0, 5),
      pctInv: totalCartas ? Math.round((invertidas / totalCartas) * 100) : 0,
    };
  }, [leiturasMes]);

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
    return carta.invertida ? s.invertido : s.direito;
  }

  function promptLeitura() {
    const lista = cartas
      .map((c, i) => {
        const sig = sigDe(c);
        return `${i + 1}. ${tiragem.pos[i]}: ${c.nome}${c.invertida ? " (⟲)" : ""}${sig ? ` [significado base: ${sig}]` : ""}`;
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
      const texto = await chamarIA(sessao.token, [{ role: "user", content: promptLeitura() }], "leitura", idioma);
      setInterpretacao(texto);
      if (!ehPro) setProximaLeitura(new Date(Date.now() + 7 * 864e5));
      if (ehPro) await guardarLeitura(texto);
    } catch (e) {
      if (e.codigo === "limite_semanal") {
        setProximaLeitura(e.proxima ? new Date(e.proxima) : null);
        setErro(`${L.limiteTxt} ${e.proxima ? dataPt(e.proxima, L) : ""}`);
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
        cartas: cartas.map((c) => ({ nome: c.nome, invertida: c.invertida })),
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
  const maxVert = statsMes.vertentes.length ? statsMes.vertentes[0][1] : 1;
  const bloqueado = !ehPro && proximaLeitura && proximaLeitura > new Date();

  function irPara(v) {
    if ((v === "historico" || v === "relatorio") && !ehPro) setVista("pro");
    else setVista(v);
  }

  return (
    <div className="app">
      <style>{css}</style>
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
              <button className={`badge plano ${ehPro ? "pro" : ""}`} onClick={() => setVista("pro")}>
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
            <button role="tab" className={`tab ${vista === "perfil" ? "ativo" : ""}`} onClick={() => setVista("perfil")}>{L.tabPerfil}</button>
          </nav>

          {vista === "pro" && <Paywall L={L} userId={sessao.user.id} ehPro={ehPro} />}

          {vista === "perfil" && (
            <EcraPerfil
              L={L} idioma={idioma} sessao={sessao} perfil={perfil}
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
                  <button className="link" onClick={() => setVista("pro")}>{L.desbloqueia}</button>
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
                <div className="rotulo">{L.tiragemLbl}</div>
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
                      <p className="posto-sig">{sigDe(c)}</p>
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
                  {bloqueado && <button className="cta pequeno" onClick={() => setVista("pro")}>{L.desbloqueia}</button>}
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
                      <button className="cta pequeno" onClick={() => setVista("pro")}>{L.desbloqueia}</button>
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
  display: flex; gap: 6px; max-width: 560px; margin: 0 auto 26px;
  background: rgba(30,24,48,.55); border: 1px solid rgba(201,163,92,.25);
  border-radius: 999px; padding: 5px;
}
.tab {
  flex: 1; background: transparent; color: #9a8fb4; border: none;
  border-radius: 999px; padding: 9px 6px; font-family: inherit;
  font-size: 13px; cursor: pointer; transition: all .25s; white-space: nowrap;
}
.tab.ativo { background: linear-gradient(180deg, #e0bd72, #c9a35c); color: #14101f; font-weight: 500; }

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
  max-width: 130px; font-size: 11.5px; line-height: 1.4; color: #b8aecb;
  text-align: center; font-style: italic; font-family: 'Cormorant Garamond', serif;
  margin-top: 2px; animation: surgir .5s ease both;
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

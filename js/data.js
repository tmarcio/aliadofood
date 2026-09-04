/* ==========================================================================
   ALIADO FOOD — Dados da aplicação
   Edita este ficheiro para actualizar cardápio, preços, parceiros,
   actividades e a tabela de taxas de entrega. Nenhum outro ficheiro
   precisa de ser tocado para estas actualizações do dia-a-dia.
   ========================================================================== */

/* -------------------------------------------------------------------------
   CARDÁPIO
   category: "refeicoes" | "pizzas" | "bebidas"
   ------------------------------------------------------------------------- */
const ALIADO_MENU = [
  // Refeições
  { id: "ref-01", category: "refeicoes", nome: "Muamba de Galinha", desc: "Frango caseiro em molho de dendém, quiabo e funge de bombó.", preco: 4500, tag: "Mais pedido" },
  { id: "ref-02", category: "refeicoes", nome: "Calulu de Peixe Seco", desc: "Peixe seco e fresco, quiabo e jindungo, servido com funge de milho.", preco: 4800 },
  { id: "ref-03", category: "refeicoes", nome: "Cabidela de Frango", desc: "Frango estufado no próprio sangue temperado, arroz branco à parte.", preco: 4200 },
  { id: "ref-04", category: "refeicoes", nome: "Feijão de Óleo de Palma", desc: "Feijão vermelho, óleo de palma, folha de mandioca e camarão seco.", preco: 3800 },
  { id: "ref-05", category: "refeicoes", nome: "Grelhado Misto Aliado", desc: "Frango e picanha grelhados, arroz de coco, banana frita e salada.", preco: 5500, tag: "Novo" },
  { id: "ref-06", category: "refeicoes", nome: "Kizaka com Peixe Frito", desc: "Folha de mandioca estufada com amendoim, servida com peixe frito e funge.", preco: 4600 },
  // Pizzas
  { id: "piz-01", category: "pizzas", nome: "Margherita Aliado", desc: "Molho de tomate, mozarela fresca, manjericão.", preco: 4200 },
  { id: "piz-02", category: "pizzas", nome: "Pepperoni Clássica", desc: "Molho de tomate, mozarela e pepperoni em fatias generosas.", preco: 4800, tag: "Mais pedido" },
  { id: "piz-03", category: "pizzas", nome: "Frango Piri-Piri", desc: "Frango desfiado, molho piri-piri da casa, pimentos e cebola.", preco: 5000 },
  { id: "piz-04", category: "pizzas", nome: "Quatro Queijos", desc: "Mozarela, gorgonzola, parmesão e queijo flamengo.", preco: 5200 },
  { id: "piz-05", category: "pizzas", nome: "Vegetariana da Horta", desc: "Pimentos, cogumelos, milho, azeitona e cebola roxa.", preco: 4400 },
  { id: "piz-06", category: "pizzas", nome: "Camarão & Alho", desc: "Camarão salteado no alho, mozarela e um fio de azeite picante.", preco: 5800, tag: "Novo" },
  // Bebidas
  { id: "beb-01", category: "bebidas", nome: "Água Mineral 0.5L", desc: "Água engarrafada, com ou sem gás.", preco: 500 },
  { id: "beb-02", category: "bebidas", nome: "Coca-Cola 330ml", desc: "Lata gelada.", preco: 800 },
  { id: "beb-03", category: "bebidas", nome: "Sumo Natural de Múcua", desc: "Sumo fresco preparado na casa, 500ml.", preco: 1200, tag: "Mais pedido" },
  { id: "beb-04", category: "bebidas", nome: "Cerveja Cuca 330ml", desc: "Cerveja nacional gelada.", preco: 1000 },
  { id: "beb-05", category: "bebidas", nome: "Sumo de Ananás Natural", desc: "Sumo fresco preparado na casa, 500ml.", preco: 1200 },
  { id: "beb-06", category: "bebidas", nome: "Refrigerante Sumol 330ml", desc: "Lata gelada, sabor ananás ou laranja.", preco: 850 },
];

/* -------------------------------------------------------------------------
   TAXAS DE ENTREGA POR MUNICÍPIO
   Modelo baseado na estrutura de tarifação por quilómetro praticada por
   aplicativos de motorizadas em Luanda (tarifa base cobre os primeiros
   5 km, depois soma-se um valor por km adicional). As distâncias abaixo
   são estimativas a partir do ponto de venda da Aliado Food e devem ser
   calibradas periodicamente pela equipa com base em cotações reais.
   Ajusta livremente "distanciaKm" e a fórmula em ALIADO_CONFIG.
   ------------------------------------------------------------------------- */
const ALIADO_MUNICIPIOS = [
  { id: "luanda",        nome: "Luanda (centralidades)",  distanciaKm: 6   },
  { id: "talatona",      nome: "Talatona",                distanciaKm: 10  },
  { id: "kilamba-kiaxi", nome: "Kilamba Kiaxi",            distanciaKm: 13  },
  { id: "cazenga",       nome: "Cazenga",                  distanciaKm: 15  },
  { id: "belas",         nome: "Belas",                    distanciaKm: 18  },
  { id: "cacuaco",       nome: "Cacuaco",                  distanciaKm: 22  },
  { id: "viana",         nome: "Viana",                    distanciaKm: 25  },
  { id: "icolo-e-bengo", nome: "Icolo e Bengo",             distanciaKm: 45  },
  { id: "quicama",       nome: "Quiçama",                  distanciaKm: null, sobConsulta: true },
];

/* Parâmetros do cálculo de taxa (estilo Yango: tarifa base + custo por km) */
const ALIADO_CONFIG = {
  taxaBaseKz: 560,        // cobre os primeiros kmIncluidos
  kmIncluidos: 5,
  precoPorKmExtraKz: 160,
  arredondarParaKz: 50,   // arredonda o resultado final para múltiplos de
  moeda: "Kz",
  whatsapp: "244929809889",
  email: "aliadofood@hotmail.com",
  instagram: "https://instagram.com/aliadofood",
  facebook: "https://facebook.com/aliadofood.ao",
  aliadoMais: "https://aliadomais.lovable.app",
  formsubmitEndpoint: "https://formsubmit.co/aliadofood@hotmail.com",
};

/* -------------------------------------------------------------------------
   PARCEIROS — substitui por logótipos reais em /assets/parceiros/
   ------------------------------------------------------------------------- */
const ALIADO_PARCEIROS = [
  { nome: "ATO & OC, S.A.", desc: "Operações aeroportuárias, Aeroporto de Luanda", iniciais: "AT" },
  { nome: "Yango Angola", desc: "Mobilidade e logística de motorizadas", iniciais: "YG" },
  { nome: "Multicaixa Express", desc: "Pagamentos digitais", iniciais: "ME" },
  { nome: "Fazenda Sabores da Terra", desc: "Fornecedor de hortícolas frescos", iniciais: "FT" },
  { nome: "Rádio Comercial FM", desc: "Parceiro de comunicação", iniciais: "RC" },
];

/* -------------------------------------------------------------------------
   ACTIVIDADES / EVENTOS
   ------------------------------------------------------------------------- */
const ALIADO_ACTIVIDADES = [
  {
    titulo: "Aliado Food no Aeroporto de Luanda",
    data: "Todos os dias, 06h00 – 22h00",
    desc: "O nosso ponto de venda fixo no aeroporto continua a servir viajantes e equipas aeroportuárias com refeições rápidas e de qualidade.",
  },
  {
    titulo: "Feira Gastronómica de Luanda",
    data: "Setembro 2026",
    desc: "A Aliado Food vai marcar presença com um stand dedicado às nossas pizzas e pratos tradicionais angolanos.",
  },
  {
    titulo: "Lançamento do Programa Aliado+",
    data: "Em curso",
    desc: "Acumula pontos em cada pedido e troca por refeições grátis através do nosso programa de fidelidade.",
  },
];

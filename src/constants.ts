/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GasService, SafetyTip } from "./types";

import gasBotijaoP13Cozinha from "./assets/images/gas_botijao_p13_cozinha_1795010575119.jpg";
import gasCilindroP45Comercial from "./assets/images/gas_cilindro_p45_comercial_1795010574381.jpg";
import gasCilindroP20Empilhadeira from "./assets/images/gas_cilindro_p20_1795619954310.jpg";
import gasSegurancaInstalacao from "./assets/images/gas_seguranca_instalacao_1795010575739.jpg";

export const APP_DETAILS = {
  name: "Gás da 7",
  legalName: "Gás da 7 · Revenda Autorizada",
  cnpj: "58.522.321/0001-36",
  phoneWhatsapp: "(49) 99810-7798",
  phoneWhatsappRaw: "5549998107798",
  phoneFixed: "(49) 3018-4038",
  phoneFixedRaw: "554930184038",
  address: "Rua Sete de Setembro, 1749 – Bairro Santa Helena, Lages - SC",
  cep: "CEP 88504-453",
  addressShort: "Santa Helena · Lages - SC",
  googleShareUrl: "https://share.google/HFbLcg5Rjf5pTZ2vG",
  hoursWeekdays: "Segunda a Sábado: 08:00 às 20:00",
  hoursSunday: "Domingo: 08:00 às 12:00",
  hoursShort: "Seg a Sáb 08h–20h · Dom 08h–12h",
  slogan: "Disk Gás com Entrega Rápida em Toda Lages/SC!",
  tagline: "Oh o Gás! Disk Gás ágil, seguro e com botijão lacrado em toda a cidade de Lages.",
  history:
    "Com depósito na Rua Sete de Setembro, 1749, no Bairro Santa Helena, a Gás da 7 é referência em Disk Gás na região de Lages/SC, com atendimento em toda a cidade de Lages. Realizamos tele-entrega rápida de gás de cozinha GLP (botijões P13, P20 e P45) lacrados de fábrica, com conferência de segurança na instalação e atendimento todos os dias da semana para residências e comércios.",
  mission:
    "Oferecer Disk Gás em toda a cidade de Lages/SC e região com entrega rápida, botijões certificados, segurança na instalação e atendimento direto por WhatsApp e telefone fixo.",
  vision:
    "Ser o Disk Gás de primeira escolha em toda a cidade de Lages e região pela pontualidade na entrega, transparência e confiança em cada atendimento.",
  values: [
    "Agilidade",
    "Segurança",
    "Transparência",
    "Qualidade Certificada",
    "Respeito ao Cliente",
    "Pontualidade",
  ],
};

export const IMAGES = {
  logoWhite: "/assets/aistudio/gas_da_7_02_horizontal_branca_7bc9c31c.png",
  logoDark: "/assets/aistudio/gas_da_7_02_horizontal_19118658.png",
  mascotRef: "/assets/aistudio/personagens-04_f49c1e10.png",
  flyerRef: "/assets/aistudio/ima_gasda7_ima2_119a44a0.png",
};

export const SERVICES: GasService[] = [
  {
    id: "p13",
    name: "Botijão P13 (Uso Residencial)",
    badge: "13 kg · Cozinha",
    description:
      "O clássico botijão azul de 13 kg para residências em Lages. Entregue lacrado, com peso exato e verificação segura no momento da instalação.",
    detailedDesc:
      "Ideal para fogões residenciais, fornos e aquecimento doméstico. Todos os botijões P13 saem do depósito na Rua Sete de Setembro com lacre de fábrica intacto e conferência gratuita de vazamento na entrega.",
    image: gasBotijaoP13Cozinha,
  },
  {
    id: "p45",
    name: "Cilindro P45 (Comercial & Condomínios)",
    badge: "45 kg · Alta Demanda",
    description:
      "Abastecimento contínuo de cilindros P45 para restaurantes, padarias, lanchonetes, hotéis e centrais de gás de condomínios em Lages/SC.",
    detailedDesc:
      "Solução robusta para cozinhas industriais e estabelecimentos comerciais de Lages que não podem parar. Entrega programada ou emergencial com manuseio seguro até a central de gás.",
    image: gasCilindroP45Comercial,
  },
  {
    id: "p20",
    name: "Gás P20 (Empilhadeiras)",
    badge: "20 kg · Industrial & Logística",
    description:
      "Cilindro P20 de 20 kg desenvolvido especialmente para empilhadeiras a gás GLP em depósitos, mercados, indústrias e centros logísticos de Lages/SC.",
    detailedDesc:
      "Fornecimento ágil de Gás P20 para empilhadeiras em toda a cidade de Lages e região. Cilindros revisados, lacrados e preparados para uso na posição horizontal, garantindo autonomia e desempenho contínuo na sua operação.",
    image: gasCilindroP20Empilhadeira,
  },
  {
    id: "seguranca",
    name: "Instalação & Conferência de Segurança",
    badge: "Padrão INMETRO",
    description:
      "Auxiliamos na troca do botijão, conferimos a validade do regulador e da mangueira e realizamos o teste de estanqueidade com segurança.",
    detailedDesc:
      "Sua família protegida em primeiro lugar. Nossos entregadores verificam o encaixe correto da válvula, orientam sobre a validade de 5 anos do regulador NBR 8473 e garantem uma chama azul estável e econômica.",
    image: gasSegurancaInstalacao,
  },
];

export const DIFFERENTIALS = [
  {
    id: "d1",
    title: "Atendimento em Toda a Cidade de Lages",
    desc: "Disk Gás com entrega rápida em todos os bairros de Lages e região, saindo do nosso depósito na Rua Sete de Setembro para atender casas e empresas com agilidade.",
  },
  {
    id: "d2",
    title: "Botijões Lacrados e Certificados",
    desc: "Trabalhamos apenas com botijões revisados, lacrados de fábrica e dentro das normas da ANP, garantindo peso completo e alto rendimento.",
  },
  {
    id: "d3",
    title: "Instalação Gratuita e Segura",
    desc: "Nossa equipe realiza a troca do botijão no local, testa contra vazamentos e verifica as condições do seu regulador e mangueira.",
  },
  {
    id: "d4",
    title: "Atendimento de Segunda a Domingo",
    desc: "Funcionamos de segunda a sábado das 08h às 20h e aos domingos das 08h às 12h para não deixar você na mão no fim de semana.",
  },
  {
    id: "d5",
    title: "WhatsApp e Telefone Fixo Direto",
    desc: "Atendimento humano e rápido sem robôs demorados: peça pelo WhatsApp (49) 99810-7798 ou ligue no (49) 3018-4038.",
  },
  {
    id: "d6",
    title: "Pagamento Facilitado na Entrega",
    desc: "Leve tranquilidade até a porta de casa: aceitamos Pix, cartões de débito, crédito e dinheiro diretamente com o entregador.",
  },
];

export const NEIGHBORHOODS_LAGES = [
  "Santa Helena",
  "Centro",
  "Coral",
  "Universitário",
  "São Cristóvão",
  "Conta Dinheiro",
  "Triângulo",
  "Guarujá",
  "Habitação",
  "Copacabana",
  "São Miguel",
  "Frei Rogério",
  "Petrópolis",
  "Vila Nova",
  "Penha",
  "Bela Vista",
];

export const SAFETY_TIPS: SafetyTip[] = [
  {
    id: "s1",
    step: "01",
    title: "Confira o Lacre de Fábrica",
    desc: "Todo botijão P13 ou P45 entregue pela Gás da 7 chega com lacre de segurança intacto e rótulo informativo com instruções claras.",
  },
  {
    id: "s2",
    step: "02",
    title: "Teste com Espuma, Nunca com Fogo",
    desc: "Ao instalar o regulador, aplique espuma de sabão ao redor da válvula. Se formar bolhas, desconecte imediatamente e chame nossa equipe.",
  },
  {
    id: "s3",
    step: "03",
    title: "Validade de 5 Anos (Mangueira e Regulador)",
    desc: "Verifique a data de validade gravada na mangueira transparente (NBR 8613) e no regulador (NBR 8473). Peças vencidas devem ser substituídas.",
  },
  {
    id: "s4",
    step: "04",
    title: "Local Ventilado e Botijão em Pé",
    desc: "Mantenha o botijão sempre na posição vertical, em local arejado e longe de ralos, tomadas elétricas ou fontes diretas de calor.",
  },
];

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GasService, SafetyTip } from "./types";

import botijaoP13Produto from "./assets/images/botijao_p13_produto_1795630485903.jpg";
import cilindroP45Produto from "./assets/images/cilindro_p45_produto_1795630486489.jpg";

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
    "Com depósito na Rua Sete de Setembro, 1749, no Bairro Santa Helena, a Gás da 7 é referência em Disk Gás na região de Lages/SC, com atendimento em toda a cidade de Lages. Realizamos tele-entrega rápida de gás de cozinha GLP (botijões P13 e cilindros P45) lacrados de fábrica, com conferência de segurança na instalação e atendimento todos os dias da semana para residências e comércios.",
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
    semCascoId: "p13-sem-casco",
    name: "Botijão P13 (13 kg)",
    badge: "Uso Residencial · Cozinha",
    description:
      "Botijão de gás GLP de 13 kg ideal para fogões e fornos residenciais. Entregue lacrado de fábrica com peso exato.",
    detailedDesc:
      "Botijão de gás GLP de 13 kg para uso doméstico em fogões e fornos residenciais. Entregue lacrado de fábrica com peso completo e opção com ou sem casco para troca.",
    image: botijaoP13Produto,
    priceRefill: 125,
    priceWithoutShell: 350,
  },
  {
    id: "p45",
    semCascoId: "p45-sem-casco",
    name: "Cilindro P45 (45 kg)",
    badge: "Uso Comercial & Condomínios",
    description:
      "Cilindro de gás GLP de 45 kg desenvolvido para restaurantes, padarias, lanchonetes, comércios e centrais de condomínios.",
    detailedDesc:
      "Cilindro de gás GLP de 45 kg de alta capacidade para cozinhas industriais, comércios e centrais de condomínios. Disponível na modalidade recarga (com casco) ou completo (sem casco).",
    image: cilindroP45Produto,
    priceRefill: 450,
    priceWithoutShell: 1250,
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
    desc: "Todo botijão P13 ou cilindro P45 entregue pela Gás da 7 chega com lacre de segurança intacto e rótulo informativo com instruções claras.",
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

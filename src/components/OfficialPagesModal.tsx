/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, ShieldCheck, Info, Truck, CheckCircle2 } from "lucide-react";
import { APP_DETAILS } from "../constants";

interface OfficialPagesModalProps {
  isOpen: boolean;
  initialType: "abnt" | "terms" | "privacy" | null;
  onClose: () => void;
}

export default function OfficialPagesModal({ isOpen, initialType, onClose }: OfficialPagesModalProps) {
  const [activeTab, setActiveTab] = useState<"abnt" | "terms" | "privacy">("abnt");

  useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 sm:p-10">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#121521]/65 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white border border-[#FFE1CC] rounded-2xl text-[#121521] w-full max-w-4xl h-[82vh] flex flex-col relative z-10 shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="bg-[#F26513] text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-white" />
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-white/90 font-bold">
                  Informações Oficiais
                </span>
                <span className="font-extrabold text-base tracking-tight uppercase">
                  {APP_DETAILS.name} · Lages/SC
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar Modal"
              className="py-1.5 px-3.5 rounded-lg bg-[#00B8F4] text-[#121521] hover:bg-white hover:text-[#121521] transition-all duration-150 flex items-center justify-center cursor-pointer text-xs uppercase tracking-wider font-extrabold"
            >
              <span>Fechar</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#FFF9F5] border-b border-[#FFE1CC] flex flex-wrap text-xs font-bold p-2 gap-2">
            <button
              onClick={() => setActiveTab("abnt")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "abnt"
                  ? "bg-white text-[#121521] font-extrabold border-2 border-[#F26513]"
                  : "text-[#33394D] hover:bg-white/70 border-2 border-transparent"
              }`}
            >
              <span>Segurança & Normas</span>
            </button>

            <button
              onClick={() => setActiveTab("terms")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "terms"
                  ? "bg-white text-[#121521] font-extrabold border-2 border-[#F26513]"
                  : "text-[#33394D] hover:bg-white/70 border-2 border-transparent"
              }`}
            >
              <span>Política de Entrega</span>
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-center flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "privacy"
                  ? "bg-white text-[#121521] font-extrabold border-2 border-[#F26513]"
                  : "text-[#33394D] hover:bg-white/70 border-2 border-transparent"
              }`}
            >
              <span>Privacidade (LGPD)</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            {activeTab === "abnt" && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="border-b border-[#FFE1CC] pb-3">
                  <h3 className="text-lg font-extrabold text-[#121521] tracking-tight">
                    Normas de Segurança e Armazenamento de GLP (ANP & ABNT)
                  </h3>
                  <p className="text-xs text-[#33394D] mt-0.5">
                    Regulamentação ANP · ABNT NBR 8473 (Regulador) · ABNT NBR 8613 (Mangueira) · NBR 15514
                  </p>
                </div>

                <div className="bg-[#FFF5EE] border border-[#FFE1CC] rounded-xl p-4 text-xs leading-relaxed text-[#33394D]">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-[#F26513] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm mb-1 text-[#121521] font-extrabold">
                        Compromisso com a Segurança em Lages
                      </strong>
                      A <strong>{APP_DETAILS.name}</strong> (CNPJ {APP_DETAILS.cnpj}) segue rigorosamente as normas da Agência Nacional do Petróleo (ANP) e do Corpo de Bombeiros para armazenamento, transporte e manuseio de recipientes transportáveis de Gás Liquefeito de Petróleo (GLP).
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#121521] flex items-center gap-2 border-b border-[#FFE1CC] pb-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#F26513]" />
                      1. Lacre de Segurança e Peso Correto
                    </h4>
                    <p className="text-xs text-[#33394D] leading-relaxed">
                      Todos os botijões P13 e cilindros P45 são entregues com lacre inviolável sobre a válvula e passaram por requalificação periódica dentro das normas vigentes, assegurando o peso líquido exato.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#121521] flex items-center gap-2 border-b border-[#FFE1CC] pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0095D1]" />
                      2. Prazo de Validade dos Acessórios
                    </h4>
                    <p className="text-xs text-[#33394D] leading-relaxed">
                      O regulador de pressão (NBR 8473) e a mangueira transparente com tarja amarela (NBR 8613) possuem validade padrão de 5 anos. Nossa equipe auxilia na verificação visual na entrega.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "terms" && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="border-b border-[#FFE1CC] pb-3">
                  <h3 className="text-lg font-extrabold text-[#121521] tracking-tight">
                    Política de Atendimento e Entrega Disk Gás
                  </h3>
                  <p className="text-xs text-[#33394D] mt-0.5">
                    {APP_DETAILS.address} · {APP_DETAILS.cep}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#33394D] leading-relaxed">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[#121521] flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-[#F26513]" />
                      1. Área de Cobertura e Horários
                    </h4>
                    <p>
                      Realizamos tele-entrega no Bairro Santa Helena e em toda a cidade de Lages/SC. Nosso horário regular de funcionamento é de <strong>{APP_DETAILS.hoursWeekdays}</strong> e <strong>{APP_DETAILS.hoursSunday}</strong>.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[#121521] text-sm">
                      2. Troca de Vasilhame e Pagamento
                    </h4>
                    <p>
                      Para pedidos de recarga, o cliente entrega o vasilhame vazio equivalente em condições normais de uso. Caso não possua o casco, consulte a disponibilidade do vasilhame completo pelo WhatsApp <strong>{APP_DETAILS.phoneWhatsapp}</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="border-b border-[#FFE1CC] pb-3">
                  <h3 className="text-lg font-extrabold text-[#121521] tracking-tight">
                    Declaração de Privacidade e Proteção de Dados (LGPD)
                  </h3>
                  <p className="text-xs text-[#33394D] mt-0.5">
                    Conformidade com a Lei Federal nº 13.709/2018
                  </p>
                </div>

                <div className="bg-[#FFF5EE] border border-[#FFE1CC] rounded-xl p-6 space-y-4 text-xs text-[#33394D] leading-relaxed">
                  <p>
                    A <strong>{APP_DETAILS.name}</strong> utiliza os dados preenchidos no formulário (nome, telefone e endereço em Lages/SC) exclusivamente para agilizar o seu pedido via WhatsApp e realizar a entrega do gás no local solicitado.
                  </p>
                  <p>
                    Nenhuma informação inserida neste site é armazenada em servidores externos de terceiros ou compartilhada para fins publicitários. Ao clicar em enviar, a mensagem é formatada localmente e direcionada diretamente para o seu aplicativo WhatsApp.
                  </p>
                  <p className="pt-1 text-[#121521] font-semibold">
                    Canais oficiais: WhatsApp {APP_DETAILS.phoneWhatsapp} · Telefone {APP_DETAILS.phoneFixed}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-[#FFF9F5] border-t border-[#FFE1CC] px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#33394D] gap-2">
            <span>GÁS DA 7 · CNPJ {APP_DETAILS.cnpj}</span>
            <span className="text-[#121521] font-bold">{APP_DETAILS.address}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  declare readonly props: Readonly<ErrorBoundaryProps>;
  public state: ErrorBoundaryState = { hasError: false, message: "" };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Ocorreu um erro inesperado.",
    };
  }

  componentDidCatch(error: Error) {
    console.error("Application ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121521] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white text-[#121521] rounded-2xl p-7 border-2 border-[#00B8F4] space-y-5 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF5EE] text-[#F26513] flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold">Algo deu errado</h2>
              <p className="text-sm text-[#33394D]">
                Não foi possível concluir a operação agora. Tente recarregar a página.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:border-[#121521] px-5 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recarregar Página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

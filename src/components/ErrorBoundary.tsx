import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Algo deu errado</h2>
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro inesperado na aplicação. Por favor, tente recarregar.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg text-left overflow-auto max-h-32">
                  <code className="text-[10px] text-destructive break-all">
                    {this.state.error.message}
                  </code>
                </div>
              )}
            </div>
            <Button 
              onClick={this.handleReset}
              className="w-full gradient-primary text-foreground font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Sistema
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

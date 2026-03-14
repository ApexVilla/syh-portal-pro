import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      const err = error as Error;
      toast.error('Erro ao entrar: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-card p-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden shadow-xl mb-4">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">SYH Portal</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Business Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-foreground font-semibold h-11 relative overflow-hidden" disabled={loading}>
              <div 
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-inherit transition-all duration-200",
                  loading ? "opacity-100 visible" : "opacity-0 invisible"
                )}
              >
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <span className={loading ? "opacity-0" : "opacity-100"}>Entrar</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

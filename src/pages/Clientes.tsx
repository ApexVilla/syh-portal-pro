import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Clientes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('clientes').select('*');
    if (search) {
      query = query.or(`nom_cliente.ilike.%${search}%,rif_cliente.ilike.%${search}%,cod_cliente.ilike.%${search}%`);
    }
    query = query.order('nom_cliente');
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search]);

  const openDetail = async (cliente: any) => {
    setSelected(cliente);
    setHistLoading(true);
    const { data: vendas } = await supabase.from('vendas')
      .select('*')
      .eq('cod_cliente', cliente.cod_cliente)
      .order('fecha_doc', { ascending: false })
      .limit(20);
    setHistorico(vendas || []);
    setHistLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, RIF ou código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="glass-card p-5">
        {loading ? <DataTableSkeleton cols={6} rows={8} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">RIF</th>
                  <th className="pb-2 font-medium">Telefone</th>
                  <th className="pb-2 font-medium">Saldo Atual</th>
                  <th className="pb-2 font-medium">Limite</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr
                    key={c.cod_cliente}
                    className="border-b border-border/30 cursor-pointer"
                    onClick={() => openDetail(c)}
                  >
                    <td className="py-2 text-foreground font-medium">{c.nom_cliente}</td>
                    <td className="py-2 text-muted-foreground font-mono text-xs">{c.rif_cliente}</td>
                    <td className="py-2 text-muted-foreground">{c.telefono || '-'}</td>
                    <td className="py-2 text-foreground">{formatCurrency(c.saldo_actual)}</td>
                    <td className="py-2 text-muted-foreground">{formatCurrency(c.limite_credito)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'activo' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selected?.nom_cliente}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Código:</span> <span className="text-foreground ml-1">{selected.cod_cliente}</span></div>
                <div><span className="text-muted-foreground">RIF:</span> <span className="text-foreground ml-1">{selected.rif_cliente}</span></div>
                <div><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground ml-1">{selected.telefono || '-'}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-1">{selected.email || '-'}</span></div>
                <div><span className="text-muted-foreground">Saldo:</span> <span className="text-foreground ml-1">{formatCurrency(selected.saldo_actual)}</span></div>
                <div><span className="text-muted-foreground">Limite:</span> <span className="text-foreground ml-1">{formatCurrency(selected.limite_credito)}</span></div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Histórico de Compras</h4>
                {histLoading ? <DataTableSkeleton cols={4} rows={3} /> : (
                  <table className="w-full text-sm table-zebra">
                    <thead>
                      <tr className="text-muted-foreground text-left border-b border-border">
                        <th className="pb-2 font-medium">Nº Doc</th>
                        <th className="pb-2 font-medium">Data</th>
                        <th className="pb-2 font-medium">Total</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map(v => (
                        <tr key={v.num_doc} className="border-b border-border/30">
                          <td className="py-1.5 text-foreground font-mono text-xs">{v.num_doc}</td>
                          <td className="py-1.5 text-foreground">{formatDate(v.fecha_doc)}</td>
                          <td className="py-1.5 text-foreground">{formatCurrency(v.total_doc)}</td>
                          <td className="py-1.5 text-muted-foreground">{v.status_doc || '-'}</td>
                        </tr>
                      ))}
                      {historico.length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Sem compras registradas</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

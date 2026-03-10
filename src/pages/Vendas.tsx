import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PAGE_SIZE = 20;

export default function Vendas() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('vendas').select('*', { count: 'exact' });
    if (dateFrom) query = query.gte('fecha_doc', dateFrom);
    if (dateTo) query = query.lte('fecha_doc', dateTo + 'T23:59:59');
    if (search) query = query.ilike('nom_cliente', `%${search}%`);
    query = query.order('fecha_doc', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    const { data: rows, count } = await query;
    setData(rows || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, dateFrom, dateTo, search]);

  const totalGeral = data.reduce((s, v) => s + (v.total_doc || 0), 0);
  const chartData = (() => {
    const map = new Map<string, number>();
    data.forEach(v => {
      const d = v.fecha_doc?.split('T')[0] || '';
      map.set(d, (map.get(d) || 0) + (v.total_doc || 0));
    });
    return Array.from(map.entries()).map(([d, t]) => ({ dia: d.slice(5), total: t }));
  })();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(data, 'vendas')} className="border-border text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} className="bg-accent/50 border-border/50 text-foreground sm:w-44" />
        <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} className="bg-accent/50 border-border/50 text-foreground sm:w-44" />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolução de Vendas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="dia" stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="total" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="glass-card p-5">
        {loading ? <DataTableSkeleton cols={6} rows={8} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="pb-2 font-medium">Nº Doc</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(v => (
                  <tr key={v.num_doc} className="border-b border-border/30">
                    <td className="py-2 text-foreground font-mono text-xs">{v.num_doc}</td>
                    <td className="py-2 text-foreground">{formatDate(v.fecha_doc)}</td>
                    <td className="py-2 text-foreground">{v.nom_cliente}</td>
                    <td className="py-2 text-foreground">{formatCurrency(v.total_doc)}</td>
                    <td className="py-2 text-muted-foreground">{v.tipo_doc || '-'}</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{v.status_doc || '-'}</span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma venda encontrada</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={3} className="py-3 text-foreground font-semibold">Total</td>
                  <td className="py-3 text-foreground font-semibold">{formatCurrency(totalGeral)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>Página {page + 1} de {totalPages} ({total} registros)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-border text-muted-foreground">Anterior</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-border text-muted-foreground">Próxima</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

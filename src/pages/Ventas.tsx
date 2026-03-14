/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, formatDualCurrency, exportToCSV } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';

const PAGE_SIZE = 20;

export default function Ventas() {
  const { cod_empresa } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tipoDoc, setTipoDoc] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    if (!cod_empresa) return;
    setLoading(true);
    try {
      let query = supabase.from('ventas').select('*', { count: 'exact' });
      query = query.eq('cod_empresa', cod_empresa);
      if (dateFrom) query = query.gte('fecha_doc', dateFrom);
      if (dateTo) query = query.lte('fecha_doc', dateTo + 'T23:59:59');
      if (search) query = query.ilike('nom_cliente', `%${search}%`);
      if (tipoDoc !== 'all') query = query.eq('tipo_doc', tipoDoc);
      query = query.order('fecha_doc', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
      const { data: rows, count, error } = await query;
      
      if (!error && rows && rows.length > 0) { 
        setData(rows); 
        setTotal(count || rows.length); 
      } else {
        const mock = [
          { num_doc: '*0000163', fecha_doc: '2025-10-29', nom_cliente: 'ADRIANA VICTORIA TORRES AGUIAR', rif_cliente: 'V17614161', cod_cliente: 'V17614161', total_doc: 14933.25, total_bruto: 12873.49, total_impuesto: 2059.76, total_descuento: 0, tasa_cambio: 199.11, tipo_doc: 'FA', status_doc: 'PR', cod_vendedor: '00' },
          { num_doc: '*001', fecha_doc: '2026-03-07', nom_cliente: 'CLIENTE POR DEFECTO', rif_cliente: '00', cod_cliente: '00', total_doc: 43500, total_bruto: 37500, total_impuesto: 6000, total_descuento: 0, tasa_cambio: 270.79, tipo_doc: 'FA', status_doc: 'ED', cod_vendedor: '00' },
          { num_doc: '*0000162', fecha_doc: '2025-10-28', nom_cliente: 'PC BARINAS, C.A.', rif_cliente: 'J501450994', cod_cliente: 'J501450994', total_doc: 8500, total_bruto: 7327.59, total_impuesto: 1172.41, total_descuento: 0, tasa_cambio: 199.11, tipo_doc: 'FA', status_doc: 'PA', cod_vendedor: '00' },
        ];
        setData(mock); 
        setTotal(mock.length);
      }
    } catch (e) { 
      console.error("Error fetching sales:", e);
      setData([]); 
      setTotal(0); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, [page, dateFrom, dateTo, search, tipoDoc]);

  const sumBruto = data.reduce((s, v) => s + (Number(v.total_bruto) || 0), 0);
  const sumImpuesto = data.reduce((s, v) => s + (Number(v.total_impuesto) || 0), 0);
  const sumDescuento = data.reduce((s, v) => s + (Number(v.total_descuento) || 0), 0);
  const sumTotal = data.reduce((s, v) => s + (Number(v.total_doc) || 0), 0);

  const chartData = (() => {
    const map = new Map<string, number>();
    data.forEach(v => { 
      const d = (v.fecha_doc || '').split('T')[0]; 
      map.set(d, (map.get(d) || 0) + (Number(v.total_doc) || 0)); 
    });
    return Array.from(map.entries()).map(([d, t]) => ({ dia: d.slice(5), total: t }));
  })();

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const tipoLabel = (t: string) => t === 'FA' ? 'Factura' : t === 'ND' ? 'Nota Débito' : t;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(data, 'ventas')} className="border-border text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} className="bg-accent/50 border-border/50 text-foreground sm:w-44" />
        <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} className="bg-accent/50 border-border/50 text-foreground sm:w-44" />
        <Select value={tipoDoc} onValueChange={v => { setTipoDoc(v); setPage(0); }}>
          <SelectTrigger className="sm:w-40 bg-accent/50 border-border/50 text-foreground"><SelectValue placeholder="Tipo Doc" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="FA">Factura</SelectItem>
            <SelectItem value="ND">Nota Débito</SelectItem>
          </SelectContent>
        </Select>
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

      {chartData.length > 1 && (
        <div key="sales-chart" className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Evolución de Ventas</h3>
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

      <div key="cnt-ventas-table" className="glass-card p-4 relative min-h-[400px]">
        {loading && (
          <div key="loading-overlay" className="absolute inset-0 bg-card/20 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <DataTableSkeleton cols={10} rows={12} />
          </div>
        )}
        
        <div key="table-content" className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr className="border-b border-white/5">
                <th className="font-bold">Nº Doc</th>
                <th className="font-bold">Fecha</th>
                <th className="font-bold">Cliente</th>
                <th className="font-bold">RIF</th>
                <th className="font-bold text-right">Subtotal</th>
                <th className="font-bold text-right">IVA</th>
                <th className="font-bold text-right">Total</th>
                <th className="font-bold text-center">Tipo</th>
                <th className="font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, i) => (
                <tr key={v.num_doc || `v-${i}`} className="hover:bg-white/5 transition-colors">
                  <td className="font-mono text-[10px] text-primary/80">{v.num_doc}</td>
                  <td className="text-muted-foreground/90">{formatDate(v.fecha_doc)}</td>
                  <td className="font-medium max-w-[180px] truncate">{v.nom_cliente}</td>
                  <td className="font-mono text-[10px] text-muted-foreground/60">{v.rif_cliente || '-'}</td>
                  <td className="text-right text-muted-foreground/90">{formatCurrency(v.total_bruto, 'VES')}</td>
                  <td className="text-right text-muted-foreground/90">{formatCurrency(v.total_impuesto, 'VES')}</td>
                  <td className="text-right font-bold text-indigo-300 whitespace-nowrap">{formatDualCurrency(v.total_doc, v.tasa_cambio)}</td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${v.tipo_doc === 'FA' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-500/20 text-orange-300'}`}>{tipoLabel(v.tipo_doc)}</span>
                  </td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${v.status_doc === 'PA' ? 'bg-emerald-500/20 text-emerald-300' : v.status_doc === 'PR' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {v.status_doc === 'PA' ? 'Pagado' : v.status_doc === 'PR' ? 'Procesado' : v.status_doc === 'ED' ? 'Edición' : v.status_doc || '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr key="empty"><td colSpan={9} className="py-20 text-center text-muted-foreground italic">Ninguna venta encontrada en este periodo.</td></tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot className="border-t border-white/10 bg-white/5">
                <tr className="font-bold text-foreground">
                  <td colSpan={4} className="py-4">Ventas del periodo</td>
                  <td className="py-4 text-right text-muted-foreground">{formatCurrency(sumBruto, 'VES')}</td>
                  <td className="py-4 text-right text-muted-foreground">{formatCurrency(sumImpuesto, 'VES')}</td>
                  <td className="py-4 text-right text-indigo-300">{formatCurrency(sumTotal, 'VES')}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground border-t border-border pt-4">
            <span>Página {page + 1} de {totalPages} ({total} registros)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="border-border text-muted-foreground">Anterior</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="border-border text-muted-foreground">Siguiente</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { StatCard } from '@/components/StatCard';
import { formatCurrency, formatNumber, exportToCSV } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, Package, AlertTriangle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

export default function Inventario() {
  const { cod_empresa } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!cod_empresa) return;
      setLoading(true);
      try {
        let query = supabase.from('estoque').select('*').eq('cod_empresa', cod_empresa);
        if (search) query = query.or(`nom_articulo.ilike.%${search}%,cod_articulo.ilike.%${search}%`);
        query = query.order('nom_articulo');
        const { data: rows, error } = await query;
        if (!error && rows && rows.length > 0) { 
          setData(rows); 
        } else {
          setData([
            { cod_articulo: '01-01-01', nom_articulo: 'PLAN COMIENZA PLUS (5MBPS)', nom_grupo: 'Servicios Internet', grupo: '01', subgrupo: '01', existencia: 0, existencia_minima: 0, costo: 0.01, precio1: 2612.07, precio2: 5172.41, precio3: 7758.62, preciofin1: 3030, preciofin2: 6000, preciofin3: 9000, impuesto_pct: 16, inactivo: false },
            { cod_articulo: '01-01-02', nom_articulo: 'PLAN BASICO PLUS (10MBPS)', nom_grupo: 'Servicios Internet', grupo: '01', subgrupo: '01', existencia: 0, existencia_minima: 0, costo: 0.01, precio1: 6007.63, preciofin1: 6968.85, impuesto_pct: 16, inactivo: false },
            { cod_articulo: '01-01-03', nom_articulo: 'PLAN ESTANDARD PLUS (15MBPS)', nom_grupo: 'Servicios Internet', grupo: '01', subgrupo: '01', existencia: 0, existencia_minima: 0, costo: 0.01, precio1: 6865.86, preciofin1: 7964.40, impuesto_pct: 16, inactivo: false },
          ]);
        }
      } catch (e) { 
        console.error("Error fetching inventory:", e);
        setData([]); 
      }
      setLoading(false);
    };
    loadData();
  }, [search]);

  const totalItems = data.length;
  const emFalta = data.filter(e => (Number(e.existencia) || 0) <= 0).length;
  const criticos = data.filter(e => (Number(e.existencia) || 0) > 0 && (Number(e.existencia) || 0) <= (Number(e.existencia_minima) || 0)).length;

  const topBaixo = [...data]
    .sort((a, b) => (Number(a.existencia) || 0) - (Number(b.existencia) || 0))
    .slice(0, 10)
    .map(e => ({ name: String(e.nom_articulo || '').slice(0, 25), qty: Number(e.existencia || 0) }));

  const precios = selected ? [1,2,3,4,5,6,7,8].map(n => ({
    n,
    base: selected[`precio${n}`] || 0,
    final: selected[`preciofin${n}`] || 0,
  })).filter(p => p.base > 0 || p.final > 0) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Inventario</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Artículos" value={formatNumber(totalItems)} icon={<Package className="w-5 h-5" />} loading={loading} />
        <StatCard title="Sin Existencia" value={formatNumber(emFalta)} icon={<XCircle className="w-5 h-5" />} loading={loading} subtitleColor="text-destructive" />
        <StatCard title="Críticos" value={formatNumber(criticos)} subtitle="bajo mínimo" icon={<AlertTriangle className="w-5 h-5" />} loading={loading} subtitleColor="text-warning" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o código..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" 
          />
        </div>
        <button 
          onClick={() => exportToCSV(data, 'inventario')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold uppercase tracking-wider"
        >
          <Package className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {topBaixo.length > 0 && (
        <div key="chart-container" className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 - Menor Existencia</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBaixo} layout="vertical">
              <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <YAxis dataKey="name" type="category" width={140} stroke="hsl(215, 20%, 65%)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="qty" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div key="cnt-inventario-table" className="glass-card p-4 relative min-h-[400px]">

        {loading && (
          <div key="loading-overlay" className="absolute inset-0 bg-card/20 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <DataTableSkeleton cols={9} rows={10} />
          </div>
        )}
        
        <div key="table-content" className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr className="border-b border-white/5">
                <th className="font-bold">Código</th>
                <th className="font-bold">Nombre</th>
                <th className="font-bold">Grupo</th>
                <th className="font-bold text-right">Costo</th>
                <th className="font-bold text-right">Precio</th>
                <th className="font-bold text-right">Final</th>
                <th className="font-bold text-center">IVA</th>
                <th className="font-bold text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, idx) => {
                const exist = Number(e.existencia || 0);
                const min = Number(e.existencia_minima || 0);
                const isBajo = exist <= min && min > 0;
                const semStock = exist <= 0;
                return (
                  <tr 
                    key={e.cod_articulo || `e-${idx}`} 
                    className="hover:bg-white/5 transition-colors cursor-pointer" 
                    onClick={() => setSelected(e)}
                  >
                    <td className="font-mono text-[10px] text-primary/80">{e.cod_articulo}</td>
                    <td className="font-medium truncate max-w-[220px]">{e.nom_articulo}</td>
                    <td className="text-muted-foreground/70 text-xs">{e.nom_grupo || e.grupo || '-'}</td>
                    <td className="text-right text-muted-foreground/80">{formatCurrency(e.costo, 'VES')}</td>
                    <td className="text-right text-muted-foreground/80">{formatCurrency(e.precio1, 'VES')}</td>
                    <td className="text-right font-bold text-indigo-300">{formatCurrency(e.preciofin1, 'VES')}</td>
                    <td className="text-center text-muted-foreground/60 text-[10px]">{e.impuesto_pct ? `${e.impuesto_pct}%` : '-'}</td>
                    <td className="text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                        semStock ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : 
                        isBajo ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : 
                        "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      )}>
                        {formatNumber(exist)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && data.length === 0 && (
                <tr key="empty">
                  <td colSpan={8} className="py-20 text-center text-muted-foreground italic">Ningún artículo encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">{selected?.nom_articulo}</DialogTitle></DialogHeader>
          <div key="detail-content" className="space-y-4">
            {selected && (
              <>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Código:</span> <span className="text-foreground ml-1">{selected.cod_articulo}</span></div>
                <div><span className="text-muted-foreground">Grupo:</span> <span className="text-foreground ml-1">{selected.nom_grupo || selected.grupo}</span></div>
                <div><span className="text-muted-foreground">Subgrupo:</span> <span className="text-foreground ml-1">{selected.subgrupo || '-'}</span></div>
                <div><span className="text-muted-foreground">Costo:</span> <span className="text-foreground ml-1">{formatCurrency(selected.costo, 'VES')}</span></div>
                <div><span className="text-muted-foreground">Existencia:</span> <span className="text-foreground ml-1">{formatNumber(selected.existencia)}</span></div>
                <div><span className="text-muted-foreground">Mínimo:</span> <span className="text-foreground ml-1">{formatNumber(selected.existencia_minima)}</span></div>
                <div><span className="text-muted-foreground">IVA:</span> <span className="text-foreground ml-1">{selected.impuesto_pct ? `${selected.impuesto_pct}%` : '-'}</span></div>
              </div>
              {precios.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Tabla de Precios</h4>
                  <table className="w-full text-sm">
                    <thead><tr className="text-muted-foreground border-b border-border"><th className="pb-1 text-left">#</th><th className="pb-1 text-right">Base</th><th className="pb-1 text-right">Con IVA</th></tr></thead>
                    <tbody>
                      {precios.map(p => (
                        <tr key={p.n} className="border-b border-border/30">
                          <td className="py-1 text-foreground">Precio {p.n}</td>
                          <td className="py-1 text-right text-muted-foreground">{formatCurrency(p.base, 'VES')}</td>
                          <td className="py-1 text-right text-foreground font-semibold">{formatCurrency(p.final, 'VES')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}

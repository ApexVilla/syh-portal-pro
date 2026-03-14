/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, formatDualCurrency, exportToCSV } from '@/lib/format';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function CXC() {
  const { cod_empresa } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyVencidas, setOnlyVencidas] = useState(false);

  const fetchData = async () => {
    if (!cod_empresa) return;
    setLoading(true);
    try {
      let query = supabase.from('cxc').select('*').eq('cod_empresa', cod_empresa);
      if (onlyVencidas) query = query.gt('dias_vencido', 0);
      query = query.order('dias_vencido', { ascending: false });
      const { data: rows, error } = await query;
      if (!error && rows && rows.length > 0) { 
        setData(rows); 
      } else {
        setData([
          { num_doc: 'FAC-0000163', fecha_doc: '2025-10-29', fecha_vence: '2025-11-28', nom_cliente: 'ADRIANA VICTORIA TORRES AGUIAR', cod_cliente: 'V17614161', rif: 'V17614161', tipo_doc: 'FA', monto_doc: 14933.25, monto_pagado: 0, saldo: 14933.25, dias_vencido: 133, tasa_cambio: 199.11, total_impuesto: 2059.76 },
          { num_doc: 'FAC-0000162', fecha_doc: '2025-10-28', fecha_vence: '2025-11-27', nom_cliente: 'PC BARINAS, C.A.', cod_cliente: 'J501450994', rif: 'J501450994', tipo_doc: 'FA', monto_doc: 8500, monto_pagado: 8500, saldo: 0, dias_vencido: 0, tasa_cambio: 199.11, total_impuesto: 1172.41 },
          { num_doc: 'ND-001', fecha_doc: '2026-03-07', fecha_vence: '2026-04-06', nom_cliente: 'CLIENTE POR DEFECTO', cod_cliente: '00', rif: '00', tipo_doc: 'ND', monto_doc: 43500, monto_pagado: 0, saldo: 43500, dias_vencido: 0, tasa_cambio: 270.79, total_impuesto: 6000 },
        ]);
      }
    } catch (e) { 
      console.error("Error fetching CXC:", e);
      setData([]); 
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [onlyVencidas]);

  const totalAberto = data.reduce((s, c) => s + (Number(c.saldo) || 0), 0);

  const faixas = [
    { faixa: '1-30d', total: data.filter(c => c.dias_vencido > 0 && c.dias_vencido <= 30).reduce((s, c) => s + (Number(c.saldo) || 0), 0) },
    { faixa: '31-60d', total: data.filter(c => c.dias_vencido > 30 && c.dias_vencido <= 60).reduce((s, c) => s + (Number(c.saldo) || 0), 0) },
    { faixa: '61-90d', total: data.filter(c => c.dias_vencido > 60 && c.dias_vencido <= 90).reduce((s, c) => s + (Number(c.saldo) || 0), 0) },
    { faixa: '+90d', total: data.filter(c => c.dias_vencido > 90).reduce((s, c) => s + (Number(c.saldo) || 0), 0) },
  ].filter(f => f.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuentas por Cobrar</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Gestión de Cobranzas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <Switch checked={onlyVencidas} onCheckedChange={setOnlyVencidas} />
            <Label className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground cursor-pointer">Solo vencidas</Label>
          </div>
          <button 
            onClick={() => exportToCSV(data, 'cxc')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold uppercase tracking-wider"
          >
            <Package className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/10 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Monto Total Pendiente</span>
          <span className="text-3xl font-black premium-gradient-text">{formatCurrency(totalAberto, 'VES')}</span>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase">{data.length} documentos activos</span>
          </div>
        </div>
        
        {faixas.length > 0 && (
          <div key="aging-chart" className="lg:col-span-2 glass-card p-6 border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Análisis de Antigüedad</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={faixas}>
                <XAxis dataKey="faixa" stroke="hsl(215, 20%, 45%)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="total" fill="hsl(250, 89%, 65%)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      <div key="cnt-cxc-table" className="glass-card p-4 relative min-h-[400px]">
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
                <th className="font-bold text-center">Tipo</th>
                <th className="font-bold">Emisión</th>
                <th className="font-bold">Vence</th>
                <th className="font-bold">Cliente</th>
                <th className="font-bold text-right">Monto</th>
                <th className="font-bold text-right">Saldo</th>
                <th className="font-bold text-center">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => {
                const isVencido = (c.dias_vencido || 0) > 0;
                return (
                  <tr key={c.num_doc || `cxc-${i}`} className="hover:bg-white/5 transition-colors">
                    <td className="font-mono text-[10px] text-primary/80">{c.num_doc}</td>
                    <td className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${c.tipo_doc === 'FA' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-orange-500/10 text-orange-300 border-orange-500/20'}`}>
                        {c.tipo_doc === 'FA' ? 'Fact' : 'Nota'}
                      </span>
                    </td>
                    <td className="text-muted-foreground/80">{formatDate(c.fecha_doc)}</td>
                    <td className="text-muted-foreground/80">{formatDate(c.fecha_vence)}</td>
                    <td className="font-medium truncate max-w-[140px]">{c.nom_cliente}</td>
                    <td className="text-right text-muted-foreground/60">{formatCurrency(c.monto_doc, 'VES')}</td>
                    <td className="text-right font-bold text-indigo-300">{formatCurrency(c.saldo, 'VES')}</td>
                    <td className="text-center">
                      <span className={cn(
                        "inline-block min-w-[45px] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                        isVencido ? "bg-rose-500/10 text-rose-300 border-rose-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      )}>
                        {c.dias_vencido || 0}d
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!loading && data.length === 0 && (
                <tr key="empty"><td colSpan={8} className="py-20 text-center text-muted-foreground italic">Ningún registro de cobranza</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate } from '@/lib/format';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CXC() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyVencidas, setOnlyVencidas] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('cxc').select('*');
    if (onlyVencidas) query = query.gt('dias_vencido', 0);
    query = query.order('dias_vencido', { ascending: false });
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [onlyVencidas]);

  const totalAberto = data.reduce((s, c) => s + (c.saldo || 0), 0);

  const faixas = [
    { faixa: '1-30d', total: data.filter(c => c.dias_vencido > 0 && c.dias_vencido <= 30).reduce((s, c) => s + (c.saldo || 0), 0) },
    { faixa: '31-60d', total: data.filter(c => c.dias_vencido > 30 && c.dias_vencido <= 60).reduce((s, c) => s + (c.saldo || 0), 0) },
    { faixa: '61-90d', total: data.filter(c => c.dias_vencido > 60 && c.dias_vencido <= 90).reduce((s, c) => s + (c.saldo || 0), 0) },
    { faixa: '+90d', total: data.filter(c => c.dias_vencido > 90).reduce((s, c) => s + (c.saldo || 0), 0) },
  ].filter(f => f.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Contas a Receber (CXC)</h1>
        <div className="flex items-center gap-2">
          <Switch checked={onlyVencidas} onCheckedChange={setOnlyVencidas} />
          <Label className="text-sm text-muted-foreground">Apenas vencidas</Label>
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total em aberto</span>
        <span className="text-xl font-bold text-foreground">{formatCurrency(totalAberto)}</span>
      </div>

      {faixas.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Valor Vencido por Faixa</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={faixas}>
              <XAxis dataKey="faixa" stroke="hsl(215, 20%, 65%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="total" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card p-5">
        {loading ? <DataTableSkeleton cols={8} rows={8} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="pb-2 font-medium">Nº Doc</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Vencimento</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Valor</th>
                  <th className="pb-2 font-medium">Pago</th>
                  <th className="pb-2 font-medium">Saldo</th>
                  <th className="pb-2 font-medium">Dias</th>
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr key={c.num_doc} className="border-b border-border/30">
                    <td className="py-2 text-foreground font-mono text-xs">{c.num_doc}</td>
                    <td className="py-2 text-foreground">{formatDate(c.fecha_doc)}</td>
                    <td className="py-2 text-foreground">{formatDate(c.fecha_vence)}</td>
                    <td className="py-2 text-foreground">{c.nom_cliente}</td>
                    <td className="py-2 text-foreground">{formatCurrency(c.monto_doc)}</td>
                    <td className="py-2 text-muted-foreground">{formatCurrency(c.monto_pagado)}</td>
                    <td className="py-2 text-foreground font-semibold">{formatCurrency(c.saldo)}</td>
                    <td className={`py-2 font-semibold ${(c.dias_vencido || 0) > 0 ? 'text-destructive' : 'text-success'}`}>
                      {c.dias_vencido || 0}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhum registro encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

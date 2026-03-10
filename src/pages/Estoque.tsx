import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { StatCard } from '@/components/StatCard';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Search, Package, AlertTriangle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Estoque() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [grupo, setGrupo] = useState('all');
  const [grupos, setGrupos] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('estoque').select('*');
    if (search) query = query.or(`nom_articulo.ilike.%${search}%,cod_articulo.ilike.%${search}%`);
    if (grupo !== 'all') query = query.eq('nom_grupo', grupo);
    query = query.order('nom_articulo');
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.from('estoque').select('nom_grupo').then(({ data }) => {
      const unique = [...new Set((data || []).map(d => d.nom_grupo).filter(Boolean))] as string[];
      setGrupos(unique.sort());
    });
  }, []);

  useEffect(() => { fetchData(); }, [search, grupo]);

  const totalItems = data.length;
  const emFalta = data.filter(e => (e.existencia || 0) === 0).length;
  const criticos = data.filter(e => (e.existencia || 0) > 0 && (e.existencia || 0) <= (e.existencia_minima || 0)).length;

  const topBaixo = [...data]
    .filter(e => (e.existencia || 0) >= 0)
    .sort((a, b) => (a.existencia || 0) - (b.existencia || 0))
    .slice(0, 10)
    .map(e => ({ name: (e.nom_articulo || '').slice(0, 20), qty: e.existencia || 0 }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Estoque</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total de Itens" value={formatNumber(totalItems)} icon={<Package className="w-5 h-5" />} loading={loading} />
        <StatCard title="Em Falta" value={formatNumber(emFalta)} icon={<XCircle className="w-5 h-5" />} loading={loading} subtitleColor="text-destructive" />
        <StatCard title="Críticos" value={formatNumber(criticos)} subtitle="abaixo do mínimo" icon={<AlertTriangle className="w-5 h-5" />} loading={loading} subtitleColor="text-warning" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={grupo} onValueChange={v => { setGrupo(v); }}>
          <SelectTrigger className="sm:w-48 bg-accent/50 border-border/50 text-foreground">
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Todos os grupos</SelectItem>
            {grupos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {topBaixo.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 - Menor Estoque</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBaixo} layout="vertical">
              <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <YAxis dataKey="name" type="category" width={120} stroke="hsl(215, 20%, 65%)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="qty" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card p-5">
        {loading ? <DataTableSkeleton cols={7} rows={8} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-zebra">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="pb-2 font-medium">Código</th>
                  <th className="pb-2 font-medium">Nome</th>
                  <th className="pb-2 font-medium">Grupo</th>
                  <th className="pb-2 font-medium">Existência</th>
                  <th className="pb-2 font-medium">Mínimo</th>
                  <th className="pb-2 font-medium">Preço 1</th>
                  <th className="pb-2 font-medium">Preço 2</th>
                </tr>
              </thead>
              <tbody>
                {data.map(e => {
                  const isBaixo = (e.existencia || 0) <= (e.existencia_minima || 0);
                  return (
                    <tr key={e.cod_articulo} className={`border-b border-border/30 ${isBaixo ? 'bg-destructive/10' : ''}`}>
                      <td className="py-2 text-foreground font-mono text-xs">{e.cod_articulo}</td>
                      <td className="py-2 text-foreground">{e.nom_articulo}</td>
                      <td className="py-2 text-muted-foreground">{e.nom_grupo || '-'}</td>
                      <td className={`py-2 font-semibold ${isBaixo ? 'text-destructive' : 'text-foreground'}`}>{formatNumber(e.existencia)}</td>
                      <td className="py-2 text-muted-foreground">{formatNumber(e.existencia_minima)}</td>
                      <td className="py-2 text-foreground">{formatCurrency(e.precio1)}</td>
                      <td className="py-2 text-muted-foreground">{formatCurrency(e.precio2)}</td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum item encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

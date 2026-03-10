import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/StatCard';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { ShoppingCart, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [vendasHoje, setVendasHoje] = useState({ total: 0, count: 0 });
  const [vendasMes, setVendasMes] = useState(0);
  const [cxcAberto, setCxcAberto] = useState({ total: 0, vencidas: 0 });
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [vendasDiarias, setVendasDiarias] = useState<any[]>([]);
  const [gruposEstoque, setGruposEstoque] = useState<any[]>([]);
  const [ultimasVendas, setUltimasVendas] = useState<any[]>([]);
  const [contasVencidas, setContasVencidas] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [vendasHojeRes, vendasMesRes, cxcRes, estoqueRes, vendasDiariasRes, gruposRes, ultimasRes, vencidasRes] = await Promise.all([
      supabase.from('vendas').select('total_doc').gte('fecha_doc', today),
      supabase.from('vendas').select('total_doc').gte('fecha_doc', monthStart),
      supabase.from('cxc').select('saldo, dias_vencido'),
      supabase.from('estoque').select('cod_articulo, existencia, existencia_minima'),
      supabase.from('vendas').select('fecha_doc, total_doc').gte('fecha_doc', thirtyDaysAgo).order('fecha_doc'),
      supabase.from('estoque').select('nom_grupo, existencia'),
      supabase.from('vendas').select('*').gte('fecha_doc', today).order('fecha_doc', { ascending: false }).limit(10),
      supabase.from('cxc').select('*').gt('dias_vencido', 0).order('dias_vencido', { ascending: false }).limit(5),
    ]);

    // Vendas hoje
    const hojeDocs = vendasHojeRes.data || [];
    setVendasHoje({ total: hojeDocs.reduce((s, v) => s + (v.total_doc || 0), 0), count: hojeDocs.length });

    // Vendas mês
    const mesDocs = vendasMesRes.data || [];
    setVendasMes(mesDocs.reduce((s, v) => s + (v.total_doc || 0), 0));

    // CXC
    const cxcDocs = cxcRes.data || [];
    setCxcAberto({
      total: cxcDocs.reduce((s, c) => s + (c.saldo || 0), 0),
      vencidas: cxcDocs.filter(c => (c.dias_vencido || 0) > 0).length,
    });

    // Estoque baixo
    const estDocs = estoqueRes.data || [];
    setEstoqueBaixo(estDocs.filter(e => (e.existencia || 0) <= (e.existencia_minima || 0)).length);

    // Vendas diárias (agrupar por dia)
    const dailyMap = new Map<string, number>();
    (vendasDiariasRes.data || []).forEach(v => {
      const day = v.fecha_doc?.split('T')[0] || '';
      dailyMap.set(day, (dailyMap.get(day) || 0) + (v.total_doc || 0));
    });
    setVendasDiarias(Array.from(dailyMap.entries()).map(([day, total]) => ({
      dia: day.slice(5),
      total,
    })));

    // Grupos estoque
    const grupoMap = new Map<string, number>();
    (gruposRes.data || []).forEach(e => {
      const g = e.nom_grupo || 'Outros';
      grupoMap.set(g, (grupoMap.get(g) || 0) + (e.existencia || 0));
    });
    const sorted = Array.from(grupoMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    setGruposEstoque(sorted.map(([name, value]) => ({ name, value })));

    setUltimasVendas(ultimasRes.data || []);
    setContasVencidas(vencidasRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => {
        fetchData();
        toast.info('Dados de vendas atualizados');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cxc' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vendas Hoje"
          value={formatCurrency(vendasHoje.total)}
          subtitle={`${vendasHoje.count} documentos`}
          icon={<ShoppingCart className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Vendas do Mês"
          value={formatCurrency(vendasMes)}
          icon={<DollarSign className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="CXC em Aberto"
          value={formatCurrency(cxcAberto.total)}
          subtitle={cxcAberto.vencidas > 0 ? `${cxcAberto.vencidas} vencidas` : 'Nenhuma vencida'}
          subtitleColor={cxcAberto.vencidas > 0 ? 'text-destructive' : undefined}
          icon={<AlertTriangle className="w-5 h-5" />}
          loading={loading}
        />
        <StatCard
          title="Estoque Baixo"
          value={formatNumber(estoqueBaixo)}
          subtitle="itens abaixo do mínimo"
          subtitleColor={estoqueBaixo > 0 ? 'text-warning' : undefined}
          icon={<Package className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Vendas - Últimos 30 dias</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={vendasDiarias}>
              <XAxis dataKey="dia" stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }}
              />
              <Bar dataKey="total" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Grupos de Estoque</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={gruposEstoque} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                {gruposEstoque.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(217, 33%, 17%)', border: '1px solid hsl(215, 28%, 25%)', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Últimas 10 Vendas</h3>
          {loading ? <DataTableSkeleton cols={4} rows={5} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-zebra">
                <thead>
                  <tr className="text-muted-foreground text-left border-b border-border">
                    <th className="pb-2 font-medium">Nº Doc</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVendas.map(v => (
                    <tr key={v.num_doc} className="border-b border-border/30">
                      <td className="py-2 text-foreground">{v.num_doc}</td>
                      <td className="py-2 text-foreground">{v.nom_cliente}</td>
                      <td className="py-2 text-foreground">{formatCurrency(v.total_doc)}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{v.status_doc || '-'}</span>
                      </td>
                    </tr>
                  ))}
                  {ultimasVendas.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Sem vendas hoje</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Contas Vencidas (CXC)</h3>
          {loading ? <DataTableSkeleton cols={4} rows={5} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-zebra">
                <thead>
                  <tr className="text-muted-foreground text-left border-b border-border">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Saldo</th>
                    <th className="pb-2 font-medium">Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {contasVencidas.map(c => (
                    <tr key={c.num_doc} className="border-b border-border/30">
                      <td className="py-2 text-foreground">{c.nom_cliente}</td>
                      <td className="py-2 text-foreground">{formatCurrency(c.saldo)}</td>
                      <td className="py-2 text-destructive font-semibold">{c.dias_vencido}d</td>
                    </tr>
                  ))}
                  {contasVencidas.length === 0 && (
                    <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Nenhuma conta vencida</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

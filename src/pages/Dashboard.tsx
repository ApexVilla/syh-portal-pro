/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/StatCard';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { ShoppingCart, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const CHART_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
];

export default function Dashboard() {
  const { cod_empresa } = useAuth();
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
    if (!cod_empresa) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [vendasHojeRes, vendasMesRes, cxcRes, estoqueRes, vendasDiariasRes, gruposRes, ultimasRes, vencidasRes] = await Promise.all([
      supabase.from('vendas').select('total_doc').eq('cod_empresa', cod_empresa).gte('fecha_doc', today),
      supabase.from('vendas').select('total_doc').eq('cod_empresa', cod_empresa).gte('fecha_doc', monthStart),
      supabase.from('cxc').select('saldo, dias_vencido').eq('cod_empresa', cod_empresa),
      supabase.from('estoque').select('cod_articulo, existencia, existencia_minima').eq('cod_empresa', cod_empresa),
      supabase.from('vendas').select('fecha_doc, total_doc').eq('cod_empresa', cod_empresa).gte('fecha_doc', thirtyDaysAgo).order('fecha_doc'),
      supabase.from('estoque').select('nom_grupo, existencia').eq('cod_empresa', cod_empresa),
      supabase.from('vendas').select('*').eq('cod_empresa', cod_empresa).gte('fecha_doc', today).order('fecha_doc', { ascending: false }).limit(10),
      supabase.from('cxc').select('*').eq('cod_empresa', cod_empresa).gt('dias_vencido', 0).order('dias_vencido', { ascending: false }).limit(5),
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
      total: (cxcDocs || []).reduce((s, c) => s + (Number(c?.saldo) || 0), 0),
      vencidas: (cxcDocs || []).filter(c => (Number(c?.dias_vencido) || 0) > 0).length,
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
    const sorted = Array.from(grupoMap.entries()).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 5);
    setGruposEstoque(sorted.map(([name, value]) => ({ name: String(name), value: Number(value || 0) })));

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Flujo de Ventas (30d)</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/40 animate-pulse" />
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Realtime</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vendasDiarias}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(250 89% 65%)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" stroke="hsl(215, 20%, 45%)" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(215, 20%, 45%)" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6 border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Distribución de Inventario</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={gruposEstoque} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={80} 
                paddingAngle={5}
                stroke="none"
              >
                {gruposEstoque.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(8px)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {gruposEstoque.map((g, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{g.name}</span>
                </div>
                <span>{formatNumber(g.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div key="cnt-dashboard-tables" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div key="box-vendas" className="glass-card p-0 overflow-hidden border-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Últimas Transacciones</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Ventas</span>
          </div>
          {loading ? <div className="p-6"><DataTableSkeleton cols={4} rows={5} /></div> : (
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Nº Doc</th>
                    <th>Cliente</th>
                    <th className="text-right">Total</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasVendas.map(v => (
                    <tr key={v.num_doc}>
                      <td className="font-mono text-[10px] text-primary/80">{v.num_doc}</td>
                      <td className="font-medium truncate max-w-[140px]">{v.nom_cliente}</td>
                      <td className="text-right font-bold text-indigo-300">{formatCurrency(v.total_doc)}</td>
                      <td className="text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{v.status_doc || 'PR'}</span>
                      </td>
                    </tr>
                  ))}
                  {ultimasVendas.length === 0 && (
                    <tr><td colSpan={4} className="py-12 text-center text-muted-foreground italic">Sin actividad reciente</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div key="box-cxc" className="glass-card p-0 overflow-hidden border-white/10">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Alertas de Cobranza</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">Crítico</span>
          </div>
          {loading ? <div className="p-6"><DataTableSkeleton cols={4} rows={5} /></div> : (
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th className="text-right">Saldo</th>
                    <th className="text-center">Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {contasVencidas.map(c => (
                    <tr key={c.num_doc}>
                      <td className="font-medium truncate max-w-[140px]">{c.nom_cliente}</td>
                      <td className="text-right font-bold text-rose-300">{formatCurrency(c.saldo)}</td>
                      <td className="text-center text-rose-400 font-bold whitespace-nowrap">
                        <span className="bg-rose-500/10 px-2 py-1 rounded inline-block min-w-[50px]">{c.dias_vencido}d</span>
                      </td>
                    </tr>
                  ))}
                  {contasVencidas.length === 0 && (
                    <tr><td colSpan={3} className="py-12 text-center text-muted-foreground italic">Todas las cuentas al día</td></tr>
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


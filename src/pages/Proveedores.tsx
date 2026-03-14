import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatDate, formatDateTime, exportToCSV } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Users, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

/**
 * Proveedores Page
 * Lists suppliers with multi-tenant company isolation.
 */
export default function Proveedores() {
  const { cod_empresa } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    if (!cod_empresa) return;
    setLoading(true);
    try {
      let query = supabase.from('proveedores').select('*', { count: 'exact' });
      // Isolation by Empresa
      query = query.eq('cod_empresa', cod_empresa);
      
      if (search) {
        query = query.or(`nom_proveedor.ilike.%${search}%,rif_proveedor.ilike.%${search}%,cod_proveedor.ilike.%${search}%`);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      query = query.order('nom_proveedor').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
      const { data: rows, count, error } = await query;
      
      if (!error && rows) {
        setData(rows);
        setTotal(count || rows.length);
      } else {
        // Mock data as fallback
        const mock = [
          { 
            cod_proveedor: 'J501450994', 
            nom_proveedor: 'PC BARINAS, C.A. (MOCK)', 
            rif_proveedor: 'J501450994', 
            direccion: 'AV 23 DE ENERO CCVEMECA NIVEL PB LOCAL 08', 
            email: 'rerojas@gmail.com', 
            telefono: '', 
            status: 'A', 
            sincronizado_em: new Date().toISOString() 
          },
        ];
        setData(mock);
        setTotal(mock.length);
      }
    } catch (e) {
      console.error("Error fetching proveedores:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cod_empresa, search, statusFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Directorio de Aliados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{total} total</span>
          </div>
          <button 
            onClick={() => exportToCSV(data, 'proveedores')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold uppercase tracking-wider"
          >
            <Package className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-foreground h-11 rounded-xl">
              <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border-white/10">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="A">Activos</SelectItem>
              <SelectItem value="I">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, RIF o código de proveedor..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(0); }} 
            className="pl-11 bg-white/5 border-white/10 text-foreground h-11 rounded-xl focus:ring-primary/20 transition-all" 
          />
        </div>
      </div>

      <div key="cnt-proveedores-table" className="glass-card p-4 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-card/20 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <DataTableSkeleton cols={5} rows={10} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr className="border-b border-white/5">
                <th className="font-bold">Código</th>
                <th className="font-bold">Razón Social</th>
                <th className="font-bold">RIF</th>
                <th className="font-bold">Teléfono</th>
                <th className="font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr 
                  key={p.cod_proveedor || i} 
                  className="hover:bg-white/5 transition-colors cursor-pointer" 
                  onClick={() => setSelected(p)}
                >
                  <td className="font-mono text-[10px] text-primary/70">{p.cod_proveedor}</td>
                  <td className="font-medium">{p.nom_proveedor}</td>
                  <td className="text-muted-foreground font-mono text-xs">{p.rif_proveedor}</td>
                  <td className="text-muted-foreground text-xs">{p.telefono || '-'}</td>
                  <td className="text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                      p.status === 'A' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    )}>
                      {p.status === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground italic">No se encontraron proveedores</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Página {page + 1} de {totalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={page === 0} 
                onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                className="rounded-lg hover:bg-white/10 text-xs font-bold"
              >
                Anterior
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={page >= totalPages - 1} 
                onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                className="rounded-lg hover:bg-white/10 text-xs font-bold"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="glass-card border-white/10 bg-[#0f172a]/95 text-foreground max-w-lg backdrop-blur-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold premium-gradient-text">{selected?.nom_proveedor}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Código</span>
                <span className="font-mono text-primary/80">{selected.cod_proveedor}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">RIF</span>
                <span className="font-mono">{selected.rif_proveedor}</span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Dirección</span>
                <span className="text-muted-foreground leading-relaxed">{selected.direccion || 'Sin dirección registrada'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Email</span>
                <span className="text-indigo-300 underline decoration-indigo-300/30 underline-offset-4">{selected.email || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Teléfono</span>
                <span className="text-muted-foreground">{selected.telefono || '-'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Estado Actual</span>
                <span className={cn(
                  "inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase border mt-1",
                  selected.status === 'A' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {selected.status === 'A' ? 'Operativo' : 'Inactivo'}
                </span>
              </div>
              <div className="col-span-2 pt-4 border-t border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Última Sincronización ERP</span>
                <span className="text-xs text-muted-foreground/60 italic">{formatDateTime(selected.sincronizado_em)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

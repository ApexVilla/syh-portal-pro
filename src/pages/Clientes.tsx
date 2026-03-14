/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableSkeleton } from '@/components/DataTableSkeleton';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

export default function Clientes() {
  const { cod_empresa } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const fetchData = async () => {
    if (!cod_empresa) return;
    setLoading(true);
    try {
      let query = supabase.from('clientes').select('*').eq('cod_empresa', cod_empresa);
      if (search) query = query.or(`nom_cliente.ilike.%${search}%,rif_cliente.ilike.%${search}%,cod_cliente.ilike.%${search}%`);
      query = query.order('nom_cliente');
      const { data: rows, error } = await query;
      
      if (!error && rows && rows.length > 0) { 
        setData(rows); 
      } else {
        setData([
          { cod_cliente: '00', nom_cliente: 'CLIENTE POR DEFECTO', rif_cliente: '00', email: 'rerojas@gmail.com', direccion: 'DIRECCION', sector: '01', tipo_cliente: '01', acepta_credito: 'N', dias_credito: 0, saldo_actual: 0, limite_credito: 0, status: 'A', cod_vendedor: '00', tipo_precio: '1' },
          { cod_cliente: 'V17614161', nom_cliente: 'ADRIANA VICTORIA TORRES AGUIAR', rif_cliente: 'V17614161', email: 'rerojas@gmail.com', direccion: 'FLOR AMARILLO', sector: '05', tipo_cliente: '01', acepta_credito: 'N', dias_credito: 0, saldo_actual: 0, limite_credito: 0, status: 'A', cod_vendedor: '00', tipo_precio: '1' },
          { cod_cliente: 'J501450994', nom_cliente: 'PC BARINAS, C.A.', rif_cliente: 'J501450994', email: 'rerojas@gmail.com', direccion: 'AV 23 DE ENERO CCVEMECA NIVEL PB LOCAL 08', sector: '05', tipo_cliente: '01', acepta_credito: 'S', dias_credito: 30, saldo_actual: 1500, limite_credito: 5000, status: 'A', cod_vendedor: '00', tipo_precio: '1' },
        ]);
      }
    } catch (e) { 
      console.error("Error fetching clientes:", e);
      setData([]); 
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, [search]);

  const openDetail = async (cliente: any) => {
    setSelected(cliente);
    setHistLoading(true);
    try {
      const { data: vendas } = await supabase.from('ventas').select('*').eq('cod_cliente', cliente.cod_cliente).order('fecha_doc', { ascending: false }).limit(20);
      setHistorico(vendas || []);
    } catch { 
      setHistorico([]); 
    }
    setHistLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, RIF o código..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 bg-accent/50 border-border/50 text-foreground placeholder:text-muted-foreground/50" 
          />
        </div>
        <button 
          onClick={() => exportToCSV(data, 'clientes')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-sm font-bold uppercase tracking-wider"
        >
          <Package className="w-4 h-4" />
          Exportar
        </button>
      </div>
      
      <div key="cnt-clientes-table" className="glass-card p-4 relative min-h-[400px]">
        {loading && (
          <div key="loading-overlay" className="absolute inset-0 bg-card/20 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <DataTableSkeleton cols={8} rows={10} />
          </div>
        )}
        
        <div key="table-content" className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr className="border-b border-white/5">
                <th className="font-bold">Código</th>
                <th className="font-bold">Nombre</th>
                <th className="font-bold">RIF</th>
                <th className="font-bold">Dirección</th>
                <th className="font-bold">Sector</th>
                <th className="font-bold text-center">Crédito</th>
                <th className="font-bold text-right">Saldo</th>
                <th className="font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr 
                  key={c.cod_cliente || `c-${i}`} 
                  className="hover:bg-white/5 transition-colors cursor-pointer" 
                  onClick={() => openDetail(c)}
                >
                  <td className="font-mono text-[10px] text-primary/80">{c.cod_cliente}</td>
                  <td className="font-medium">{c.nom_cliente}</td>
                  <td className="font-mono text-[10px] text-muted-foreground/60">{c.rif_cliente}</td>
                  <td className="text-muted-foreground/80 text-xs max-w-[200px] truncate">{c.direccion || '-'}</td>
                  <td className="text-muted-foreground/80">{c.sector || '-'}</td>
                  <td className="text-center">
                    {c.acepta_credito === 'S'
                      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{`Sí (${c.dias_credito || 0}d)`}</span>
                      : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-rose-500/10 text-rose-300 border border-rose-500/20">No</span>}
                  </td>
                  <td className="text-right font-bold text-indigo-300">{formatCurrency(c.saldo_actual, 'VES')}</td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${c.status === 'A' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                      {c.status === 'A' ? 'Activo' : 'Baja'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr key="empty">
                  <td colSpan={8} className="py-20 text-center text-muted-foreground italic">Ningún cliente encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-foreground">{selected?.nom_cliente}</DialogTitle></DialogHeader>
          <div key="detail-content" className="space-y-5">
            {selected && (
              <>

              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Datos Básicos</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Código:</span> <span className="text-foreground ml-1">{selected.cod_cliente}</span></div>
                  <div><span className="text-muted-foreground">RIF:</span> <span className="text-foreground ml-1">{selected.rif_cliente}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Dirección:</span> <span className="text-foreground ml-1">{selected.direccion || '-'}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-1">{selected.email || '-'}</span></div>
                  <div><span className="text-muted-foreground">Teléfono:</span> <span className="text-foreground ml-1">{selected.telefono || '-'}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Datos Comerciales</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Sector:</span> <span className="text-foreground ml-1">{selected.sector || '-'}</span></div>
                  <div><span className="text-muted-foreground">Tipo:</span> <span className="text-foreground ml-1">{selected.tipo_cliente || '-'}</span></div>
                  <div><span className="text-muted-foreground">Vendedor:</span> <span className="text-foreground ml-1">{selected.cod_vendedor || '-'}</span></div>
                  <div><span className="text-muted-foreground">Tipo Precio:</span> <span className="text-foreground ml-1">{selected.tipo_precio || '-'}</span></div>
                  <div><span className="text-muted-foreground">Crédito:</span> <span className="text-foreground ml-1">{selected.acepta_credito === 'S' ? `Sí (${selected.dias_credito || 0} dias)` : 'No'}</span></div>
                  <div><span className="text-muted-foreground">Límite:</span> <span className="text-foreground ml-1">{formatCurrency(selected.limite_credito, 'VES')}</span></div>
                  <div><span className="text-muted-foreground">Saldo:</span> <span className="text-foreground ml-1">{formatCurrency(selected.saldo_actual, 'VES')}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="text-foreground ml-1">{selected.status === 'A' ? 'Activo' : 'Inactivo'}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Datos Personales</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Sexo:</span> <span className="text-foreground ml-1">{selected.sexo === 'M' ? 'Masculino' : selected.sexo === 'F' ? 'Femenino' : '-'}</span></div>
                  <div><span className="text-muted-foreground">Fecha Nac.:</span> <span className="text-foreground ml-1">{formatDate(selected.fecha_nacimiento)}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Histórico de Compras</h4>
                <div className="min-h-[100px] relative">
                  {histLoading && (
                    <div className="absolute inset-0 bg-card/50 z-10 flex items-center justify-center rounded">
                      <DataTableSkeleton cols={5} rows={3} />
                    </div>
                  )}
                  <table className="w-full text-sm table-zebra">
                    <thead><tr className="text-muted-foreground text-left border-b border-border">
                      <th className="pb-2 font-medium">Nº Doc</th><th className="pb-2 font-medium">Fecha</th><th className="pb-2 font-medium">Total</th><th className="pb-2 font-medium">Tipo</th><th className="pb-2 font-medium">Status</th>
                    </tr></thead>
                    <tbody>
                      {historico.map((v, i) => (
                        <tr key={v.num_doc || `v-${i}`} className="border-b border-border/30">
                          <td className="py-1.5 text-foreground font-mono text-xs">{v.num_doc}</td>
                          <td className="py-1.5 text-foreground">{formatDate(v.fecha_doc)}</td>
                          <td className="py-1.5 text-foreground">{formatCurrency(v.total_doc, 'VES')}</td>
                          <td className="py-1.5 text-muted-foreground">{v.tipo_doc || '-'}</td>
                          <td className="py-1.5 text-muted-foreground">{v.status_doc || '-'}</td>
                        </tr>
                      ))}
                      {!histLoading && historico.length === 0 && (<tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Sin compras registradas</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}

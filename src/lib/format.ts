/* eslint-disable @typescript-eslint/no-explicit-any */

/** Formato venezolano: 1.234.567,00 Bs */
export function formatCurrency(value: number | null | undefined, currency: string = 'USD'): string {
  if (value == null || isNaN(Number(value))) return 'Bs 0,00';
  try {
    const num = Number(value);
    const formatted = new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
    if (currency === 'USD') return `$ ${formatted}`;
    return `Bs ${formatted}`;
  } catch {
    return `${value}`;
  }
}

/** Display dual: "Bs 1.500,00 | $ 75,00" */
export function formatDualCurrency(valorBs: number | null | undefined, tasaCambio: number | null | undefined): string {
  if (valorBs == null) return '-';
  const bs = formatCurrency(valorBs, 'VES');
  if (tasaCambio && tasaCambio > 1) {
    const usd = formatCurrency(valorBs / tasaCambio, 'USD');
    return `${bs} | ${usd}`;
  }
  return bs;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return new Intl.NumberFormat('es-VE').format(value);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '-';
  }
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('es-VE');
  } catch {
    return '-';
  }
}

export function timeAgo(date: string | null | undefined): { text: string; minutes: number } {
  if (!date) return { text: 'Nunca', minutes: Infinity };
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return { text: 'Ahora mismo', minutes: 0 };
  if (diffMin < 60) return { text: `${diffMin} min atrás`, minutes: diffMin };
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return { text: `${diffHours}h atrás`, minutes: diffMin };
  return { text: `${Math.floor(diffHours / 24)}d atrás`, minutes: diffMin };
}

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

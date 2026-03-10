import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { timeAgo } from '@/lib/format';

export function useSyncStatus() {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState({ text: 'Carregando...', minutes: Infinity });

  const fetchSync = async () => {
    const { data } = await supabase
      .from('sync_log')
      .select('ultima_sync')
      .order('ultima_sync', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      setLastSync(data[0].ultima_sync);
    }
  };

  useEffect(() => {
    fetchSync();

    const channel = supabase
      .channel('sync_log_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_log' }, () => {
        fetchSync();
      })
      .subscribe();

    const interval = setInterval(() => {
      if (lastSync) setSyncInfo(timeAgo(lastSync));
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [lastSync]);

  useEffect(() => {
    if (lastSync) setSyncInfo(timeAgo(lastSync));
  }, [lastSync]);

  return { ...syncInfo, isRecent: syncInfo.minutes < 2 };
}

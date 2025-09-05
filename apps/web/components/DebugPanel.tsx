'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DebugData {
  table_name: string;
  record_count: number;
  latest_date: string | null;
  notes: string;
}

interface ConnectionStatus {
  supabase: boolean;
  auth: boolean;
  user_id: string | null;
  user_email: string | null;
}

export default function DebugPanel({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [debugData, setDebugData] = useState<DebugData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    supabase: false,
    auth: false,
    user_id: null,
    user_email: null
  });
  const [loading, setLoading] = useState(false);
  const [seederLoading, setSeederLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test connessione e carica dati debug
  const loadDebugData = async () => {
    setLoading(true);
    addLog('Caricamento dati debug...');

    try {
      // Test connessione Supabase
      const { data: testData, error: testError } = await supabase
        .from('suggestions')
        .select('count')
        .limit(1);
      
      if (testError) throw testError;
      
      // Test auth
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      const status: ConnectionStatus = {
        supabase: true,
        auth: !!session,
        user_id: session?.user?.id || null,
        user_email: session?.user?.email || null
      };
      setConnectionStatus(status);

      if (session?.user?.id) {
        // Carica dati debug usando la funzione SQL
        const { data: debugResult, error: debugError } = await supabase
          .rpc('debug_user_data', { target_user_id: session.user.id });

        if (debugError) {
          addLog(`Errore funzione debug: ${debugError.message}`);
          // Fallback: query manuali
          await loadDebugDataFallback(session.user.id);
        } else {
          setDebugData(debugResult || []);
          addLog('Dati debug caricati con successo');
        }
      } else {
        addLog('Utente non autenticato');
      }

    } catch (error: any) {
      addLog(`Errore: ${error.message}`);
      setConnectionStatus({
        supabase: false,
        auth: false,
        user_id: null,
        user_email: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback per caricare dati senza funzione SQL
  const loadDebugDataFallback = async (userId: string) => {
    try {
      const tables = [
        { name: 'users', table: 'users' },
        { name: 'health_metrics', table: 'health_metrics' },
        { name: 'lifescores', table: 'lifescores' },
        { name: 'user_suggestions', table: 'user_suggestions' }
      ];

      const debugData: DebugData[] = [];

      for (const tableInfo of tables) {
        const { count, error: countError } = await supabase
          .from(tableInfo.table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) {
          debugData.push({
            table_name: tableInfo.name,
            record_count: 0,
            latest_date: null,
            notes: `Errore: ${countError.message}`
          });
          continue;
        }

        // Prova a ottenere la data più recente se esiste campo date
        let latestDate = null;
        if (['health_metrics', 'lifescores', 'user_suggestions'].includes(tableInfo.name)) {
          const { data: latestData } = await supabase
            .from(tableInfo.table)
            .select('date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(1);
          
          latestDate = latestData?.[0]?.date || null;
        }

        debugData.push({
          table_name: tableInfo.name,
          record_count: count || 0,
          latest_date: latestDate,
          notes: count === 0 ? 'Nessun dato' : 'OK'
        });
      }

      setDebugData(debugData);
      addLog('Dati debug caricati (fallback)');
    } catch (error: any) {
      addLog(`Errore fallback: ${error.message}`);
    }
  };

  // Esegui seeder per creare dati di test
  const runSeeder = async () => {
    setSeederLoading(true);
    addLog('Esecuzione seeder...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Utente non autenticato');
      }

      // Chiama la funzione di seeding
      const { data, error } = await supabase
        .rpc('generate_realistic_data', { 
          target_user_id: session.user.id,
          days_count: 30 
        });

      if (error) throw error;

      addLog('Seeder completato con successo!');
      // Ricarica i dati debug
      await loadDebugData();

    } catch (error: any) {
      addLog(`Errore seeder: ${error.message}`);
    } finally {
      setSeederLoading(false);
    }
  };

  // Pulisci dati utente
  const clearUserData = async () => {
    if (!confirm('Sei sicuro di voler cancellare tutti i tuoi dati? Questa azione non può essere annullata.')) {
      return;
    }

    setLoading(true);
    addLog('Cancellazione dati...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Utente non autenticato');
      }

      // Cancella in ordine per rispettare le foreign key
      await supabase.from('user_suggestions').delete().eq('user_id', session.user.id);
      await supabase.from('lifescores').delete().eq('user_id', session.user.id);
      await supabase.from('health_metrics').delete().eq('user_id', session.user.id);

      addLog('Dati cancellati con successo');
      await loadDebugData();

    } catch (error: any) {
      addLog(`Errore cancellazione: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDebugData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Debug Panel LifeOS</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Status Connessioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Stato Connessioni</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center ${connectionStatus.supabase ? 'text-green-600' : 'text-red-600'}`}>
                <span className="w-3 h-3 rounded-full mr-2" style={{ 
                  backgroundColor: connectionStatus.supabase ? '#22c55e' : '#ef4444' 
                }}></span>
                Supabase: {connectionStatus.supabase ? 'OK' : 'Errore'}
              </div>
              <div className={`flex items-center ${connectionStatus.auth ? 'text-green-600' : 'text-red-600'}`}>
                <span className="w-3 h-3 rounded-full mr-2" style={{ 
                  backgroundColor: connectionStatus.auth ? '#22c55e' : '#ef4444' 
                }}></span>
                Auth: {connectionStatus.auth ? 'OK' : 'Non autenticato'}
              </div>
              {connectionStatus.user_id && (
                <div className="text-gray-600">
                  <div>ID: {connectionStatus.user_id.slice(0, 8)}...</div>
                  <div>Email: {connectionStatus.user_email}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Azioni</h3>
            <div className="space-y-2">
              <button
                onClick={loadDebugData}
                disabled={loading}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Caricamento...' : 'Ricarica Dati'}
              </button>
              <button
                onClick={runSeeder}
                disabled={seederLoading || !connectionStatus.auth}
                className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
              >
                {seederLoading ? 'Creazione...' : 'Crea Dati Test (30 giorni)'}
              </button>
              <button
                onClick={clearUserData}
                disabled={loading || !connectionStatus.auth}
                className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                Cancella Tutti i Dati
              </button>
            </div>
          </div>
        </div>

        {/* Tabella Debug */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Stato Database</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Tabella</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Record</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Ultimo Dato</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {debugData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{row.table_name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        row.record_count === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {row.record_count}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {row.latest_date || '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Console */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Log Console</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-32 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Premi "Ricarica Dati" per iniziare...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Suggerimenti */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Suggerimenti Debug</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Se vedi 0 record in tutte le tabelle, clicca "Crea Dati Test"</li>
            <li>• Se health_metrics ha dati ma lifescores è vuoto, controlla l'Edge Function daily-rollup</li>
            <li>• Per testare in produzione, usa prima "Crea Dati Test" poi vai alla dashboard</li>
            <li>• La tabella users deve sempre avere 1 record se sei autenticato</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
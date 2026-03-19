
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EquipmentData, PointType } from './types';
import Header from './components/Header';
import EquipmentCard from './components/EquipmentCard';

const createInitialEquipments = (): EquipmentData[] => 
  Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    return {
      id,
      name: `PATR. ${id.toString().padStart(2, '0')}`,
      startValue: '',
      endValue: '',
      isOpen: false,
    };
  });

const App: React.FC = () => {
  const [city, setCity] = useState('');
  const [opDate, setOpDate] = useState(new Date().toISOString().split('T')[0]);
  const [activePoint, setActivePoint] = useState<PointType>('Ponto 1');
  const [pointData, setPointData] = useState<{ [key in PointType]: EquipmentData[] }>({
    'Ponto 1': createInitialEquipments(),
    'Ponto 2': createInitialEquipments(),
  });
  const [reportTime, setReportTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados salvos - v13 para refletir os novos números de série
  useEffect(() => {
    const saved = localStorage.getItem('odsi_data_v13');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.city) setCity(parsed.city);
        if (parsed.opDate) setOpDate(parsed.opDate);
        if (parsed.pointData) setPointData(parsed.pointData);
      } catch (e) { 
        console.error("Erro ao carregar dados locais:", e); 
      }
    }
  }, []);

  // Salvar dados automaticamente
  useEffect(() => {
    localStorage.setItem('odsi_data_v13', JSON.stringify({ city, opDate, pointData }));
  }, [city, opDate, pointData]);

  const updateEquipment = (id: number, field: keyof EquipmentData, value: any) => {
    setPointData(prev => {
      const newP1 = prev['Ponto 1'].map(eq => ({ ...eq }));
      const newP2 = prev['Ponto 2'].map(eq => ({ ...eq }));
      
      const idx1 = newP1.findIndex(e => e.id === id);
      const idx2 = newP2.findIndex(e => e.id === id);

      if (idx1 === -1 || idx2 === -1) return prev;

      if (field === 'name') {
        (newP1[idx1] as any)[field] = value;
        (newP2[idx2] as any)[field] = value;
      } else if (field === 'isOpen') {
        if (activePoint === 'Ponto 1') {
          newP1[idx1].isOpen = value;
        } else {
          newP2[idx2].isOpen = value;
          // Se abrir no Ponto 2, tenta puxar o valor final do Ponto 1 como inicial do Ponto 2
          if (value === true) {
            const finalValueP1 = newP1[idx1].endValue;
            const currentStartP2 = newP2[idx2].startValue;
            if (finalValueP1 !== '' && (currentStartP2 === '' || currentStartP2 === 0)) {
              newP2[idx2].startValue = finalValueP1;
            }
          }
        }
      } else {
        if (activePoint === 'Ponto 1') {
          (newP1[idx1] as any)[field] = value;
        } else {
          (newP2[idx2] as any)[field] = value;
        }
      }

      return {
        'Ponto 1': newP1,
        'Ponto 2': newP2
      };
    });
  };

  const calculateTotal = (equipments: EquipmentData[]) => {
    return equipments.reduce((sum, eq) => {
      const start = Number(eq.startValue) || 0;
      const end = Number(eq.endValue) || 0;
      const diff = end - start;
      return sum + (diff > 0 ? diff : 0);
    }, 0);
  };

  const totalP1 = useMemo(() => calculateTotal(pointData['Ponto 1']), [pointData]);
  const totalP2 = useMemo(() => calculateTotal(pointData['Ponto 2']), [pointData]);
  const grandTotal = totalP1 + totalP2;

  const handlePrint = () => {
    setReportTime(new Date().toLocaleTimeString('pt-BR'));
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownloadBackup = () => {
    const backup = { city, opDate, pointData, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ODSI_BACKUP_${city || 'OPERACAO'}_${opDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.pointData) {
          setPointData(data.pointData);
          if (data.city !== undefined) setCity(data.city);
          if (data.opDate !== undefined) setOpDate(data.opDate);
          alert('Dados restaurados com sucesso!');
        }
      } catch (err) { alert('Erro ao processar arquivo.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Atenção: Os valores de início e fim serão zerados, mas os números de PATRIMÔNIO serão mantidos. Continuar?')) {
      setPointData(prev => {
        const resetPoint = (equipments: EquipmentData[]) => 
          equipments.map(eq => ({
            ...eq,
            startValue: '',
            endValue: '',
            isOpen: false
          }));
        
        return {
          'Ponto 1': resetPoint(prev['Ponto 1']),
          'Ponto 2': resetPoint(prev['Ponto 2'])
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />

      <div className="no-print pb-40">
        <Header city={city} setCity={setCity} point={activePoint} setPoint={setActivePoint} date={opDate} setDate={setOpDate} />
        
        <main className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">GESTÃO DE ETILÔMETROS</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Controle de Produtividade Detran SP</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={handlePrint} className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-lg active:scale-95 transition-all text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                IMPRIMIR RELATÓRIO
              </button>
              <button onClick={handleDownloadBackup} title="Backup" className="p-4 bg-white text-slate-600 border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <button onClick={() => fileInputRef.current?.click()} title="Restaurar" className="p-4 bg-white text-blue-600 border border-blue-200 rounded-2xl hover:bg-blue-50 transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </button>
              <button onClick={handleReset} className="px-4 py-2 text-red-500 font-black hover:bg-red-50 rounded-xl transition-colors text-xs uppercase tracking-widest">Zerar Tudo</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pointData[activePoint].map(eq => (
              <EquipmentCard key={eq.id} equipment={eq} onUpdate={updateEquipment} />
            ))}
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex gap-10">
              <div className="text-center px-4 border-r-2 border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal Ponto 1</p>
                <p className="text-3xl font-black text-slate-900 leading-tight">{totalP1}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal Ponto 2</p>
                <p className="text-3xl font-black text-slate-900 leading-tight">{totalP2}</p>
              </div>
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Resultado Geral Consolidado</p>
              <h3 className="text-6xl font-black text-slate-900 leading-none tracking-tighter">{grandTotal}</h3>
            </div>
          </div>
        </footer>
      </div>

      {/* Relatório de Impressão */}
      <div className="print-only bg-white text-black p-10 font-sans w-full hidden">
        <div className="border-b-[6px] border-black pb-8 mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight uppercase">ODSI - DETRAN SP - OPERAÇÃO DIREÇÃO SEGURA</h1>
          <h2 className="text-3xl font-black uppercase mt-4 bg-black text-white py-2 inline-block px-8">{city || 'CIDADE NÃO INFORMADA'}</h2>
          <div className="mt-6 pt-6 border-t-4 border-black text-xl flex justify-between items-center px-4">
            <p className="font-black uppercase tracking-widest text-lg">Relatório Técnico Operacional</p>
            <p className="font-bold">DATA: <span className="font-black">{opDate.split('-').reverse().join('/')}</span> | HORA: <span className="font-black">{reportTime}</span></p>
          </div>
        </div>

        <div className="space-y-12">
          {(['Ponto 1', 'Ponto 2'] as PointType[]).map((p) => (
            <section key={p}>
              <div className="bg-slate-200 border-2 border-black text-black p-3 mb-4 text-center font-black text-2xl uppercase tracking-[0.2em]">{p}</div>
              <table className="w-full text-left text-xl border-collapse">
                <thead>
                  <tr className="border-b-[4px] border-black font-black uppercase">
                    <th className="py-3 px-2">EQUIPAMENTO</th>
                    <th className="py-3 px-2 text-right">INICIAL</th>
                    <th className="py-3 px-2 text-right">FINAL</th>
                    <th className="py-3 px-2 text-right">ABORDAGENS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-400">
                  {pointData[p].map(eq => {
                    const diff = (Number(eq.endValue) || 0) - (Number(eq.startValue) || 0);
                    if (!eq.startValue && !eq.endValue) return null;
                    return (
                      <tr key={eq.id} className="hover:bg-gray-50">
                        <td className="py-4 px-2 font-black text-2xl">
                          #{eq.id.toString().padStart(2, '0')} <span className="text-xl font-bold ml-2 uppercase">{eq.name}</span>
                        </td>
                        <td className="py-4 px-2 text-right font-medium">{eq.startValue || 0}</td>
                        <td className="py-4 px-2 text-right font-medium">{eq.endValue || 0}</td>
                        <td className="py-4 px-2 text-right font-black text-3xl">{diff > 0 ? diff : 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-right font-black border-t-[3px] border-black pt-4 text-2xl flex justify-end gap-10">
                <span className="uppercase text-gray-600">SUBTOTAL {p}:</span>
                <span className="bg-black text-white px-6 py-1">{p === 'Ponto 1' ? totalP1 : totalP2}</span>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 border-[8px] border-black p-8 text-center max-w-[450px] mx-auto bg-white shadow-xl">
          <p className="text-xl font-black uppercase mb-3 tracking-widest text-gray-500 text-center">Resultado Geral da Operação</p>
          <div className="flex items-center justify-center">
             <p className="text-9xl font-black leading-none tracking-tighter text-center">{grandTotal}</p>
          </div>
          <p className="text-2xl font-black mt-2 uppercase text-center">Abordagens Totais</p>
          <div className="mt-6 pt-4 border-t-2 border-dashed border-black text-xs font-bold uppercase text-gray-500 italic text-center">
            Documento gerado eletronicamente em conformidade com o sistema ODSI
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { 
            display: block !important; 
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }
          body { background: white !important; }
        }
        @page { size: portrait; margin: 15mm; }
      `}</style>
    </div>
  );
};

export default App;

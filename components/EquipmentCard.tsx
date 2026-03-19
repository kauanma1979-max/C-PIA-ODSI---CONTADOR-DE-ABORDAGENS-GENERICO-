
import React from 'react';
import { EquipmentData } from '../types';

interface EquipmentCardProps {
  equipment: EquipmentData;
  onUpdate: (id: number, field: keyof EquipmentData, value: any) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onUpdate }) => {
  const diff = (typeof equipment.endValue === 'number' && typeof equipment.startValue === 'number') 
    ? equipment.endValue - equipment.startValue 
    : 0;

  const isValid = diff >= 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${equipment.isOpen ? 'ring-4 ring-blue-500 border-transparent shadow-xl' : 'border-slate-200 hover:border-blue-400'}`}>
      <div className="p-5">
        <button 
          onClick={() => onUpdate(equipment.id, 'isOpen', !equipment.isOpen)}
          className="w-full text-left flex items-center gap-4"
        >
          <div className={`w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${equipment.isOpen ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
            {equipment.id}
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-black text-3xl text-slate-900 uppercase tracking-tighter leading-none mb-1">
              {equipment.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Produtividade:</span>
              <span className={`text-xl font-black ${isValid ? 'text-blue-600' : 'text-red-500'}`}>
                {isValid ? diff : 'ERRO'}
              </span>
            </div>
          </div>
          <div className={`transform transition-transform duration-300 ${equipment.isOpen ? 'rotate-180 text-blue-600' : 'rotate-0 text-slate-300'}`}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {equipment.isOpen && (
        <div className="px-5 pb-6 bg-slate-50 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4 pt-5">
            <div className="col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 tracking-tighter text-center">Nº de Série do Aparelho</label>
              <input
                type="text"
                value={equipment.name}
                onChange={(e) => onUpdate(equipment.id, 'name', e.target.value)}
                className="w-full p-3 text-xl font-black text-center border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                placeholder="Digite o número de série..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 tracking-tighter text-center">Nº Inicial</label>
              <input
                type="number"
                inputMode="numeric"
                value={equipment.startValue}
                onChange={(e) => onUpdate(equipment.id, 'startValue', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-4 text-3xl font-black text-center border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 tracking-tighter text-center">Nº Final</label>
              <input
                type="number"
                inputMode="numeric"
                value={equipment.endValue}
                onChange={(e) => onUpdate(equipment.id, 'endValue', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-4 text-3xl font-black text-center border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-blue-100 shadow-inner">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Subtotal {equipment.name}</span>
            <span className={`text-5xl font-black ${isValid ? 'text-blue-700' : 'text-red-600'}`}>
              {isValid ? diff : 'INVÁLIDO'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentCard;

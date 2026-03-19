
import React from 'react';

interface HeaderProps {
  city: string;
  setCity: (city: string) => void;
  point: string;
  setPoint: (point: 'Ponto 1' | 'Ponto 2') => void;
  date: string;
  setDate: (date: string) => void;
}

const Header: React.FC<HeaderProps> = ({ city, setCity, point, setPoint, date, setDate }) => {
  return (
    <header className="bg-slate-900 text-white p-6 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-400">ODSI - DETRAN SP</h1>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Operação Direção Segura Integrada</p>
          </div>
          <div className="h-10 w-px bg-slate-700 hidden sm:block mx-2"></div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase text-slate-500 font-bold mb-1">Data da Operação</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="flex-1">
            <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Cidade da Operação</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Digite o nome da cidade..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Ponto de Operação</label>
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setPoint('Ponto 1')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${point === 'Ponto 1' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Ponto 1
              </button>
              <button
                onClick={() => setPoint('Ponto 2')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${point === 'Ponto 2' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Ponto 2
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

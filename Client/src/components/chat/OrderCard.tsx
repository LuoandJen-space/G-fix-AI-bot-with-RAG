//icons from lucide-react
import {
  Wrench,  ShieldCheck,
} from 'lucide-react';

//order card component.
export const OrderCard = () => (
  <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3 flex items-center gap-3 mt-3 shadow-md">
    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
      <Wrench className="w-5 h-5" />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Repair process：Detected</p>
      <p className="text-xs text-slate-800 dark:text-slate-100 font-bold">Screen Replacement</p>
      <div className="flex items-center gap-1 mt-0.5">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span className="text-[9px] text-emerald-500 font-medium">Quality Assurance</span>
      </div>
    </div>
    <button className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors">
      more infromation
    </button>
  </div>
);
import { X } from "lucide-react";
import { useState } from "react";

function Modal({ children, onClose }) {
  return (
    <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
      <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-800">Item Information</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200 text-slate-600 hover:text-slate-800"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
        <div className="h-1 bg-gradient-to-r from-blue-400 via-sky-400 to-blue-400"></div>
      </div>
    </div>
  );
}
export default function ModalDemo() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Open Modal
        </button>
      </div>
    );
  }

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 leading-relaxed">
          </p>
        </div>
        
        <div className="space-y-3">
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
        
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>

            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
       
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
          
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
            
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 italic">
          </p>
        </div>
      </div>
    </Modal>
  );
}
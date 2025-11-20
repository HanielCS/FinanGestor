import React, { useEffect } from 'react';

 // Modal (Janela Sobreposta).
export default function Modal({ isOpen, onClose, title, children }) {
  
  // Efeito para fechar o modal ao pressionar a tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    // Limpeza do evento ao desmontar
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    // onClick={onClose} no overlay permite fechar clicando no fundo escuro
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* e.stopPropagation impede que cliques DENTRO da caixa fechem o modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>{title}</h3>
          <button 
            onClick={onClose} 
            className="close-btn" 
            title="Fechar"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
      </div>
    </div>
  );
}
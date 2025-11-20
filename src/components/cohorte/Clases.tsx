'use client';

import { useState } from 'react';
import ClaseHang from './ClaseHang'; // Contenido de la primera vista
import ClassSub from './ClassSub'; // Contenido de la segunda vista

interface ClasesProps {
  readonly cohorteId: string;
  readonly canManage: boolean; // Si el usuario puede gestionar clases (TEACHER, ADMIN)
  readonly currentUser: {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
  };
}

const Clases = ({ cohorteId, canManage, currentUser }: ClasesProps) => {
  const [activeButton, setActiveButton] = useState<'hang' | 'sub'>('hang');

  const handleButtonClick = (buttonName: 'hang' | 'sub') => {
    setActiveButton(buttonName);
  };

  const getButtonTextClass = (buttonName: 'hang' | 'sub') => {
    const baseClasses = 'text-sm w-1/2 text-center relative z-10 py-1 transition-colors duration-300';
    if (activeButton === buttonName) {
      return 'font-bold text-black ' + baseClasses;
    } else {
      return 'text-gray-600 ' + baseClasses;
    }
  };

  return (
    <>
      <div className="w-full md:w-[25%] text-center">
        <div className="bg-white p-1.5 flex justify-between items-center w-full   rounded-full relative overflow-hidden">
          <div className={`absolute left-0 w-1/2 rounded-full h-[80%] bg-[#ffff00] transition-transform duration-300 ease-in ${activeButton === 'sub' ? 'translate-x-[97%] bg-green-400' : 'translate-x-1 bg-sky-400'}`}></div>
          {/* 1.2. Botones (Deben ser hermanos del slider) */}
          <button className={getButtonTextClass('hang')} onClick={() => handleButtonClick('hang')}>
            Hands On
          </button>

          <button className={getButtonTextClass('sub')} onClick={() => handleButtonClick('sub')}>
            SUP
          </button>
        </div>
      </div>
      <div className="mt-6 w-full">
        {activeButton === 'hang' && <ClaseHang theme={'hang'} cohorteId={cohorteId} />}
        {activeButton === 'sub' && <ClassSub theme={'sub'} cohorteId={cohorteId} />}
      </div>
    </>
  );
};

export default Clases;

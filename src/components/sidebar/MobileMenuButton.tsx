"use client";
import {Menu, X} from "lucide-react";
import Sidebar from "./Sidebar";

interface Props {
  isOpen: boolean;
  toggle: () => void;
}

export default function MobileMenuButton({isOpen, toggle}: Props) {
  return (
    <button onClick={toggle} className=" text-yellow-400 p-2 rounded-lg mr-1 size-10 md:hidden cursor-pointer">
      {isOpen ? <X size={28} /> : <Menu size={28} />}
    </button>
  );
}

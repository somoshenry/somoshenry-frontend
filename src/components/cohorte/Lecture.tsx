import Link from "next/link";
import {useRouter} from "next/navigation";
import {Router} from "next/router";
import React from "react";

export interface lectureProp {
  lecture: string;
  title: string;
  description: string;
}

const Lecture: React.FC<lectureProp> = ({lecture, title, description}) => {
  const router = useRouter();
  return (
    <div className="dark:bg-gray-200 bg-white w-full mb-5 p-2 size-24 flex border-2 rounded-lg hover:scale-102 duration-150 ease-in mt-3 shadow-md dark:shadow-[#ffff00]/30 shadow-black/30">
      <div className=" left-0 top-0 h-full w-2 bg-[#ffff00] rounded-l-xl"></div>
      <img src="/book.png" className="size-20 block mr-3 p-3" />
      <div className="w-full h-full flex flex-col items-start justify-center">
        <h2 className="md:text-xl py-2 text-sky-700 leading-4 h-1/2 font-bold">{`${lecture} | ${title}`}</h2>
        <p className="md:text-md text-xs md:text-lg tracking-tight leading-4 text-black h-1/2">{description}</p>
      </div>
      <button
        className=" md:px-3 md:py-1 p-1 md:mr-10 my-auto md:text-2xl  rounded-lg duration-150 ease-in-out bg-[#ffff00] dark:bg-gray-900 dark:text-white text-black hover:scale-115 cursor-pointer"
        onClick={() => router.push("/lecture1")}
      >
        Ver
      </button>
    </div>
  );
};
export default Lecture;

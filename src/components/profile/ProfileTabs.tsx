"use client";
import {useState} from "react";
import ProfilePosts from "./ProfilePost";
import ProfileMedia from "./ProfileMedia";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="w-11/12 mt-6">
      <div className="flex justify-around border-b  pb-2 mb-4">
        {["posts", "media"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={` capitalize cursor-pointer ${
              activeTab === tab
                ? "font-semibold capitalize text-black rounded-xl  px-2 py-1 shadow-md dark:shadow-[#ffff00]/50 shadow-black/50 cursor-pointer dark:text-black  text-md  bg-[#ffff00] transition duration-300 "
                : "text-black font-light dark:text-white"
            }`}
          >
            {tab === "posts" ? "Publicaciones" : "Multimedia"}
          </button>
        ))}
      </div>

      {activeTab === "posts" && <ProfilePosts />}
      {activeTab === "media" && <ProfileMedia />}
    </div>
  );
}

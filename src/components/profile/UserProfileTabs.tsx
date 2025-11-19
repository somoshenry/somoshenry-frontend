"use client";
import {useState} from "react";
import UserProfilePosts from "./UserProfilePosts";
import UserProfileMedia from "./UserProfileMedia";

interface UserProfileTabsProps {
  userId: string;
}

export default function UserProfileTabs({userId}: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex justify-around border-b pb-2 mb-4">
        {["posts", "media"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-semibold capitalize ${
              activeTab === tab
                ? "capitalize cursor-pointer font-semibold capitalize text-black rounded-xl  px-2 py-1 shadow-md dark:shadow-[#ffff00]/50 shadow-black/50 cursor-pointer dark:text-black  text-md  bg-[#ffff00] transition duration-300 "
                : "text-gray-600 dark:text-gray-300 cursor-pointer"
            }`}
          >
            {tab === "posts" ? "Publicaciones" : "Multimedia"}
          </button>
        ))}
      </div>

      {activeTab === "posts" && <UserProfilePosts userId={userId} />}
      {activeTab === "media" && <UserProfileMedia userId={userId} />}
    </div>
  );
}

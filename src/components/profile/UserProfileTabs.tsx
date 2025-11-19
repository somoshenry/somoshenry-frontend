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
              activeTab === tab ? "text-yellow-500 border-b-2 border-[#ffff00]" : "text-gray-600 dark:text-gray-300"
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

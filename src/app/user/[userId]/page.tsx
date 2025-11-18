"use client";
import {useParams} from "next/navigation";
import UserProfileHeader from "@/components/profile/UserProfileHeader";
import UserProfileTabs from "@/components/profile/UserProfileTabs";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-16 md:ml-64">
      <div className="flex flex-col w-full items-center">
        <UserProfileHeader userId={userId} />
        <UserProfileTabs userId={userId} />
      </div>
    </div>
  );
}

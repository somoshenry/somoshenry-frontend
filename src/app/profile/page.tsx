import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16 md:ml-64">
      <div className="flex flex-col w-full items-center">
        <ProfileHeader />
        <ProfileTabs />
      </div>
      {/* Debug removido */}
    </div>
  );
}

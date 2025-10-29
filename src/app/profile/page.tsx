import ProfileHeader from '@/src/components/profile/ProfileHeader';
import ProfileTabs from '@/src/components/profile/ProfileTabs';

export default function ProfilePage() {
  return (
    <div className="flex flex-col w-full items-center">
      <ProfileHeader />
      <ProfileTabs />
    </div>
  );
}

'use client';
import { useState } from 'react';
import ProfilePosts from './ProfilePost';
import ProfileMedia from './ProfileMedia';

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="w-11/12 mt-6">
      <div className="flex justify-around border-b pb-2 mb-4">
        {['posts', 'media'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`font-semibold capitalize ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-400' : 'text-gray-600 dark:text-gray-300'}`}>
            {tab === 'posts' ? 'Publicaciones' : 'Multimedia'}
          </button>
        ))}
      </div>

      {activeTab === 'posts' && <ProfilePosts />}
      {activeTab === 'media' && <ProfileMedia />}
    </div>
  );
}

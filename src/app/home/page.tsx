'use client';
import { useState } from 'react';
import CreatePost from '../../components/CreatePost';
import PostList from '../../components/PostList';
import { PostType } from '../../interfaces/post';

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);

  const handleAddPost = (newPost: PostType) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: PostType) => {
    setPosts(posts.map(p => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <CreatePost onAddPost={handleAddPost} />
      <PostList posts={posts} onUpdatePost={handleUpdatePost} />
    </main>
  );
}
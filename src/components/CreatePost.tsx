import { useState } from 'react';
import { PostType } from '../interfaces/post';

interface Props {
  onAddPost: (post: PostType) => void;
}

export default function CreatePost({ onAddPost }: Props) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: PostType = {
      id: Date.now(),
      content,
      likes: 0,
      comments: [],
    };

    onAddPost(newPost);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué quieres compartir?"
        className="w-full border p-2 rounded-lg resize-none"
      />
      <button
        type="submit"
        className="mt-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
      >
        Publicar
      </button>
    </form>
  );
}

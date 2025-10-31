'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { PostType } from '../../interfaces/interfaces.post/post';

interface Props {
  onAddPost: (post: PostType) => void;
}

export default function CreatePost({ onAddPost }: Props) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file)); // Muestra la vista previa
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    const newPost: PostType = {
      id: Date.now(),
      content,
      likes: 0,
      createdAt: new Date().toISOString(),
      user: {
        id: 99, // temporal
        name: 'Usuario Actual',
        avatar: '/avatars/default.jpg',
      },
      comments: [],
      mediaUrl: preview || null, // URL de la imagen o video
      mediaType: media?.type.startsWith('video') ? 'video' : 'image', // tipo
    };

    onAddPost(newPost);
    setContent('');
    setMedia(null);
    setPreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 rounded-2xl shadow p-6 flex flex-col gap-3"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué quieres compartir?"
        className="bg-gray-200 text-black w-full border p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
      />

      {/* Input de archivos */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-[#ffff00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
        >
          📎 Agregar imagen o video
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Vista previa */}
      {preview && (
        <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-300">
          {media?.type.startsWith('video') ? (
            <video
              src={preview}
              controls
              className="w-full rounded-xl"
            />
          ) : (
            <img
              src={preview}
              alt="Vista previa"
              className="w-full object-cover rounded-xl"
            />
          )}
          <button
            type="button"
            onClick={() => {
              setMedia(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full px-2 py-1 text-xs hover:bg-opacity-80"
          >
            ✖
          </button>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 bg-[#ffff00] text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
      >
        Publicar
      </button>
    </form>
  );
}


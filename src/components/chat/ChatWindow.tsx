'use client';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { uploadFile } from '@/services/upload';

export default function ChatWindow() {
  const { currentConversation, messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConversation) return;

    if (file) {
      setUploading(true);
      try {
        const url = await uploadFile(file);
        const fileType = file.type.startsWith('image') ? 'IMAGE' : file.type.startsWith('video') ? 'VIDEO' : file.type.startsWith('audio') ? 'AUDIO' : 'FILE';
        await sendMessage(currentConversation.id, '', fileType, url);
        setPreview(null);
        setFile(null);
      } finally {
        setUploading(false);
      }
    } else if (newMessage.trim()) {
      await sendMessage(currentConversation.id, newMessage, 'TEXT');
      setNewMessage('');
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => setNewMessage((prev) => prev + emojiData.emoji);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const formatTime = (date: string) => new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Selecciona una conversación</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-800">
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">{(currentConversation.participants[1]?.name || 'U').charAt(0).toUpperCase()}</div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{currentConversation.participants[1]?.name || 'Usuario'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentConversation.participants[0]?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.senderId === currentConversation.participants[0]?.id ? 'bg-yellow-400 text-black' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`}>
              {msg.mediaUrl ? (
                msg.type === 'IMAGE' ? (
                  <img src={msg.mediaUrl} alt="img" className="rounded-lg max-w-[250px]" />
                ) : msg.type === 'VIDEO' ? (
                  <video controls className="rounded-lg max-w-[250px]">
                    <source src={msg.mediaUrl} />
                  </video>
                ) : msg.type === 'AUDIO' ? (
                  <audio controls src={msg.mediaUrl} />
                ) : (
                  <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="underline">
                    Archivo adjunto
                  </a>
                )
              ) : (
                <p className="text-sm break-words">{msg.content}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{formatTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />
          </div>
        )}

        {preview && (
          <div className="p-2 mb-2 border rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center gap-3">
            {file?.type.startsWith('image') && <img src={preview} className="w-16 h-16 rounded object-cover" alt="preview" />}
            <p className="text-sm truncate flex-1">{file?.name}</p>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-2xl hover:scale-110 transition-transform">
            😊
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-2xl hover:scale-110 transition-transform">
            📎
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          <button type="submit" disabled={uploading || (!newMessage.trim() && !file)} className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-black font-medium rounded-full transition-colors">
            {uploading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}

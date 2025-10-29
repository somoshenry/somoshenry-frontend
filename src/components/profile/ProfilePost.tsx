export default function ProfilePosts() {
  const posts = [
    { id: 1, content: '¡Mi primer publicación en Henry!', likes: 12 },
    { id: 2, content: 'Trabajando en un nuevo proyecto con Next.js', likes: 24 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <p>{post.content}</p>
          <p className="text-sm text-gray-500 mt-2">❤️ {post.likes} Me gusta</p>
        </div>
      ))}
    </div>
  );
}

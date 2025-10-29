export default function ProfileMedia() {
  const media = [
    { id: 1, type: 'image', url: '/demo1.jpg' },
    { id: 2, type: 'image', url: '/demo2.jpg' },
    { id: 3, type: 'video', url: '/demo.mp4' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {media.map((item) =>
        item.type === 'image' ? (
          <img key={item.id} src={item.url} alt="media" className="rounded-lg w-full h-48 object-cover" />
        ) : (
          <video key={item.id} controls className="rounded-lg w-full h-48">
            <source src={item.url} type="video/mp4" />
          </video>
        )
      )}
    </div>
  );
}

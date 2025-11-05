interface Student {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

export default function StudentList({ students }: { students: Student[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {students.map((s) => (
        <div
          key={s.id}
          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
        >
          <img
            src={s.avatar}
            alt={s.name}
            className="w-12 h-12 rounded-full mb-2 border-2 border-yellow-400"
          />
          <h3 className="font-semibold">{s.name}</h3>
          <p className="text-sm text-gray-500">{s.role}</p>
        </div>
      ))}
    </div>
  );
}

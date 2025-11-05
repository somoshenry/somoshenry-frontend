// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hook/useAuth';
// import TeacherCard from '../../components/teacher/TeacherCard';
// import StudentList from '../../components/teacher/Studentlist';
// import PostList from '../../components/home/PostList';

// interface Student {
//   id: number;
//   name: string;
//   role: string;
//   avatar: string;
// }

// interface Post {
//   id: number;
//   author: string;
//   content: string;
//   likes: number;
//   comments: number;
// }

// export default function TeacherPage() {
//   const { user } = useAuth();
//   const [students, setStudents] = useState<Student[]>([]);
//   const [posts, setPosts] = useState<Post[]>([]);

//   useEffect(() => {
//     // Simulación temporal — reemplazalo luego con peticiones a tu backend
//     setStudents([
//       { id: 1, name: 'Laura Martínez', role: 'Full Stack', avatar: '/avatars/laura.png' },
//       { id: 2, name: 'Pedro Sánchez', role: 'Frontend', avatar: '/avatars/pedro.png' },
//       { id: 3, name: 'Sofía López', role: 'Data Science', avatar: '/avatars/sofia.png' },
//     ]);

//     setPosts([
//       { id: 1, author: 'Pedro Sánchez', content: 'Excelente trabajo con React 💪', likes: 15, comments: 3 },
//       { id: 2, author: 'Sofía López', content: 'Aprendí hooks esta semana 🔥', likes: 24, comments: 6 },
//     ]);
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-100 text-gray-900 px-8 py-6">
//       <section className="max-w-6xl mx-auto space-y-8">
//         {/* Header del profesor */}
//         <TeacherCard name={user?.name || 'Profesor'} role={user?.role || 'Docente'} />

//         {/* Lista de alumnos */}
//         <section>
//           <h2 className="text-xl font-semibold mb-4">👩‍🎓 Mis alumnos</h2>
//           <StudentList students={students} />
//         </section>

//         {/* Publicaciones recientes */}
//         <section>
//           <h2 className="text-xl font-semibold mb-4">📰 Publicaciones recientes</h2>
//           <PostList posts={posts} />
//         </section>
//       </section>
//     </main>
//   );
// }
export default function TeacherPage() {
  return <div>Teacher Page</div>;
}
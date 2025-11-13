import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "../context/AuthContext";
import {PostProvider} from "../context/PostContext";
import {AlertProvider} from "../context/AlertContext";
import {NotificationProvider} from "../context/NotificationContext";
import {ChatProvider} from "../context/ChatContext";
import Nav from "../components/nav/Nav";
import FloatingChatButton from "../components/chat/FloatingChatButton";

// Importar herramientas de desarrollo del chat (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  import("../utils/chatDevTools");
}

const inter = Inter({subsets: ["latin"], display: "swap"});

export const metadata: Metadata = {
  title: "somosHenry - Conectá. Aprendé. Crecé.",
  description:
    "La comunidad educativa donde estudiantes y docentes se conectan, comparten conocimiento y construyen el futuro de la tecnología juntos.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-black dark:bg-gray-900 dark:text-white`}>
        <AlertProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <PostProvider>
                  <Nav />
                  {children}
                  <FloatingChatButton />
                </PostProvider>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}

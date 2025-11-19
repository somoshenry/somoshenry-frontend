"use client";
import {useState} from "react";
import {useAuth} from "@/hook/useAuth";
import {getUsers, getPosts} from "@/services/adminService";
import {Bug, Play, CheckCircle, XCircle} from "lucide-react";

export default function DebugPanel() {
  const {user} = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults: any[] = [];

    // Test 1: Usuario autenticado
    testResults.push({
      test: "Usuario autenticado",
      success: !!user,
      data: user ? {email: user.email, role: user.role} : null,
    });

    // Test 2: GET /users
    try {
      const usersData = await getUsers({page: 1, limit: 5});
      testResults.push({
        test: "GET /users",
        success: true,
        data: {total: usersData.total, count: usersData.users.length},
      });
    } catch (error: any) {
      testResults.push({
        test: "GET /users",
        success: false,
        error: error.response?.data?.message || error.message,
      });
    }

    // Test 3: GET /posts
    try {
      const postsData = await getPosts({page: 1, limit: 5});
      testResults.push({
        test: "GET /posts",
        success: true,
        data: {total: postsData.total, count: postsData.posts.length},
      });
    } catch (error: any) {
      testResults.push({
        test: "GET /posts",
        success: false,
        error: error.response?.data?.message || error.message,
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-[#ffff00] dark:border-yellow-600 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Bug className="text-yellow-600 dark:text-[#ffff00]" size={24} />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Panel de Debug</h2>
      </div>

      <button
        onClick={runTests}
        disabled={testing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors mb-4"
      >
        <Play size={16} />
        {testing ? "Ejecutando tests..." : "Ejecutar tests de conexión"}
      </button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <span className="font-semibold text-gray-900 dark:text-white">{result.test}</span>
              </div>
              {result.data && (
                <pre className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <div className="text-sm text-red-600 dark:text-red-400 font-mono">Error: {result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { toast } from "../../../web/lib/toast";

interface DbUser {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);

  const fetchUsers = async () => {
    try {
      const resp = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const json = await resp.json();
        setUsers(json.data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const resp = await fetch(`/api/admin/users?userId=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setUsers((u) => u.filter((x) => x.id !== id));
        toast.success("Deleted");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  useEffect(() => {
    if (authed) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Token</h1>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-4"
            placeholder="Enter token"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full py-3 bg-primary text-white rounded-md hover:opacity-90"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return <p className="p-6 text-center text-gray-400">Loading...</p>;
  }

  return (
    <main className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Email</th>
            <th className="p-2">Display Name</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800">
              <td className="p-2 text-xs break-all">{u.id}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.display_name || "-"}</td>
              <td className="p-2 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(u.id)}
                  className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
} 
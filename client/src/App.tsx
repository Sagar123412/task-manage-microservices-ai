import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/users");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as User[];
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load users");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1>Users</h1>
      {error && <p className="error">{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <strong>{u.name}</strong>
            <span>
              {" "}
              — {u.email} ({u.role})
            </span>
          </li>
        ))}
      </ul>
      {users.length === 0 && !error && <p>No users yet. Start the gateway and users-service.</p>}
    </main>
  );
}

"use client";

import { session } from "@/lib/auth";

import { useSession } from "@/lib/react";

export default function Home() {
  const { data, status } = useSession();
  // const { status, data } = await session();

  return (
    <div>
      <h1>Home</h1>
      <p>Status: {status}</p>
      <p>User: {JSON.stringify(data)}</p>
    </div>
  );
}

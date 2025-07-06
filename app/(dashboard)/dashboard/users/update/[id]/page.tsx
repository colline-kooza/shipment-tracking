import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div className="p-8">
      <h2>Users Detailed Page</h2>
    </div>
  );
}

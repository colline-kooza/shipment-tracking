import ResetPasswordForm from "@/components/Forms/ResetPasswordForm";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import React from "react";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const email = (await searchParams).email;
  const token = (await searchParams).token as string;
  return (
    <GridBackground>
      <div className="px-4">
        <ResetPasswordForm email={email as string} token={token} />
      </div>
    </GridBackground>
  );
}

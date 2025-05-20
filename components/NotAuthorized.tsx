"use client";
import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotAuthorized = () => (
  <div className="min-h-96 flex items-center justify-center p-4  ">
    <div className="text-center max-w-xl mx-auto space-y-6">
      {/* Icon and Title */}
      <div className="space-y-4">
        <div className="relative mx-auto w-24 h-24">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse" />
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
        <p className="text-slate-600 text-lg">
          You don't have sufficient permissions to access this page.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-sm text-slate-500 pt-4">
        If you believe this is a mistake, please contact your administrator.
      </p>
    </div>
  </div>
);

export default NotAuthorized;

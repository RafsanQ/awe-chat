"use client";
import { useEffect } from "react";

export default function Error({
  error
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-background">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong.
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Something unexpected happened. Please try again later.
        </p>
        <p className="text-red-700 dark:text-blue-200">{error.message}</p>
      </div>
    </div>
  );
}

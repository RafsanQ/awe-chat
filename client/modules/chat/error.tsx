"use client";

interface Props {
  heading: string;
  description: string;
}

export default function ErrorComponent(props: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-background">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {props.heading}
        </h1>
        <p className="text-red-700 dark:text-blue-200">{props.description}</p>
      </div>
    </div>
  );
}

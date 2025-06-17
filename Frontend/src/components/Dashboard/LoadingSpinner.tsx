import React from "react";

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <p className="mt-6 text-lg text-muted-foreground font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

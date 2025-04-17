'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// This file has intentional formatting issues to test Prettier and ESLint
const TestFormatting: React.FC = () => {
  const [count, setCount] = useState(0);

  // Function with bad formatting
  const handleClick = () => {
    setCount(count + 1);
  };

  // JSX with bad formatting
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Test Formatting</h1>
      <p>Count: {count}</p>
      <Button
        variant="default"
        onClick={handleClick}
        className="transition-transform hover:scale-105"
      >
        Increment
      </Button>
    </div>
  );
};

export default TestFormatting;

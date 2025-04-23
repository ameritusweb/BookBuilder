import React, { useEffect } from 'react';
import { BookBuilder } from '@components/BookBuilder';
import { configureMathJax } from '@utils/mathConfig';

function App() {

  useEffect(() => {
    configureMathJax().then(() => {
      console.log('MathJax configured for SVG output');
    });
  }, []);

  return (
      <BookBuilder />
  );
}

export default App;
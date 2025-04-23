import html2canvas from 'html2canvas';

// src/utils/mathConfig.js
export const configureMathJax = () => {
    return new Promise((resolve) => {
      // Load MathJax with SVG output
      window.MathJax = {
        loader: {
          load: ['input/tex', 'output/svg']
        },
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        svg: {
          fontCache: 'global',
          scale: 1,                    // global scaling factor
          minScale: .5,               // smallest scaling factor
          mtextInheritFont: false,    // make text elements use svg font
          merrorInheritFont: true,    // make error text use svg font
          mathmlSpacing: false,       // use MathML spacing rules
          skipAttributes: {},         // RFDa and other attributes to skip
          exFactor: .5,              // default size of ex in em units
          displayAlign: 'center',     // default for indentalign when set to 'auto'
          displayIndent: '0',         // default for indentshift when set to 'auto'
          useFontCache: true,        // use <use> elements to re-use font paths
          useGlobalCache: true       // store cached font paths globally
        },
        startup: {
          ready: () => {
            MathJax.startup.defaultReady();
            resolve();
          }
        }
      };
  
      // Load MathJax script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      document.head.appendChild(script);
    });
  };
  
  // Helper function to convert math to SVG
  // src/utils/mathConfig.js
export const convertMathToSVG = async (mathText) => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.visibility = 'visible';
      container.style.position = 'absolute';
      container.style.left = '-10000px'; // Move it off-screen instead of hiding
      container.innerHTML = mathText;
      document.body.appendChild(container);
  
      // Wait for MathJax to process the math
      await MathJax.typesetPromise([container]);
  
       // Get the complete rendered output from MathJax
    const mjxContainer = container.querySelector('mjx-container');
    
    if (!mjxContainer) {
      document.body.removeChild(container);
      return null;
    }

    return new Promise(async (resolve, reject) => {
        try {

          // 1. Find the global SVG cache and its defs
          const globalCache = document.getElementById('MJX-SVG-global-cache');
          if (!globalCache) {
            console.warn("MJX-SVG-global-cache not found. Attempting capture without cloning defs.");
            const canvas = await html2canvas(mjxContainer);
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            document.body.removeChild(container);
            resolve(dataUrl);
            return;
          }
  
          const globalDefs = globalCache.querySelector('defs');
          if (!globalDefs) {
            console.warn("Defs not found in MJX-SVG-global-cache. Attempting capture without cloning defs.");
            const canvas = await html2canvas(mjxContainer);
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            document.body.removeChild(container);
            resolve(dataUrl);
            return;
          }
  
          // 2. Find the target SVG within the specific container
          const targetSvg = mjxContainer.querySelector('svg');
          if (!targetSvg) {
            document.body.removeChild(container);
            reject(new Error("SVG element not found within the target mjx-container."));
            return;
          }

          const originalWidth = targetSvg.getAttribute('width');
        const originalHeight = targetSvg.getAttribute('height');
  
          // 3. Clone the defs (deep clone)
          const clonedDefs = globalDefs.cloneNode(true);
  
          // 4. Insert the cloned defs into the target SVG
          targetSvg.prepend(clonedDefs);
  
          // 5. Capture the container with html2canvas
          const canvas = await html2canvas(mjxContainer, {
            logging: true,
            backgroundColor: 'white',
            scale: 2 // Increase resolution
          });
  
          // 6. Clean up: Remove the cloned defs
          try {
            targetSvg.removeChild(clonedDefs);
          } catch (e) {
            console.warn('Error cleaning up cloned defs:', e);
          }
  
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          document.body.removeChild(container);
          resolve({
            dataUrl,
            dimensions: {
              width: parseFloat(originalWidth),
              height: parseFloat(originalHeight),
              units: 'ex'
            }
          });
  
        } catch (error) {
          // Clean up on error
          try {
            const targetSvg = mjxContainer?.querySelector('svg');
            const clonedDefs = targetSvg?.querySelector('defs');
            if (clonedDefs) {
              targetSvg.removeChild(clonedDefs);
            }
          } catch (e) {
            /* Ignore cleanup error */
          }
  
          document.body.removeChild(container);
          reject(error);
        }
      });
  
    } catch (error) {
      console.error('Error in SVG conversion:', error);
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      return null;
    }
  };
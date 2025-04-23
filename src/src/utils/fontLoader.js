/**
 * Fetches a file from a URL and converts it to a Base64 string.
 * @param {string} url - The URL of the file to fetch.
 * @returns {Promise<string>} A promise that resolves with the Base64 encoded string (without the data URI prefix).
 */
async function fileUrlToBase64(url) {
    try {
      // 1. Fetch the file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // 2. Get the response body as a Blob
      const blob = await response.blob();
  
      // 3. Use FileReader to convert Blob to Base64 Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onloadend = () => {
          // result contains the Data URL string (e.g., "data:font/ttf;base64,Abc...")
          const base64String = reader.result
            .replace('data:', '') // Remove "data:"
            .replace(/^.+,/, ''); // Remove the mime type and the comma (e.g., "font/ttf;base64,")
          resolve(base64String);
        };
  
        reader.onerror = (error) => {
          reject(error);
        };
  
        // Start reading the Blob as a Data URL
        reader.readAsDataURL(blob);
      });
  
    } catch (error) {
      console.error("Failed to convert file URL to Base64:", error);
      throw error; // Re-throw the error for further handling if needed
    }
  }
  
  // --- Example Usage ---
  async function loadAndUseFontBase64(fontUrl, fileName) {
    try {
      console.log('Fetching font from URL:', fontUrl);
      const base64Font = await fileUrlToBase64(fontUrl);
  
      console.log('Base64 Encoded Font:');
      // Log a snippet, as the full string can be very long
      console.log(base64Font.substring(0, 100) + '...');
  
      pdfMake.vfs[fileName] = base64Font;
  
    } catch (error) {
      console.error('Error loading font:', error);
    }
  }

  export default loadAndUseFontBase64;
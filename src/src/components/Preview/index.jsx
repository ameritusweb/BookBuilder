import React, { useState, useEffect } from 'react';

const PAGE_HEIGHT = 1200; // Arbitrary pixel height for content calculations

const getEntryHeight = (entry) => {
  // Rough estimation of entry heights
  switch (entry.type) {
    case 'code':
      return 200;
    case 'math':
      return 150;
    default:
      return 100;
  }
};

const getCurrentPageHeight = (content) => {
  return content.reduce((height, entry) => height + getEntryHeight(entry), 0);
};

const PreviewPage = ({ page = {}, zoom = 100 }) => {
  // Ensure we have default values
  const {
    header = 'COMPUTATIONAL MINDS',
    content = [],
    pageNumber = 1
  } = page;

  return (
    <div 
      className="preview-page bg-white shadow-lg relative"
      style={{
        width: '6in',
        height: '9in',
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center'
      }}
    >
      {/* Header */}
      <div className="p-8">
        <div className="text-sm text-gray-500 text-center mb-8">
          {header}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {content.map((entry, index) => {
            if (!entry) return null;

            switch (entry.type) {
              case 'chapter-title':
                return (
                  <div key={index} className="text-center mb-16">
                    <h1 className="text-3xl font-bold mb-4">{entry.title}</h1>
                    <h2 className="text-xl">{entry.subtitle}</h2>
                  </div>
                );
              case 'code':
                return (
                  <div key={index} className="code-container">
                    <div className="section-header">
                      <span className="section-marker">λ</span>
                      <span className="section-number">Code {entry.codeNumber}</span>
                    </div>
                    <pre className="code-block">
                      <code>{entry.text}</code>
                    </pre>
                  </div>
                );
              case 'math':
                return (
                  <div key={index} className="math-container">
                    <div className="section-header">
                      <span className="section-marker">∑</span>
                      <span className="section-number">Equation {entry.mathNumber}</span>
                    </div>
                    <div className="math-display">{entry.text}</div>
                  </div>
                );
              default:
                return (
                  <div key={index} className={`dialogue-entry ${entry.speaker?.toLowerCase() || ''}`}>
                    {entry.speaker && <div className="speaker">{entry.speaker}</div>}
                    <div>{entry.text}</div>
                  </div>
                );
            }
          })}
        </div>
      </div>

      {/* Page Number */}
      <div className="absolute bottom-8 w-full text-center text-sm text-gray-500">
        {pageNumber}
      </div>
    </div>
  );
};

const PreviewControl = ({ 
  pages = [], 
  currentPage = 0, 
  setCurrentPage = () => {}, 
  previewMode = 'spread', 
  setPreviewMode = () => {}, 
  zoom = 100, 
  setZoom = () => {} 
}) => (
  <div className="sticky top-0 z-10 bg-white border-b mb-4 p-4 flex items-center justify-between">
    <div className="flex items-center space-x-6">
      <select 
        value={previewMode}
        onChange={(e) => setPreviewMode(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="spread">Two-Page Spread</option>
        <option value="single">Single Page</option>
        <option value="continuous">Continuous</option>
      </select>

      <div className="flex items-center space-x-2">
        <input 
          type="range" 
          min="50" 
          max="150" 
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm">{zoom}%</span>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <button 
        onClick={() => setCurrentPage(0)}
        className="px-3 py-1 bg-blue-500 text-white rounded"
        disabled={currentPage === 0}
      >
        First
      </button>
      <button 
        onClick={() => setCurrentPage(Math.max(0, currentPage - (previewMode === 'spread' ? 2 : 1)))}
        className="px-3 py-1 bg-blue-500 text-white rounded"
        disabled={currentPage === 0}
      >
        Previous
      </button>
      <span>
        Page {currentPage + 1} of {pages.length || 1}
      </span>
      <button 
        onClick={() => setCurrentPage(Math.min((pages.length || 1) - 1, currentPage + (previewMode === 'spread' ? 2 : 1)))}
        className="px-3 py-1 bg-blue-500 text-white rounded"
        disabled={currentPage >= (pages.length || 1) - 1}
      >
        Next
      </button>
      <button 
        onClick={() => setCurrentPage((pages.length || 1) - 1)}
        className="px-3 py-1 bg-blue-500 text-white rounded"
        disabled={currentPage >= (pages.length || 1) - 1}
      >
        Last
      </button>
    </div>
  </div>
);

const Preview = ({ chapters = [] }) => {
  const [pages, setPages] = useState([{
    header: 'VECTOR NEURAL NETWORKS',
    content: [],
    pageNumber: 1
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [previewMode, setPreviewMode] = useState('spread');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (chapters.length > 0) {
      const calculatedPages = chapters.flatMap((chapter, chapterIndex) => {
        const chapterPages = [];
        
        // Add chapter title page
        chapterPages.push({
          header: chapter.title,
          content: [{
            type: 'chapter-title',
            title: chapter.title,
            subtitle: chapter.subtitle
          }],
          pageNumber: chapterPages.length + 1,
          isChapterStart: true
        });

        let currentPageContent = [];
        let codeCount = 0;
        let mathCount = 0;

        chapter.dialogue.forEach((entry) => {
          if (entry.type === 'code') codeCount++;
          if (entry.type === 'math') mathCount++;

          const numberedEntry = {
            ...entry,
            codeNumber: entry.type === 'code' ? `${chapterIndex + 1}.${codeCount}` : null,
            mathNumber: entry.type === 'math' ? `${chapterIndex + 1}.${mathCount}` : null
          };

          // Very simple page break logic - could be enhanced
          if (currentPageContent.length >= 5) {
            chapterPages.push({
              header: chapterPages.length % 2 === 0 ? 'VECTOR NEURAL NETWORKS' : chapter.title,
              content: currentPageContent,
              pageNumber: chapterPages.length + 1
            });
            currentPageContent = [numberedEntry];
          } else {
            currentPageContent.push(numberedEntry);
          }
        });

        // Add remaining content
        if (currentPageContent.length > 0) {
          chapterPages.push({
            header: chapterPages.length % 2 === 0 ? 'VECTOR NEURAL NETWORKS' : chapter.title,
            content: currentPageContent,
            pageNumber: chapterPages.length + 1
          });
        }

        return chapterPages;
      });

      setPages(calculatedPages);
    }
  }, [chapters]);

  return (
    <div className="preview-container">
      <PreviewControl 
        pages={pages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        zoom={zoom}
        setZoom={setZoom}
      />

      <div className="preview-content">
        {previewMode === 'spread' ? (
          <div className="flex justify-center space-x-8">
            <PreviewPage page={pages[currentPage]} zoom={zoom} />
            {currentPage < pages.length - 1 && (
              <PreviewPage page={pages[currentPage + 1]} zoom={zoom} />
            )}
          </div>
        ) : previewMode === 'single' ? (
          <div className="flex justify-center">
            <PreviewPage page={pages[currentPage]} zoom={zoom} />
          </div>
        ) : (
          <div className="space-y-8">
            {pages.map((page, index) => (
              <div key={index} className="flex justify-center">
                <PreviewPage page={page} zoom={zoom} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
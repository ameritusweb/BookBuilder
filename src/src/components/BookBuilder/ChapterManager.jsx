// src/components/BookBuilder/ChapterManager.jsx
import React from 'react';

const ChapterManager = ({
  chapters,
  currentChapter,
  setCurrentChapter,
  addChapter,
  updateChapter
}) => {
  const currentChapterData = chapters.find(c => c.id === currentChapter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => setCurrentChapter(chapter.id)}
              className={`px-3 py-1 rounded ${
                currentChapter === chapter.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Chapter {chapter.id}
            </button>
          ))}
        </div>
        <button
          onClick={addChapter}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Chapter
        </button>
      </div>

      {currentChapterData && (
        <div className="space-y-4">
          <input
            type="text"
            value={currentChapterData.title}
            onChange={(e) => updateChapter(currentChapter, { title: e.target.value })}
            className="w-full p-2 text-2xl font-bold border rounded"
            placeholder="Chapter Title"
          />
          <input
            type="text"
            value={currentChapterData.subtitle}
            onChange={(e) => updateChapter(currentChapter, { subtitle: e.target.value })}
            className="w-full p-2 text-xl border rounded"
            placeholder="Chapter Subtitle"
          />
        </div>
      )}
    </div>
  );
};

export default ChapterManager;
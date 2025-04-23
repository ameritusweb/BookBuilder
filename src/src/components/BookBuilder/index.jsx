// src/components/BookBuilder/index.jsx
import React, { useState, useEffect } from 'react';
import { loadChapters, saveChapters } from '@utils/storage';
import DialogueInput from './DialogueInput';
import ChapterManager from './ChapterManager';
import Preview from '@components/Preview';
import { generatePDF } from '@utils/pdfExport';

export const BookBuilder = () => {
  const [chapters, setChapters] = useState(() => loadChapters());
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    saveChapters(chapters);
  }, [chapters]);

  const addChapter = () => {
    const newId = Math.max(...chapters.map(c => c.id)) + 1;
    setChapters(prev => [...prev, {
      id: newId,
      title: `Chapter ${newId}`,
      subtitle: `New Chapter`,
      dialogue: []
    }]);
    setCurrentChapter(newId);
  };

  const updateChapter = (id, updates) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === id ? { ...chapter, ...updates } : chapter
    ));
  };

  const addDialogue = (entry) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === currentChapter
        ? {
            ...chapter,
            dialogue: [...chapter.dialogue, entry]
          }
        : chapter
    ));
  };

  const removeDialogue = (chapterId, index) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === chapterId
        ? {
            ...chapter,
            dialogue: chapter.dialogue.filter((_, i) => i !== index)
          }
        : chapter
    ));
  };

  const currentChapterData = chapters.find(c => c.id === currentChapter);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Book Builder</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => generatePDF(chapters)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Export PDF
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      <div className={showPreview ? 'grid grid-cols-2 gap-8' : 'block'}>
        <div className="space-y-8">
          <ChapterManager
            chapters={chapters}
            currentChapter={currentChapter}
            setCurrentChapter={setCurrentChapter}
            addChapter={addChapter}
            updateChapter={updateChapter}
          />

          {currentChapterData && (
            <DialogueInput
              onSubmit={addDialogue}
              onRemove={(index) => removeDialogue(currentChapter, index)}
              entries={currentChapterData.dialogue}
            />
          )}
        </div>

        {showPreview && (
          <div className="border-l pl-8">
            <Preview chapters={chapters} />
          </div>
        )}
      </div>
    </div>
  );
};
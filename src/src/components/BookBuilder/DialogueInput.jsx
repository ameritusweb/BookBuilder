// src/components/BookBuilder/DialogueInput.jsx
import React, { useState } from 'react';

const DialogueInput = ({ onSubmit, onRemove, entries = [] }) => {
  const [newEntry, setNewEntry] = useState({
    type: 'text',
    speaker: 'You',
    text: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.text.trim()) return;

    onSubmit(newEntry);
    setNewEntry(prev => ({ ...prev, text: '' }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <select
            value={newEntry.type}
            onChange={(e) => setNewEntry(prev => ({
              ...prev,
              type: e.target.value,
              speaker: e.target.value === 'text' ? prev.speaker : undefined
            }))}
            className="p-2 border rounded"
          >
            <option value="text">Dialogue</option>
            <option value="code">Code Block</option>
            <option value="math">Math Equation</option>
          </select>

          {newEntry.type === 'text' && (
            <select
              value={newEntry.speaker}
              onChange={(e) => setNewEntry(prev => ({ ...prev, speaker: e.target.value }))}
              className="p-2 border rounded"
            >
              <option value="You">You</option>
              <option value="Alan">Alan</option>
            </select>
          )}
        </div>

        {newEntry.type === 'code' ? (
          <textarea
            value={newEntry.text}
            onChange={(e) => setNewEntry(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Enter C# code..."
            className="w-full h-32 p-2 font-mono text-sm border rounded"
          />
        ) : (
          <input
            type="text"
            value={newEntry.text}
            onChange={(e) => setNewEntry(prev => ({ ...prev, text: e.target.value }))}
            placeholder={
              newEntry.type === 'math' 
                ? 'Enter LaTeX math (e.g. $x^2 + y^2 = r^2$)' 
                : 'Enter dialogue...'
            }
            className="w-full p-2 border rounded"
          />
        )}

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Entry
        </button>
      </form>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded">
            <div>
              {entry.type === 'code' ? (
                <pre className="font-mono text-sm">{entry.text}</pre>
              ) : entry.type === 'math' ? (
                <div className="italic">{entry.text}</div>
              ) : (
                <div>
                  <span className="font-medium">{entry.speaker}: </span>
                  {entry.text}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogueInput;
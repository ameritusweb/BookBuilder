// src/utils/storage.js
const STORAGE_KEY = 'book-chapters';

export const saveChapters = (chapters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
    return true;
  } catch (error) {
    console.error('Error saving chapters:', error);
    return false;
  }
};

export const loadChapters = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefaultChapters();
  } catch (error) {
    console.error('Error loading chapters:', error);
    return getDefaultChapters();
  }
};

export const getDefaultChapters = () => [{
  id: 1,
  title: "Computational Minds",
  subtitle: "Chapter 1: The Shape of Belief",
  dialogue: []
}];

export const exportChapters = (chapters) => {
  const json = JSON.stringify(chapters, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'book-chapters.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importChapters = async (file) => {
  try {
    const text = await file.text();
    const chapters = JSON.parse(text);
    saveChapters(chapters);
    return chapters;
  } catch (error) {
    console.error('Error importing chapters:', error);
    throw new Error('Invalid chapter file format');
  }
};
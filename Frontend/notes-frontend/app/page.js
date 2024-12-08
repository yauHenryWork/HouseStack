"use client";

import React, { useEffect, useState } from "react";
import { fetchNotes, createNote, updateNote, deleteNote } from "./api";

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateDarkMode = () => setIsDarkMode(darkModeQuery.matches);

    updateDarkMode();
    darkModeQuery.addEventListener("change", updateDarkMode);

    return () => darkModeQuery.removeEventListener("change", updateDarkMode);
  }, []);

  return [isDarkMode, setIsDarkMode];
};

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: "", content: "" });
  const [isAddNote, setIsAddNote] = useState(false);
  const [isSortedAsc, setIsSortedAsc] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode] = useDarkMode();

  useEffect(() => {
    const loadNotes = async () => {
      const data = await fetchNotes();
      const sortedNotes = data
        .map(note => ({
          id: note._id,
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Default to ascending
      setNotes(sortedNotes);
    };

    loadNotes();
  }, []);

  const handleSortByCreated = () => {
    setNotes(prevNotes =>
      [...prevNotes].sort((a, b) =>
        isSortedAsc
          ? new Date(b.createdAt) - new Date(a.createdAt) // Descending
          : new Date(a.createdAt) - new Date(b.createdAt) // Ascending
      )
    );
    setIsSortedAsc(!isSortedAsc);
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (isAddNote) {
        const newNote = await createNote(currentNote);
        setNotes(prevNotes => [...prevNotes, newNote]);
      } else {
        await updateNote(currentNote.id, currentNote);
        setNotes(prevNotes =>
          prevNotes.map(note => (note.id === currentNote.id ? currentNote : note))
        );
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save the note:", error.message);
      alert("Failed to save the note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!id || !confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error("Failed to delete the note:", error.message);
      alert("Failed to delete the note. Please try again.");
    }
  };

  const openModal = (note = { id: null, title: "", content: "" }, isAdd = true) => {
    setCurrentNote(note);
    setIsAddNote(isAdd);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentNote({ id: null, title: "", content: "" });
    setIsSaving(false);
  };

  return (
    <div
      className={`min-h-screen p-4 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center w-full">Notes</h1>
        <button
          onClick={handleSortByCreated}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Sort by Created ({isSortedAsc ? "Asc" : "Desc"})
        </button>
      </div>

      {/* Notes List */}
      <ul className="space-y-4">
        {notes.map(note => (
          <li
            key={note.id}
            className={`p-6 rounded-lg shadow-md flex justify-between items-center transition duration-300 hover:shadow-lg ${
              isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold">
                <span className="text-blue-500">Title:</span> {note.title}
              </h3>
              <p className="text-base">
                <span className="font-semibold text-gray-500">Content:</span> {note.content}
              </p>
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Created At:</span>{" "}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(note, false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Empty Spacer to Avoid Overlap with Floating Add Button */}
      <div className="h-16"></div>

      {/* Floating Add Button */}
      <button
        onClick={() => openModal()}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center text-3xl"
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              {isAddNote ? "Add Note" : "Edit Note"}
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="mb-4">
                <label className="block mb-2 font-semibold" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={currentNote.title}
                  onChange={e =>
                    setCurrentNote(prev => ({ ...prev, title: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  value={currentNote.content}
                  onChange={e =>
                    setCurrentNote(prev => ({ ...prev, content: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                  required
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 transition duration-300"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
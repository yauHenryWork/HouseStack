"use client";

import React, { useEffect, useState } from "react";
import { fetchNotes, createNote, updateNote, deleteNote } from "./api";

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const handleThemeChange = (event) => setIsDarkMode(event.matches);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleThemeChange);

    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  return isDarkMode;
};

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    id: null,
    title: "",
    content: "",
  });
  const [isAddNote, setIsAddNote] = useState(false);
  const [isSortedAsc, setIsSortedAsc] = useState(true); // New state for sorting
  const isDarkMode = useDarkMode();

  useEffect(() => {
    const loadNotes = async () => {
      const data = await fetchNotes();
      const mappedNotes = data.map((note) => ({
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
      }));
      setNotes(mappedNotes);
    };

    loadNotes();
  }, []);

  const handleSortByCreated = () => {
    // Toggle sorting order
    setIsSortedAsc((prev) => !prev);

    // Sort notes based on `createdAt`
    setNotes((prevNotes) =>
      [...prevNotes].sort((a, b) =>
        isSortedAsc
          ? new Date(a.createdAt) - new Date(b.createdAt) // Ascending
          : new Date(b.createdAt) - new Date(a.createdAt) // Descending
      )
    );
  };

  const handleEditClick = (note) => {
    setIsAddNote(false);
    setCurrentNote(note);
    setIsModalOpen(true);
  };

  const handleAddNoteClick = () => {
    setIsAddNote(true);
    setCurrentNote({ id: null, title: "", content: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNote({ id: null, title: "", content: "" });
  };

  const handleSave = async () => {
    if (isAddNote) {
      const newNote = await createNote(currentNote);
      setNotes((prevNotes) => [...prevNotes, newNote]);
    } else {
      await updateNote(currentNote.id, currentNote);
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === currentNote.id ? currentNote : note
        )
      );
    }

    handleCloseModal();
  };

  const handleDelete = async (id) => {
    console.log("Deleting note with ID:", id);
    if (!id) {
      console.error("Error: ID is undefined. Cannot delete note.");
      alert("Failed to delete note. No ID provided.");
      return;
    }

    try {
      if (confirm("Are you sure you want to delete this note?")) {
        await deleteNote(id);
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete the note:", error.message);
      alert("Failed to delete the note. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
        color: isDarkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        {/* Sort Button */}
        <button
          onClick={handleSortByCreated}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          title={`Sort by Created (${isSortedAsc ? "Asc" : "Desc"})`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill={isDarkMode ? "#ffffff" : "#000000"}
            viewBox="0 0 24 24"
            style={{
              transform: isSortedAsc ? "rotate(0deg)" : "rotate(180deg)", // Flip for descending
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M12 2L19 9H5L12 2ZM12 22L5 15H19L12 22Z" />
          </svg>
        </button>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            margin: 0,
          }}
        >
          Notes
        </h1>
      </div>

      <ul
        style={{
          paddingBottom: "4rem",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {notes.map((note) => (
          <li
            key={note.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#000000",
              border: `1px solid ${isDarkMode ? "#333333" : "#dddddd"}`,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>{note.title}</h3>
              <p
                style={{ margin: 0, color: isDarkMode ? "#aaaaaa" : "#555555" }}
              >
                {note.content}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleEditClick(note)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isDarkMode ? "#0070f3" : "#0070f3",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: isDarkMode ? "#ff4d4d" : "#ff4d4d",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Floating Add Button */}
      <button
        onClick={handleAddNoteClick}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "60px",
          height: "60px",
          backgroundColor: "#0070f3",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          cursor: "pointer",
          fontSize: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        +
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
          }}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#000000",
              padding: "2rem",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.3s ease-in-out",
              transform: "scale(1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1rem",
                textAlign: "center",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              {isAddNote ? "Add Note" : "Edit Note"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="title"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: isDarkMode ? "#aaaaaa" : "#333333",
                  }}
                >
                  Title:
                </label>
                <input
                  type="text"
                  id="title"
                  value={currentNote.title}
                  onChange={(e) =>
                    setCurrentNote((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: `1px solid ${isDarkMode ? "#333333" : "#dddddd"}`,
                    borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#2b2b2b" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#000000",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="content"
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: isDarkMode ? "#aaaaaa" : "#333333",
                  }}
                >
                  Content:
                </label>
                <textarea
                  id="content"
                  value={currentNote.content}
                  onChange={(e) =>
                    setCurrentNote((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: `1px solid ${isDarkMode ? "#333333" : "#dddddd"}`,
                    borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#2b2b2b" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#000000",
                    minHeight: "100px",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: isDarkMode ? "#333333" : "#dddddd",
                    color: isDarkMode ? "#ffffff" : "#000000",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0070f3",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                >
                  Save
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
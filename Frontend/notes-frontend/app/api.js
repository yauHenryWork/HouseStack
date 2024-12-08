import axios from "axios";

const API_BASE_URL = "http://localhost:8000/notes/"; 

export const fetchNotes = async () => {
  const response = await axios.get(`${API_BASE_URL}`);
//   console.log('fetchNotes' + JSON.stringify(response.data));
  return response.data;
};

export const createNote = async (note) => {
  const response = await axios.post(`${API_BASE_URL}`, note);
  return response.data;
};

export const updateNote = async (id, note) => {
  const response = await axios.put(`${API_BASE_URL}${id}`, note);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}${id}`);
  return response.data;
};
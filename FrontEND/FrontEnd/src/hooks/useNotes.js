import { useState, useCallback } from 'react';
import { notesAPI } from '../services/api';

export const useNotes = () => {
  const [allNotes, setAllNotes] = useState([]);     // Full list for counts
  const [currentNotes, setCurrentNotes] = useState([]); // Filtered notes for current view
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── Fetch ALL notes (for accurate counts) ── */
  const fetchAllNotes = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        notesAPI.getNotes({ archived: false }),
        notesAPI.getNotes({ archived: true })
      ]);

      const combined = [
        ...(activeRes.data.notes || []),
        ...(archivedRes.data.notes || [])
      ];

      setAllNotes(combined);
    } catch (err) {
      console.error('Fetch all notes error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch notes for current tab/view ── */
  const fetchNotes = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await notesAPI.getNotes(filters);
      const fetchedNotes = response.data.notes || [];
      setCurrentNotes(fetchedNotes);   // ← This was missing
      return fetchedNotes;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notes');
      console.error('Fetch notes error:', err);
      setCurrentNotes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── CRUD Operations (update both allNotes and currentNotes) ── */
  const createNote = useCallback(async (title, content, type = 'note') => {
    try {
      const response = await notesAPI.createNote(title, content, type);
      const newNote = response.data.note;
      
      setAllNotes(prev => [newNote, ...prev]);
      setCurrentNotes(prev => [newNote, ...prev]); // also update current view
      
      return newNote;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create note');
      throw err;
    }
  }, []);

  const updateNote = useCallback(async (id, title, content, color) => {
    try {
      const response = await notesAPI.updateNote(id, title, content, color);
      const updated = response.data.note;

      setAllNotes(prev => prev.map(n => n.id === id ? updated : n));
      setCurrentNotes(prev => prev.map(n => n.id === id ? updated : n));

      return updated;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update note');
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    try {
      await notesAPI.deleteNote(id);
      setAllNotes(prev => prev.filter(n => n.id !== id));
      setCurrentNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete note');
      throw err;
    }
  }, []);

  const togglePin = useCallback(async (id) => {
    try {
      const response = await notesAPI.togglePin(id);
      const updated = response.data.note;
      setAllNotes(prev => prev.map(n => n.id === id ? updated : n));
      setCurrentNotes(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle pin');
      throw err;
    }
  }, []);

  const toggleArchive = useCallback(async (id) => {
    try {
      const response = await notesAPI.toggleArchive(id);
      const updated = response.data.note;
      setAllNotes(prev => prev.map(n => n.id === id ? updated : n));
      setCurrentNotes(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle archive');
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const response = await notesAPI.toggleFavorite(id);
      const updated = response.data.note;
      setAllNotes(prev => prev.map(n => n.id === id ? updated : n));
      setCurrentNotes(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle favorite');
      throw err;
    }
  }, []);

  const restoreNote = useCallback(async (id) => {
    try {
      const response = await notesAPI.restoreNote(id);
      const restored = response.data.note;
      setAllNotes(prev => [restored, ...prev.filter(n => n.id !== id)]);
      return restored;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to restore note');
      throw err;
    }
  }, []);

  const fetchDeletedNotes = useCallback(async () => {
    try {
      const response = await notesAPI.getDeletedNotes();
      return response.data.notes;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch deleted notes');
      throw err;
    }
  }, []);

  const permanentlyDeleteNote = useCallback(async (id) => {
    try {
      await notesAPI.permanentlyDeleteNote(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to permanently delete note');
      throw err;
    }
  }, []);

  return {
    notes: currentNotes,      // ← This is what Dashboard uses for display
    allNotes,
    loading,
    error,
    fetchNotes,
    fetchAllNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    toggleFavorite,
    restoreNote,
    fetchDeletedNotes,
    permanentlyDeleteNote,
  };
};
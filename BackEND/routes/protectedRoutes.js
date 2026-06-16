const express = require('express');
const authenticateToken = require('../middleware/auth');
const authController    = require('../controllers/authController');
const notesController   = require('../controllers/notesController');

const router = express.Router();

/* ── User profile ── */
router.get('/profile',  authenticateToken, authController.getProfile);
router.put('/profile',  authenticateToken, authController.updateProfile);
router.put('/theme',    authenticateToken, authController.updateTheme);

/* ── Change password (authenticated) ── */
router.put('/auth/change-password', authenticateToken, authController.changePassword);

/* ── Notes ── */
router.post  ('/notes',                   authenticateToken, notesController.createNote);
router.get   ('/notes',                   authenticateToken, notesController.getNotes);
router.get   ('/notes/:id',               authenticateToken, notesController.getNote);
router.put   ('/notes/:id',               authenticateToken, notesController.updateNote);
router.put   ('/notes/:id/pin',           authenticateToken, notesController.togglePin);
router.put   ('/notes/:id/archive',       authenticateToken, notesController.toggleArchive);
router.put   ('/notes/:id/favorite',      authenticateToken, notesController.toggleFavorite);
router.delete('/notes/:id',               authenticateToken, notesController.deleteNote);
router.post  ('/notes/:id/restore',       authenticateToken, notesController.restoreNote);
router.delete('/notes/:id/permanent',     authenticateToken, notesController.permanentlyDeleteNote);
router.get   ('/notes/:id/export-pdf',    authenticateToken, notesController.exportToPDF);
router.get   ('/deleted-notes',           authenticateToken, notesController.getDeletedNotes);

module.exports = router;
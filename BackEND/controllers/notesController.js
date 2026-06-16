const { Note } = require('../models/index');
const PDFDocument = require('pdfkit');

/* ── create ──
   FIX: reads `type` from req.body and passes it to Note.create          */
exports.createNote = async (req, res) => {
  try {
    const { title, content, type } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = await Note.create(
      req.user.id,
      title,
      content || '',
      type || 'note',      // ← pass type to model
    );

    res.status(201).json({
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

/* ── get all (with filters) ── */
exports.getNotes = async (req, res) => {
  try {
    const { pinned, archived, favorite, search, sortBy } = req.query;

    const filters = {
      // pinned=true  → only pinned
      // pinned=false → no filter on pinned
      pinned:   pinned   === 'true',
      favorite: favorite === 'true',
      // archived=true  → only archived
      // archived=false → explicitly EXCLUDE archived (all-notes / pinned / favorites tabs)
      // archived=undefined → no archived filter (legacy fallback)
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
      search:   search   || '',
      sortBy:   sortBy   || 'updated_at_desc',
    };

    const notes = await Note.findByUserId(req.user.id, filters);

    res.json({ notes, count: notes.length });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

/* ── get single ── */
exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id, req.user.id);

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
};

/* ── update ── */
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color } = req.body;

    const existingNote = await Note.findById(id, req.user.id);
    if (!existingNote) return res.status(404).json({ error: 'Note not found' });

    const updatedNote = await Note.update(
      id,
      req.user.id,
      title   !== undefined ? title   : existingNote.title,
      content !== undefined ? content : existingNote.content,
      color   !== undefined ? color   : existingNote.color,
    );

    res.json({ message: 'Note updated successfully', note: updatedNote });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

/* ── toggle pin ── */
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.togglePin(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note pin toggled successfully', note });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
};

/* ── toggle archive ── */
exports.toggleArchive = async (req, res) => {
  try {
    const note = await Note.toggleArchive(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note archive toggled successfully', note });
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({ error: 'Failed to toggle archive' });
  }
};

/* ── toggle favorite ── */
exports.toggleFavorite = async (req, res) => {
  try {
    const note = await Note.toggleFavorite(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note favorite toggled successfully', note });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

/* ── soft delete ── */
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.softDelete(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted successfully', note });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

/* ── get deleted ── */
exports.getDeletedNotes = async (req, res) => {
  try {
    const notes = await Note.getDeleted(req.user.id);
    res.json({ notes, count: notes.length });
  } catch (error) {
    console.error('Get deleted notes error:', error);
    res.status(500).json({ error: 'Failed to fetch deleted notes' });
  }
};

/* ── restore ── */
exports.restoreNote = async (req, res) => {
  try {
    const note = await Note.restore(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note restored successfully', note });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ error: 'Failed to restore note' });
  }
};

/* ── permanent delete ── */
exports.permanentlyDeleteNote = async (req, res) => {
  try {
    const note = await Note.permanentDelete(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Failed to permanently delete note' });
  }
};

/* ── export to PDF ── */
exports.exportToPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id, req.user.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);

    doc.pipe(res);

    doc.fontSize(24).text(note.title, { underline: true });
    doc.moveDown();

    if (note.type === 'todo') {
      // render todo items as a plain checklist in the PDF
      try {
        const items = JSON.parse(note.content || '[]');
        items.forEach(item => {
          const mark = item.done ? '[x]' : '[ ]';
          doc.fontSize(12).text(`${mark}  ${item.text || '(empty)'}`);
        });
      } catch {
        doc.fontSize(12).text(note.content || '(empty note)');
      }
    } else {
      // strip HTML tags for plain-text PDF output
      const plain = (note.content || '').replace(/<[^>]*>/g, '');
      doc.fontSize(12).text(plain || '(empty note)');
    }

    doc.moveDown();
    doc.fontSize(10).fillColor('#999')
      .text(`Created: ${new Date(note.created_at).toLocaleString()}`)
      .text(`Last updated: ${new Date(note.updated_at).toLocaleString()}`);

    doc.end();
  } catch (error) {
    console.error('Export to PDF error:', error);
    res.status(500).json({ error: 'Failed to export note' });
  }
};
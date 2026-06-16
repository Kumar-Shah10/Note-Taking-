// // import React from 'react';
// import { truncateText, formatDate } from '../../utils/storage';
// import '../styles/notes-list.css';

// const NotesList = ({ notes, onSelectNote, onTogglePin,  onToggleFavorite, onDelete }) => {
//   const handleNoteClick = (note) => {
//     onSelectNote(note);
//   };

//   return (
//     <div className="notes-grid">
//       {notes.map(note => (
//         <div key={note.id} className="note-card" onClick={() => handleNoteClick(note)}>
//           <div className="note-card-header">
//             <h3 className="note-card-title">{note.title}</h3>
//             <div className="note-card-actions" onClick={(e) => e.stopPropagation()}>
//               <button
//                 className="note-action-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onTogglePin(note.id);
//                 }}
//                 title={note.is_pinned ? 'Unpin' : 'Pin'}
//               >
//                 {note.is_pinned ? '📌' : '📍'}
//               </button>
//               <button
//                 className="note-action-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onToggleFavorite(note.id);
//                 }}
//                 title={note.is_favorite ? 'Remove favorite' : 'Add favorite'}
//               >
//                 {note.is_favorite ? '❤️' : '🤍'}
//               </button>
//               <button
//                 className="note-action-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete(note.id);
//                 }}
//                 title="Delete"
//               >
//                 🗑️
//               </button>
//             </div>
//           </div>
//           <p className="note-card-content">
//             {note.content ? truncateText(note.content, 120) : '(empty note)'}
//           </p>
//           <div className="note-card-footer">
//             <small>{formatDate(note.updated_at)}</small>
//             {note.is_archived && <span className="note-badge">Archived</span>}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default NotesList;

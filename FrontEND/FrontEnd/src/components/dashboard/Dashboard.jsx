import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotes } from '../../hooks/useNotes';
import { useNavigate } from '../../hooks/useNavigation.js';
import { getTheme, setTheme, downloadPDF } from '../../utils/storage';
import { notesAPI } from '../../services/api';
import {
  FiHome, FiFileText, FiBookmark, FiHeart, FiArchive,
  FiTrash2, FiSun, FiMoon, FiLogOut, FiSearch,
  FiPlus, FiCheckSquare, FiStar,
} from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import DeletedNotesModal from './DeletedNotesModal';
import NoteEditor from './NoteEditor';
import '../styles/dashboard.css';

/* ── helpers ── */
const initials = (str = '') =>
  str.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');

/* ── Property normalizers ── */
const getIsPinned = (n) => !!(n?.is_pinned ?? n?.pinned);
const getIsFavorite = (n) => !!(n?.is_favorite ?? n?.favorite);
const getIsArchived = (n) => !!(n?.is_archived ?? n?.archived);
const getIsDeleted = (n) => !!(n?.is_deleted ?? n?.deleted);

/* ── NAV CONFIG ── */
const NAV_ITEMS = [
  { id: 'home',      label: 'Home',      icon: <FiHome size={15} /> },
  { id: 'all',       label: 'All Notes', icon: <FiFileText size={15} /> },
  { id: 'pinned',    label: 'Pinned',    icon: <FiBookmark size={15} /> },
  { id: 'favorites', label: 'Favorites', icon: <FiHeart size={15} /> },
  { id: 'archived',  label: 'Archived',  icon: <FiArchive size={15} /> },
];

const Dashboard = () => {
  const { user, logout, updateTheme } = useAuth();
  const {
    notes,           // current view notes (filtered by backend)
    allNotes: rawAllNotes,   // full notes list (for counts)
    loading,
    fetchNotes,
    fetchAllNotes,   // ← new
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    toggleFavorite,
  } = useNotes();

  const navigate = useNavigate();

  const [currentTheme,       setCurrentThemeState] = useState(getTheme());
  const [activeNote,         setActiveNote]         = useState(null);
  const [showProfileModal,   setShowProfileModal]   = useState(false);
  const [showDeletedModal,   setShowDeletedModal]   = useState(false);
  const [showLogoutConfirm,  setShowLogoutConfirm]  = useState(false);
  const [navTab,             setNavTab]             = useState('home');
  const [filters,            setFilters]            = useState({});
  const [searchTerm,         setSearchTerm]         = useState('');
  const [sortOrder,          setSortOrder]          = useState('desc');
  const [showNewMenu,        setShowNewMenu]        = useState(false);
  const [deleteConfirm,      setDeleteConfirm]      = useState(null);

  const newMenuRef = useRef(null);

  // Load full notes for accurate counts
  useEffect(() => {
    fetchAllNotes();
  }, [fetchAllNotes]);

  // Fetch filtered notes when tab/filters change
  useEffect(() => {
    if (navTab !== 'home') {
      fetchNotes(filters);
    }
  }, [filters, navTab, fetchNotes]);

  const allNotes = useMemo(() => rawAllNotes ?? [], [rawAllNotes]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
  }, [currentTheme]);

  useEffect(() => {
    const handler = (e) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target))
        setShowNewMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavTab = (id) => {
    setNavTab(id);
    setActiveNote(null);
    setSearchTerm('');

    const filterMap = {
      home:      null,
      all:       { archived: false },
      pinned:    { pinned: true, archived: false },
      favorites: { favorite: true, archived: false },
      archived:  { archived: true },
    };

    if (filterMap[id] !== null) {
      setFilters(filterMap[id]);
    }
  };

  const handleToggleTheme = async () => {
    const t = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentThemeState(t);
    setTheme(t);
    try { await updateTheme(t); } catch (e) { console.error(e); }
  };

  const handleCreateNote = async (type = 'note') => {
    setShowNewMenu(false);
    try {
      const initialContent = type === 'todo'
        ? JSON.stringify(Array.from({ length: 5 }, () => ({ text: '', done: false })))
        : '';
      const n = await createNote('Untitled', initialContent, type);
      setActiveNote(n);
      setNavTab('all');
      setFilters({ archived: false });
    } catch (e) { console.error(e); }
  };

  const handleSave = async (id, title, content, color) => {
    try {
      await updateNote(id, title, content, color);
      fetchNotes(filters);        // refresh current view
    } catch (e) { console.error(e); }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term || undefined }));
  };

  const handleExportPDF = async (id) => {
    try {
      const note = allNotes.find(n => n.id === id);
      const res = await notesAPI.exportToPDF(id);
      downloadPDF(res.data, `${note?.title ?? 'note'}.pdf`);
    } catch (e) { console.error(e); }
  };

  const handleToggleArchive = async (id) => {
    try {
      await toggleArchive(id);
      if (activeNote?.id === id) setActiveNote(null);
      fetchNotes(filters);
    } catch (e) { console.error(e); }
  };

  const handleTogglePin = async (id) => {
    try {
      await togglePin(id);
      fetchNotes(filters);
      setActiveNote(prev =>
        prev?.id === id ? { ...prev, pinned: !prev.pinned } : prev
      );
    } catch (e) { console.error(e); }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      fetchNotes(filters);
      setActiveNote(prev =>
        prev?.id === id ? { ...prev, favorite: !prev.favorite } : prev
      );
    } catch (e) { console.error(e); }
  };

  const requestDelete = (id) => setDeleteConfirm(id);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await deleteNote(deleteConfirm);
    if (activeNote?.id === deleteConfirm) setActiveNote(null);
    setDeleteConfirm(null);
    fetchNotes(filters);
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => { logout(); navigate('login'); };

  /* ── Counts (now always accurate) ── */
  const countFor = useCallback((tab) => {
    if (!allNotes?.length) return 0;

    return allNotes.filter(n => {
      if (getIsDeleted(n)) return false;

      const isArchived = getIsArchived(n);

      if (tab === 'all')       return !isArchived;
      if (tab === 'pinned')    return getIsPinned(n) && !isArchived;
      if (tab === 'favorites') return getIsFavorite(n) && !isArchived;
      if (tab === 'archived')  return isArchived;

      return false;
    }).length;
  }, [allNotes]);

  /* ── Sorted notes for current view ── */
  const sortedNotes = useMemo(() => {
    return [...(notes ?? [])].sort((a, b) => {
      const aPinned = getIsPinned(a);
      const bPinned = getIsPinned(b);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      const da = new Date(a.updated_at ?? a.updatedAt ?? a.created_at ?? a.createdAt ?? 0);
      const db = new Date(b.updated_at ?? b.updatedAt ?? b.created_at ?? b.createdAt ?? 0);
      return sortOrder === 'desc' ? db - da : da - db;
    });
  }, [notes, sortOrder]);

  const pinnedNotes   = sortedNotes.filter(n => getIsPinned(n));
  const unpinnedNotes = sortedNotes.filter(n => !getIsPinned(n));

  const tabLabel = NAV_ITEMS.find(i => i.id === navTab)?.label ?? 'Notes';
  const avatarSrc = user?.avatar || user?.avatar_url || user?.avatarUrl || '';

  return (
    <div className="db-root">
      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <FiStar size={18} color="var(--gold)" />
          <span className="db-brand-name">NoteSphere</span>
        </div>

        <nav className="db-nav">
          <div className="db-nav-section">Navigate</div>
          {NAV_ITEMS.map(item => {
            const cnt = item.id === 'home' ? null : countFor(item.id);
            return (
              <button
                key={item.id}
                className={`db-nav-item${navTab === item.id ? ' active' : ''}`}
                onClick={() => handleNavTab(item.id)}
              >
                <span className="db-nav-item-icon">{item.icon}</span>
                {item.label}
                {cnt !== null && <span className="db-nav-item-count">{cnt}</span>}
              </button>
            );
          })}

          <div className="db-nav-section">More</div>
          <button className="db-nav-item" onClick={() => setShowDeletedModal(true)}>
            <span className="db-nav-item-icon"><FiTrash2 size={15} /></span>
            Trash
          </button>
        </nav>

        <div className="db-sidebar-footer">
          <button className="db-user-row" onClick={() => setShowProfileModal(true)}>
            <div className="db-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                initials(user?.username || user?.email)
              )}
            </div>
            <div className="db-user-info">
              <span className="db-user-name">{user?.username || 'You'}</span>
            </div>
          </button>

          <button className="db-footer-btn" onClick={handleToggleTheme}>
            <span className="db-footer-btn-icon">
              {currentTheme === 'dark' ? <FiSun size={14} /> : <FiMoon size={14} />}
            </span>
            {currentTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <button className="db-footer-btn danger" onClick={handleLogout}>
            <span className="db-footer-btn-icon"><FiLogOut size={14} /></span>
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="db-main">
        <div className="db-topbar">
          <span className="db-topbar-title">
            {tabLabel.split(' ')[0]}
            {tabLabel.split(' ').length > 1 && <><em> {tabLabel.split(' ').slice(1).join(' ')}</em></>}
          </span>

          {navTab !== 'home' && (
            <div className="db-search-wrap">
              <span className="db-search-icon"><FiSearch size={13} /></span>
              <input
                type="text"
                className="db-search"
                placeholder="Search notes…"
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
          )}

          {navTab === 'all' && (
            <button className="db-sort-btn" onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}>
              {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
            </button>
          )}

          {navTab === 'home' && (
            <div className="db-new-wrap" ref={newMenuRef}>
              <button className="db-new-btn" onClick={() => setShowNewMenu(v => !v)}>
                <FiPlus size={14} /> New <span className="db-new-caret">▾</span>
              </button>
              {showNewMenu && (
                <div className="db-new-menu">
                  <button className="db-new-menu-item" onClick={() => handleCreateNote('note')}>
                    <span className="db-new-menu-icon"><FiFileText size={18} /></span>
                    <span><strong>Note</strong><span className="db-new-menu-sub">Rich text, formatted</span></span>
                  </button>
                  <button className="db-new-menu-item" onClick={() => handleCreateNote('todo')}>
                    <span className="db-new-menu-icon"><FiCheckSquare size={18} /></span>
                    <span><strong>To-Do List</strong><span className="db-new-menu-sub">Checklist with progress</span></span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="db-body">
          <div className="db-notes-pane">
            {navTab === 'home' && (
              <HomeView
                user={user}
                allNotes={allNotes}
                countFor={countFor}
                onNavigate={handleNavTab}
                onCreateNote={handleCreateNote}
              />
            )}

            {navTab !== 'home' && (
              loading ? (
                <div className="db-loading">
                  <span className="db-loading-dot" /> <span className="db-loading-dot" /> <span className="db-loading-dot" />
                </div>
              ) : sortedNotes.length === 0 ? (
                <div className="db-empty">
                  <div className="db-empty-icon"><FiFileText size={36} /></div>
                  <h3>Nothing here yet</h3>
                  <p>
                    {navTab === 'archived' ? 'Archived notes will appear here.' : 'Go to Home to create your first note.'}
                  </p>
                </div>
              ) : (
                <>
                  {navTab === 'all' && pinnedNotes.length > 0 && (
                    <>
                      <div className="db-section-label">Pinned</div>
                      <div className="db-grid">
                        {pinnedNotes.map((note, i) => (
                          <NoteCard key={note.id} note={note} index={i}
                            active={activeNote?.id === note.id}
                            onSelect={() => setActiveNote(note)}
                            onPin={() => handleTogglePin(note.id)}
                            onFav={() => handleToggleFavorite(note.id)}
                            onArchive={() => handleToggleArchive(note.id)}
                            onDelete={() => requestDelete(note.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {navTab === 'all' && (
                    <>
                      {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                        <div className="db-section-label" style={{ marginTop: 28 }}>Other</div>
                      )}
                      <div className="db-grid">
                        {unpinnedNotes.map((note, i) => (
                          <NoteCard key={note.id} note={note} index={i}
                            active={activeNote?.id === note.id}
                            onSelect={() => setActiveNote(note)}
                            onPin={() => handleTogglePin(note.id)}
                            onFav={() => handleToggleFavorite(note.id)}
                            onArchive={() => handleToggleArchive(note.id)}
                            onDelete={() => requestDelete(note.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {navTab !== 'all' && (
                    <div className="db-grid">
                      {sortedNotes.map((note, i) => (
                        <NoteCard key={note.id} note={note} index={i}
                          active={activeNote?.id === note.id}
                          onSelect={() => setActiveNote(note)}
                          onPin={() => handleTogglePin(note.id)}
                          onFav={() => handleToggleFavorite(note.id)}
                          onArchive={() => handleToggleArchive(note.id)}
                          onDelete={() => requestDelete(note.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )
            )}
          </div>

          {activeNote && (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              onClose={() => setActiveNote(null)}
              onSave={handleSave}
              onDelete={requestDelete}
              onExportPDF={handleExportPDF}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {deleteConfirm && (
        <div className="db-modal-overlay">
          <div className="db-modal db-confirm-modal">
            <div className="db-confirm-icon"><FiTrash2 size={32} /></div>
            <h3 className="db-confirm-title">Delete this note?</h3>
            <p className="db-confirm-body">This will move the note to Trash. You can restore it from there.</p>
            <div className="db-confirm-actions">
              <button className="db-confirm-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="db-confirm-delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="db-modal-overlay">
          <div className="db-modal db-confirm-modal">
            <div className="db-confirm-icon" style={{ color: 'var(--gold)' }}><FiLogOut size={32} /></div>
            <h3 className="db-confirm-title">Sign out?</h3>
            <p className="db-confirm-body">You'll need to sign in again to access your notes.</p>
            <div className="db-confirm-actions">
              <button className="db-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="db-confirm-delete" onClick={confirmLogout} style={{ background: 'var(--gold)', color: '#0f0e0c' }}>Sign out</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showDeletedModal && (
        <DeletedNotesModal
          onClose={() => setShowDeletedModal(false)}
          onRestore={() => { setShowDeletedModal(false); fetchAllNotes(); }}
        />
      )}
    </div>
  );
};

/* ── HOME VIEW ── */
const HomeView = ({ user, allNotes, countFor, onNavigate, onCreateNote }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.username || 'there';

  const recentNotes = [...(allNotes ?? [])]
    .filter(n => !getIsArchived(n) && !getIsDeleted(n))
    .sort((a, b) => new Date(b.updated_at ?? b.updatedAt ?? 0) - new Date(a.updated_at ?? a.updatedAt ?? 0))
    .slice(0, 4);

  const SECTIONS = [
    { id: 'all', label: 'All Notes', icon: <FiFileText size={20} />, color: '#d4aa64' },
    { id: 'pinned', label: 'Pinned', icon: <FiBookmark size={20} />, color: '#a78bfa' },
    { id: 'favorites', label: 'Favorites', icon: <FiHeart size={20} />, color: '#f87171' },
    { id: 'archived', label: 'Archived', icon: <FiArchive size={20} />, color: '#6b7280' },
  ];

  return (
    <div className="db-home">
      <div className="db-home-greeting">
        <h1>{greeting}, <em>{name}.</em></h1>
        <p>What would you like to capture today?</p>
      </div>

      <div className="db-home-create">
        <button className="db-home-create-card" onClick={() => onCreateNote('note')}>
          <span className="db-home-create-icon"><FiFileText size={22} /></span>
          <strong>New Note</strong>
          <span>Rich text, formatted</span>
        </button>
        <button className="db-home-create-card" onClick={() => onCreateNote('todo')}>
          <span className="db-home-create-icon"><FiCheckSquare size={22} /></span>
          <strong>New To-Do</strong>
          <span>Checklist with progress</span>
        </button>
      </div>

      <div className="db-home-stats">
        {SECTIONS.map(s => (
          <button key={s.id} className="db-home-stat" onClick={() => onNavigate(s.id)}>
            <span className="db-home-stat-icon" style={{ color: s.color }}>{s.icon}</span>
            <span className="db-home-stat-count">{countFor(s.id)}</span>
            <span className="db-home-stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      {recentNotes.length > 0 && (
        <>
          <div className="db-section-label" style={{ marginTop: 36 }}>Recently edited</div>
          <div className="db-grid" style={{ marginTop: 14 }}>
            {recentNotes.map((note, i) => (
              <div key={note.id} className="db-card" style={{ animationDelay: `${i * 40}ms`, cursor: 'pointer' }}
                onClick={() => onNavigate('all')}>
                <div className="db-card-title">{note.title || 'Untitled'}</div>
                <div className="db-card-preview">
                  {note.type === 'todo' ? (() => {
                    try {
                      const items = JSON.parse(note.content || '[]');
                      const done = items.filter(t => t.done).length;
                      return `${done}/${items.length} tasks done`;
                    } catch { return ''; }
                  })() : stripHtml(note.content || '')}
                </div>
                <div className="db-card-meta">
                  <span className="db-card-date">
                    {fmtDate(note.updated_at || note.updatedAt || note.created_at || note.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── NOTE CARD ── */
const NoteCard = ({ note, index, active, onSelect, onPin, onFav, onArchive, onDelete }) => {
  const isPinned = getIsPinned(note);
  const isFav = getIsFavorite(note);
  const isArchived = getIsArchived(note);

  const preview = note.type === 'todo'
    ? (() => {
        try {
          const items = JSON.parse(note.content || '[]');
          const done = items.filter(t => t.done).length;
          return `${done} / ${items.length} tasks done`;
        } catch { return ''; }
      })()
    : stripHtml(note.content || '');

  return (
    <div className={`db-card${isPinned ? ' pinned' : ''}${active ? ' active' : ''}`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onSelect}>
      {note.color && note.color !== '#FFFFFF' && <div className="db-card-color" style={{ background: note.color }} />}

      <div className="db-card-title">{note.title || 'Untitled'}</div>
      {preview && <div className="db-card-preview">{preview}</div>}

      <div className="db-card-meta">
        <span className="db-card-date">
          {fmtDate(note.updated_at || note.updatedAt || note.created_at || note.createdAt)}
        </span>
        <div className="db-card-badges">
          {isPinned && <span className="db-badge pinned" title="Pinned"><FiBookmark size={11} /></span>}
          {isFav && <span className="db-badge fav" title="Favourite"><FiHeart size={11} /></span>}
          {isArchived && <span className="db-badge" title="Archived"><FiArchive size={11} /></span>}
          {note.type === 'todo' && <span className="db-badge" title="To-Do"><FiCheckSquare size={11} /></span>}
        </div>
      </div>

      <div className="db-card-actions" onClick={e => e.stopPropagation()}>
        <button className={`db-card-action${isPinned ? ' active' : ''}`} onClick={onPin} title={isPinned ? 'Unpin' : 'Pin'}>
          <FiBookmark size={12} />
        </button>
        <button className={`db-card-action${isFav ? ' active' : ''}`} onClick={onFav} title={isFav ? 'Unsave' : 'Save'}>
          <FiHeart size={12} />
        </button>
        <button className={`db-card-action${isArchived ? ' active' : ''}`} onClick={onArchive} title={isArchived ? 'Unarchive' : 'Archive'}>
          <FiArchive size={12} />
        </button>
        <button className="db-card-action danger" onClick={onDelete} title="Delete">
          <FiTrash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
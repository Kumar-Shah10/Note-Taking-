// import React from 'react';
import '../styles/sidebar.css';

const Sidebar = ({ user, currentTheme, onToggleTheme, onProfileClick, onLogout, filters, onFilterChange, onDeletedClick }) => {
  const handleFilterClick = (filterKey) => {
    const newFilters = { ...filters };
    if (filterKey === 'all') {
      // Reset all filters
      onFilterChange({});
    } else {
      // Toggle the filter
      newFilters[filterKey] = !newFilters[filterKey];
      onFilterChange(newFilters);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">📝 Notes</h1>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span>{user?.username?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.username}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      <div className="sidebar-filters">
        <h3>Filters</h3>
        <button
          className={`filter-btn ${!filters.pinned && !filters.archived && !filters.favorite ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          📌 All Notes
        </button>
        <button
          className={`filter-btn ${filters.pinned ? 'active' : ''}`}
          onClick={() => handleFilterClick('pinned')}
        >
          📍 Pinned
        </button>
        <button
          className={`filter-btn ${filters.favorite ? 'active' : ''}`}
          onClick={() => handleFilterClick('favorite')}
        >
          ❤️ Favorites
        </button>
        <button
          className={`filter-btn ${filters.archived ? 'active' : ''}`}
          onClick={() => handleFilterClick('archived')}
        >
          📦 Archived
        </button>
      </div>

      <div className="sidebar-actions">
        <button className="btn btn-secondary" onClick={onDeletedClick}>
          🗑️ Deleted Notes
        </button>
      </div>

      <div className="sidebar-settings">
        <button className="settings-btn" onClick={onProfileClick} title="Edit profile">
          👤 Profile
        </button>
        <button
          className="settings-btn"
          onClick={onToggleTheme}
          title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        >
          {currentTheme === 'light' ? '🌙' : '☀️'} {currentTheme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button className="settings-btn btn-danger" onClick={onLogout} title="Logout">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

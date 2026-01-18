import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function Header({ searchQuery, onSearchChange, sortBy, onSortChange }: HeaderProps) {
  return (
    <div className="header-row">
      <div className="header-left">
        <Link to="/">
          <button className="home-button">
            <FaHome />
          </button>
        </Link>
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Curl"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </div>
      <select 
        className="sort-dropdown" 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="name">Sort by: Name</option>
        <option value="category">Sort by: Category</option>
      </select>
    </div>
  );
}
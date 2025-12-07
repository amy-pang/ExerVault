import { useState } from 'react'
import { AiOutlineHome, AiOutlineSearch, AiOutlineShoppingCart } from "react-icons/ai";
import './Header.css'

type HeaderProps = {
  onSearch: (query: string) => void;
};

function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <div className="header-wrapper">
        <header className="header-container">

            <AiOutlineHome className="header-icon" />

            <form className="search-bar" onSubmit={handleSubmit}>
            <input
                className="search-input"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-icon" type="submit">
                <AiOutlineSearch size={20} />
            </button>
            </form>

            <AiOutlineShoppingCart className="header-icon" />
        </header>
    </div>
  );
}

export default Header;

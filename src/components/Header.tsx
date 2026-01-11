import { useState } from 'react'
import { AiOutlineHome, AiOutlineSearch, AiOutlineShoppingCart } from "react-icons/ai";
import './Header.css'
import { DummyExercises } from '../dummy_exercises';

type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

function Header({ query, onQueryChange }: HeaderProps) {
  /*const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };*/

  console.log(DummyExercises.filter(exercise=>exercise.name.toLowerCase().includes("u")));
  return (
    <div className="header-wrapper">
        <header className="header-container">

            <AiOutlineHome className="header-icon" color="black"/>

            <div className="search-bar">
              <input
                  className="search-input"
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
              />
              <button className="search-icon" type="submit">
                  <AiOutlineSearch size={20} />
              </button>
            </div>

            <AiOutlineShoppingCart className="header-icon" color="black"/>
        </header>
    </div>
  );
}

export default Header;

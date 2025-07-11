import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useDebounce } from "../../hooks";
import { SEARCH_CONFIG } from "../common/config";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "검색어를 입력하세요...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, SEARCH_CONFIG.DEBOUNCE_DELAY);

  useEffect(() => {
    if (debouncedQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
      onSearch?.(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    setShowClear(query.length > 0);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`search-container ${className} ${isFocused ? "focused" : ""}`}
    >
      <div className="search-form-outer">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
        />
        {showClear && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <FaTimes />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

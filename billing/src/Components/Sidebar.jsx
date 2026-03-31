import { useState } from "react";

function Sidebar({ categories, setCategories, selectedCategory, setSelectedCategory }) {

  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");

  // 🔍 FILTER CATEGORIES
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <div style={{
      width: "240px",
      background: "#1e293b",
      color: "white",
      padding: "20px",
      minHeight: "100vh"
    }}>

      <h2 style={{ marginBottom: "15px", color: "#38bdf8" }}>SmartBiz</h2>

      {/* 🔍 SEARCH CATEGORY */}
      <input
        placeholder="Search category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
          marginBottom: "15px"
        }}
      />

      {/* CATEGORY LIST */}
      {filteredCategories.map((cat, index) => (
        <div
          key={index}
          onClick={() => setSelectedCategory(cat)}
          style={{
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            background: selectedCategory === cat ? "#0ea5e9" : "transparent"
          }}
        >
          {cat}
        </div>
      ))}

      {/* ADD CATEGORY */}
      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "none",
            marginBottom: "10px"
          }}
        />

        <button
          onClick={addCategory}
          style={{
            width: "100%",
            padding: "8px",
            background: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Add Category
        </button>
      </div>

    </div>
  );
}

export default Sidebar;
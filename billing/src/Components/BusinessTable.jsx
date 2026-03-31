import { useState } from "react";

function BusinessTable({
  businesses,
  setBusinesses,
  selectedCategory,
  handleBilling,
  categories
}) {

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  // 🔍 FILTER LOGIC
  const filteredBusinesses = businesses.filter((b) => {
    return (
      (selectedCategory === "All" || b.category === selectedCategory) &&
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ✏️ SAVE EDIT
  const saveEdit = (id) => {
    const updated = businesses.map((b) =>
      b.id === id
        ? { ...b, name: editName, category: editCategory }
        : b
    );

    setBusinesses(updated);
    setEditId(null);
  };

  // ❌ DELETE
  const deleteBusiness = (id) => {
    setBusinesses(businesses.filter((b) => b.id !== id));
  };

  return (
    <div>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search business..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <table style={{
        width: "100%",
        borderCollapse: "collapse"
      }}>

        <thead style={{ background: "#0ea5e9", color: "white" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Name</th>
            <th style={th}>Category</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredBusinesses.map((b) => (
            <tr key={b.id} style={{ textAlign: "center" }}>

              <td style={td}>{b.id}</td>

              {editId === b.id ? (
                <>
                  <td style={td}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </td>

                  {/* 🔽 CATEGORY DROPDOWN */}
                  <td style={td}>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      {categories.map((cat, i) => (
                        <option key={i}>{cat}</option>
                      ))}
                    </select>
                  </td>

                  <td style={td}>
                    <button onClick={() => saveEdit(b.id)}>Save</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={td}>{b.name}</td>
                  <td style={td}>{b.category}</td>

                  <td style={td}>

                    <button
                      onClick={() => {
                        setEditId(b.id);
                        setEditName(b.name);
                        setEditCategory(b.category);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteBusiness(b.id)}
                      style={{ marginLeft: "5px" }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => handleBilling(b)}
                      style={{ marginLeft: "5px" }}
                    >
                      Billing
                    </button>

                  </td>
                </>
              )}

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

const th = {
  padding: "10px",
  border: "1px solid #ddd"
};

const td = {
  padding: "10px",
  border: "1px solid #ddd"
};

export default BusinessTable;
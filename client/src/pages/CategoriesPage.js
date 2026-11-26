import { useEffect, useState } from "react";
import { api } from "../api";

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");

  function reload() {
    api("/api/categories").then(setCategories);
  }

  useEffect(() => {
    reload();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    await api("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
    setName("");
    reload();
  }

  const shown = categories.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <header className="page-head">
        <h1>Categories</h1>
      </header>
      <form className="card row-form" onSubmit={onAdd}>
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="btn primary">Add category</button>
      </form>
      <input
        className="search"
        placeholder="Filter categories…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Medicines</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c._count?.medicines ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

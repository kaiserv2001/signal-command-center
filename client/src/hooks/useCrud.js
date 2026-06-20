import { useCallback, useEffect, useState } from "react";

// Small list+create+delete helper shared by the CRUD panels. Surfaces
// loading/error so every panel renders those states explicitly.
export function useCrud({ list, create, remove }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await list();
      setItems(d.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [list]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = async (payload) => {
    const d = await create(payload);
    setItems((x) => [d.item, ...x]);
    return d.item;
  };

  const del = async (id) => {
    await remove(id);
    setItems((x) => x.filter((i) => i._id !== id));
  };

  return { items, loading, error, reload, add, del };
}

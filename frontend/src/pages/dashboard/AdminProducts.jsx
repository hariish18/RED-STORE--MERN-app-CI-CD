import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, Pencil, Trash2, Plus, X, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "../../components/SectionHeading";
import AdminNav from "./AdminNav";
import { API_URL, getAuthHeaders } from "../../utils/api";
import { formatPrice } from "../../utils/format";
import "./AdminDashboard.css";
import "./AdminProducts.css";

// must match PRODUCTS_PAGE_SIZE / PRODUCT_GENDERS on the backend side (admin.controller.js)
const PAGE_SIZE = 10;
const GENDERS = ["men", "women", "kids", "unisex"];
const LOW_STOCK = 5;

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

// generic modal: clickable backdrop + Escape to close
function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="admin-modal__backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="admin-modal__header">
                    <h3>{title}</h3>
                    <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function EditProductModal({ product, onClose, onSaved }) {
    const [price, setPrice] = useState(String(product.price ?? ""));
    const [gender, setGender] = useState(product.gender || "unisex");
    const [sizes, setSizes] = useState(product.sizes.map((s) => ({ size: String(s.size), stock: String(s.stock) })));
    const [isSaving, setIsSaving] = useState(false);

    const totalStock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);

    const updateSize = (index, field, value) =>
        setSizes((current) => current.map((s, i) => (i === index ? { ...s, [field]: value } : s)));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await axios.patch(
                `${API_URL}/api/admin/products/${product._id}`,
                {
                    price: Number(price),
                    gender,
                    sizes: sizes.map((s) => ({ size: Number(s.size), stock: Number(s.stock) })),
                },
                { headers: getAuthHeaders() }
            );
            toast.success("Product updated");
            onSaved(data.product);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update product");
            setIsSaving(false);
        }
    };

    return (
        <Modal title={`Edit — ${product.title}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="admin-modal__body">
                <div className="admin-modal__row">
                    <label className="admin-modal__field">
                        <span>Price ($)</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="form-input"
                        />
                    </label>
                    <label className="admin-modal__field">
                        <span>Category</span>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-input">
                            {GENDERS.map((g) => (
                                <option key={g} value={g}>
                                    {capitalize(g)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="admin-modal__field">
                    <span>
                        Sizes &amp; stock <em className="admin-modal__hint">Total: {totalStock}</em>
                    </span>
                    {sizes.length === 0 && <p className="text-small home__muted">No sizes yet.</p>}
                    <div className="admin-modal__sizes">
                        {sizes.map((s, i) => (
                            <div className="admin-modal__size-row" key={i}>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    required
                                    placeholder="Size"
                                    aria-label="Size"
                                    value={s.size}
                                    onChange={(e) => updateSize(i, "size", e.target.value)}
                                    className="form-input"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    required
                                    placeholder="Stock"
                                    aria-label={`Stock for size ${s.size}`}
                                    value={s.stock}
                                    onChange={(e) => updateSize(i, "stock", e.target.value)}
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    className="admin-products__icon-btn admin-products__icon-btn--danger"
                                    onClick={() => setSizes((current) => current.filter((_, j) => j !== i))}
                                    aria-label={`Remove size ${s.size}`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="admin-modal__add-size"
                        onClick={() => setSizes((current) => [...current, { size: "", stock: "0" }])}
                    >
                        <Plus size={14} /> Add size
                    </button>
                </div>

                <div className="admin-modal__actions">
                    <button type="button" className="btn-secondary admin-modal__btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary admin-modal__btn" disabled={isSaving}>
                        {isSaving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function DeleteProductModal({ product, onClose, onDeleted }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(`${API_URL}/api/admin/products/${product._id}`, { headers: getAuthHeaders() });
            toast.success("Product deleted");
            onDeleted();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete product");
            setIsDeleting(false);
        }
    };

    return (
        <Modal title="Delete product" onClose={onClose}>
            <div className="admin-modal__body">
                <p>
                    Delete <strong>{product.title}</strong>
                    {product.brand ? ` (${product.brand})` : ""}? This cannot be undone.
                </p>
                <div className="admin-modal__actions">
                    <button type="button" className="btn-secondary admin-modal__btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-primary admin-modal__btn admin-modal__btn--danger"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default function AdminProducts() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = useSelector((state) => state.authReducer.user);
    const isAdmin = Boolean(token && user && user.role === "admin");

    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // same guard as AdminDashboard.jsx
    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        if (user && user.role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [token, user, navigate]);

    // debounced search: only refetch after 300ms without typing, and go back to page 1
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchProducts = useCallback(() => {
        return axios
            .get(`${API_URL}/api/admin/products`, {
                headers: getAuthHeaders(),
                params: { page, limit: PAGE_SIZE, q: query || undefined },
            })
            .then(({ data }) => {
                setError(null);
                // the current page may have disappeared (deletion of the last product on the page)
                if (data.page > data.pages) setPage(data.pages);
                else setData(data);
            })
            .catch(() => setError("Failed to load products"));
    }, [page, query]);

    useEffect(() => {
        if (isAdmin) fetchProducts();
    }, [isAdmin, fetchProducts]);

    const handleSaved = (updated) => {
        setData((current) => ({
            ...current,
            products: current.products.map((p) => (p._id === updated._id ? updated : p)),
        }));
        setEditing(null);
    };

    const handleDeleted = () => {
        setDeleting(null);
        fetchProducts();
    };

    const closeEdit = useCallback(() => setEditing(null), []);
    const closeDelete = useCallback(() => setDeleting(null), []);

    if (!isAdmin) return null;

    const firstIndex = data ? (data.page - 1) * PAGE_SIZE + 1 : 0;
    const lastIndex = data ? firstIndex + data.products.length - 1 : 0;

    return (
        <div className="admin-dashboard-page">
            <div className="section">
                <SectionHeading title="Admin Dashboard" />
                <p className="admin-dashboard__subtitle">Manage your product catalog</p>
                <AdminNav />

                <div className="admin-products__toolbar">
                    <label className="admin-products__search">
                        <Search size={16} strokeWidth={2} />
                        <input
                            type="search"
                            placeholder="Search by name or brand…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search products by name or brand"
                        />
                    </label>
                    <Link to="/admin/products" className="btn-primary admin-products__add">
                        <Plus size={16} strokeWidth={2.5} /> Add product
                    </Link>
                </div>

                {error ? (
                    <p className="admin-dashboard__error">{error}</p>
                ) : !data ? (
                    <p className="text-small home__muted">Loading products…</p>
                ) : data.total === 0 ? (
                    <p className="text-small home__muted">
                        {query ? `No products match “${query}”.` : "No products yet."}
                    </p>
                ) : (
                    <>
                        <div className="admin-dashboard__table-card">
                            <div className="admin-dashboard__table-scroll">
                                <table className="admin-dashboard__table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Brand</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th className="admin-products__actions-head">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.products.map((product) => (
                                            <tr key={product._id}>
                                                <td>
                                                    {product.imageProd ? (
                                                        <img
                                                            src={product.imageProd}
                                                            alt=""
                                                            className="admin-products__thumb"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span className="admin-products__thumb admin-products__thumb--empty">
                                                            <ImageOff size={18} />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="admin-products__name">{product.title}</td>
                                                <td>{product.brand || "—"}</td>
                                                <td>
                                                    <span className={`admin-products__category admin-products__category--${product.gender}`}>
                                                        {capitalize(product.gender)}
                                                    </span>
                                                </td>
                                                <td className="admin-dashboard__table-total">{formatPrice(product.price)}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            product.totalStock === 0
                                                                ? "admin-products__stock admin-products__stock--out"
                                                                : product.totalStock <= LOW_STOCK
                                                                  ? "admin-products__stock admin-products__stock--low"
                                                                  : "admin-products__stock"
                                                        }
                                                    >
                                                        {product.totalStock}
                                                    </span>
                                                    <span className="admin-products__sizes-count">
                                                        {product.sizes.length} size{product.sizes.length === 1 ? "" : "s"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="admin-products__actions">
                                                        <button
                                                            type="button"
                                                            className="admin-products__action"
                                                            onClick={() => setEditing(product)}
                                                        >
                                                            <Pencil size={14} /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-products__action admin-products__action--danger"
                                                            onClick={() => setDeleting(product)}
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="admin-products__pagination">
                            <span className="text-small home__muted">
                                Showing {firstIndex}–{lastIndex} of {data.total}
                            </span>
                            <div className="admin-products__pages">
                                <button
                                    type="button"
                                    className="admin-products__page-btn"
                                    disabled={data.page <= 1}
                                    onClick={() => setPage(data.page - 1)}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                                    <button
                                        type="button"
                                        key={n}
                                        className={`admin-products__page-btn${n === data.page ? " admin-products__page-btn--active" : ""}`}
                                        onClick={() => setPage(n)}
                                        aria-current={n === data.page ? "page" : undefined}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className="admin-products__page-btn"
                                    disabled={data.page >= data.pages}
                                    onClick={() => setPage(data.page + 1)}
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {editing && <EditProductModal product={editing} onClose={closeEdit} onSaved={handleSaved} />}
            {deleting && <DeleteProductModal product={deleting} onClose={closeDelete} onDeleted={handleDeleted} />}
        </div>
    );
}

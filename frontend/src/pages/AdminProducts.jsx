import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { addProduct } from "../JS/actions/Prod.action";
import SectionHeading from "../components/SectionHeading";
import "./AdminProducts.css";

const GENDERS = ["men", "women", "kids"];
const initialForm = { title: "", description: "", price: "", brand: "", gender: "men", stock: "", sizes: "" };

function AdminProducts() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = useSelector((state) => state.authReducer.user);
    const [form, setForm] = useState(initialForm);
    const [mainImage, setMainImage] = useState(null);
    const [extraImages, setExtraImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // same guard as AdminDashboard.jsx: checks the token locally (synchronous), not
    // just `user` in Redux, which stays null while current() (App.jsx) resolves
    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        if (user && user.role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [token, user, navigate]);

    if (!token || !user || user.role !== "admin") return null;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("brand", form.brand);
        formData.append("gender", form.gender);
        formData.append(
            "sizes",
            JSON.stringify(form.sizes.split(",").map((s) => ({ size: Number(s.trim()), stock: Number(form.stock) })))
        );
        if (mainImage) formData.append("imageProd", mainImage);
        extraImages.forEach((file) => formData.append("images", file));

        const result = await dispatch(addProduct(formData));
        setIsSaving(false);
        if (result.success) {
            toast.success("Product added successfully!");
            setForm(initialForm);
            setMainImage(null);
            setExtraImages([]);
        } else {
            toast.error(result.error || "Failed to add product");
        }
    };

    return (
        <div className="admin-products-page">
            <div className="admin-products-card">
                <SectionHeading title="Add a Product" />
                <p className="admin-products__subtitle">Fill in the details below to list a new product</p>

                <form onSubmit={handleSubmit} className="admin-products__form">
                    <label className="admin-products__field">
                        <span>
                            Product Name <span className="admin-products__required">*</span>
                        </span>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </label>

                    <label className="admin-products__field">
                        <span>
                            Description <span className="admin-products__required">*</span>
                        </span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="form-input"
                        />
                    </label>

                    <div className="admin-products__row">
                        <label className="admin-products__field">
                            <span>
                                Price ($) <span className="admin-products__required">*</span>
                            </span>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="form-input"
                            />
                        </label>
                        <label className="admin-products__field">
                            <span>Brand</span>
                            <input type="text" name="brand" value={form.brand} onChange={handleChange} className="form-input" />
                        </label>
                    </div>

                    <div className="admin-products__row">
                        <label className="admin-products__field">
                            <span>Category</span>
                            <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
                                {GENDERS.map((g) => (
                                    <option key={g} value={g}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="admin-products__field">
                            <span>
                                Stock <span className="admin-products__required">*</span>
                            </span>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="form-input"
                            />
                        </label>
                    </div>

                    <label className="admin-products__field">
                        <span>
                            Sizes (comma-separated) <span className="admin-products__required">*</span>
                        </span>
                        <input
                            type="text"
                            name="sizes"
                            value={form.sizes}
                            onChange={handleChange}
                            required
                            placeholder="38, 39, 40, 41"
                            className="form-input"
                        />
                    </label>

                    <div className="admin-products__field">
                        <span>Main Image</span>
                        <label className="admin-products__file">
                            <Upload size={18} strokeWidth={2} />
                            <span>{mainImage ? mainImage.name : "Choose Image"}</span>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                className="admin-products__file-input"
                                onChange={(e) => setMainImage(e.target.files[0] || null)}
                            />
                        </label>
                    </div>

                    <div className="admin-products__field">
                        <span>Additional Images</span>
                        <label className="admin-products__file">
                            <Upload size={18} strokeWidth={2} />
                            <span>
                                {extraImages.length > 0
                                    ? `${extraImages.length} image${extraImages.length > 1 ? "s" : ""} selected`
                                    : "Choose Images"}
                            </span>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                multiple
                                className="admin-products__file-input"
                                onChange={(e) => setExtraImages([...e.target.files])}
                            />
                        </label>
                    </div>

                    <button type="submit" disabled={isSaving} className="btn-primary admin-products__submit">
                        {isSaving ? "Adding..." : "Add Product"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminProducts;

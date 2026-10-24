import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingBag, Package, Users, DollarSign } from "lucide-react";
import SectionHeading from "../../components/SectionHeading";
import AdminNav from "./AdminNav";
import { API_URL, getAuthHeaders } from "../../utils/api";
import { formatPrice } from "../../utils/format";
import "./AdminDashboard.css";

const STAT_CARDS = [
    { key: "totalOrders", label: "Total Orders", icon: ShoppingBag, format: (v) => v },
    { key: "totalProducts", label: "Total Products", icon: Package, format: (v) => v },
    { key: "totalUsers", label: "Total Users", icon: Users, format: (v) => v },
    { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, format: formatPrice },
];

// must match ORDER_STATUSES on the backend side (admin.controller.js)
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_META = {
    pending: { label: "Pending", className: "order-status order-status--pending" },
    processing: { label: "Processing", className: "order-status order-status--processing" },
    shipped: { label: "Shipped", className: "order-status order-status--shipped" },
    delivered: { label: "Delivered", className: "order-status order-status--delivered" },
    cancelled: { label: "Cancelled", className: "order-status order-status--cancelled" },
};

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function AdminDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = useSelector((state) => state.authReducer.user);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState(null);
    const [ordersError, setOrdersError] = useState(null);

    // same guard as Wishlist.jsx: checks the token locally (synchronous), not just
    // `user` in Redux, which stays null while current() (App.jsx) resolves after a reload
    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        if (user && user.role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [token, user, navigate]);

    useEffect(() => {
        if (!token || !user || user.role !== "admin") return;
        axios
            .get(`${API_URL}/api/admin/stats`, { headers: getAuthHeaders() })
            .then(({ data }) => setStats(data))
            .catch(() => setError("Failed to load dashboard stats"));
        axios
            .get(`${API_URL}/api/admin/orders`, { headers: getAuthHeaders() })
            .then(({ data }) => setOrders(data.orders))
            .catch(() => setOrdersError("Failed to load recent orders"));
    }, [token, user]);

    const handleStatusChange = async (orderId, nextStatus) => {
        const previous = orders;
        setOrders((current) => current.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)));
        try {
            await axios.patch(
                `${API_URL}/api/admin/orders/${orderId}/status`,
                { status: nextStatus },
                { headers: getAuthHeaders() }
            );
            toast.success("Order status updated");
        } catch {
            setOrders(previous);
            toast.error("Failed to update order status");
        }
    };

    if (!token || !user || user.role !== "admin") return null;

    return (
        <div className="admin-dashboard-page">
            <div className="section">
                <SectionHeading title="Admin Dashboard" />
                <p className="admin-dashboard__subtitle">Store overview at a glance</p>
                <AdminNav />

                {error ? (
                    <p className="admin-dashboard__error">{error}</p>
                ) : !stats ? (
                    <p className="text-small home__muted">Loading stats…</p>
                ) : (
                    <div className="admin-dashboard__grid">
                        {STAT_CARDS.map(({ key, label, icon: Icon, format }) => (
                            <div className="admin-dashboard__card" key={key}>
                                <span className="admin-dashboard__card-icon">
                                    <Icon size={22} strokeWidth={2} />
                                </span>
                                <span className="admin-dashboard__card-value">{format(stats[key])}</span>
                                <span className="admin-dashboard__card-label">{label}</span>
                            </div>
                        ))}
                    </div>
                )}

                <h3 className="admin-dashboard__table-heading">Recent Orders</h3>

                {ordersError ? (
                    <p className="admin-dashboard__error">{ordersError}</p>
                ) : !orders ? (
                    <p className="text-small home__muted">Loading orders…</p>
                ) : orders.length === 0 ? (
                    <p className="text-small home__muted">No orders yet.</p>
                ) : (
                    <div className="admin-dashboard__table-card">
                        <div className="admin-dashboard__table-scroll">
                            <table className="admin-dashboard__table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const status = STATUS_META[order.status] || STATUS_META.pending;
                                        return (
                                            <tr key={order._id}>
                                                <td className="admin-dashboard__table-id">{order.orderNumber}</td>
                                                <td>
                                                    <div className="admin-dashboard__customer">
                                                        <span className="admin-dashboard__customer-name">
                                                            {order.customerName}
                                                        </span>
                                                        {order.customerEmail && (
                                                            <span className="admin-dashboard__customer-email">
                                                                {order.customerEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td>
                                                    <div className="admin-dashboard__status-cell">
                                                        <span className={status.className}>{status.label}</span>
                                                        <select
                                                            className="admin-dashboard__status-select"
                                                            value={order.status}
                                                            aria-label={`Update status for order ${order.orderNumber}`}
                                                            onChange={(e) =>
                                                                handleStatusChange(order._id, e.target.value)
                                                            }
                                                        >
                                                            {ORDER_STATUSES.map((s) => (
                                                                <option key={s} value={s}>
                                                                    {STATUS_META[s].label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="admin-dashboard__table-total">
                                                    {formatPrice(order.total)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

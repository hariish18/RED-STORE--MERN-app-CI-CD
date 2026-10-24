import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package } from "lucide-react";

const TABS = [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/products", label: "Products", icon: Package },
];

// Tabs shared between admin dashboard pages
export default function AdminNav() {
    return (
        <nav className="admin-nav" aria-label="Admin sections">
            {TABS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `admin-nav__tab${isActive ? " admin-nav__tab--active" : ""}`}
                >
                    <Icon size={16} strokeWidth={2} />
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}

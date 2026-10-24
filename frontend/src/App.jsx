import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Sale from './pages/Sale'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Wishlist from './pages/Wishlist'
import Error from './pages/Error'
import BarNav from './components/BarNav'
import Profile from './pages/Profile'
import AdminProducts from './pages/AdminProducts'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import AdminProductsManager from './pages/dashboard/AdminProducts'
import PageTransition from './components/PageTransition'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { current } from './JS/actions/auth.action'

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => { dispatch(current()); }, [dispatch]);

  return (
    <div className="App">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* 
         ⭐️ CHANGE HERE: 
         Removed <BarNav /> from here so it is managed 
         page by page inside the <Routes>.
      */}

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ⭐️ HOME PAGE: BarNav is included inside the Home layout */}
            <Route path="/" element={
              <PageTransition>
                <div className="home-layout">
                  <BarNav />
                  <Home />
                </div>
              </PageTransition>
            } />

            {/* ⭐️ OTHER PAGES: BarNav is placed before, as before */}
            <Route path="/shop" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Shop />
                </>
              </PageTransition>
            } />

            <Route path="/new-arrivals" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Shop newArrivals />
                </>
              </PageTransition>
            } />

            <Route path="/sale" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Sale />
                </>
              </PageTransition>
            } />

            <Route path="/about" element={
              <PageTransition>
                <>
                  <BarNav />
                  <About />
                </>
              </PageTransition>
            } />

            <Route path="/contact" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Contact />
                </>
              </PageTransition>
            } />

            <Route path="/shop/:id" element={
              <PageTransition>
                <>
                  <BarNav />
                  <ProductDetail />
                </>
              </PageTransition>
            } />

            <Route path="/cart" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Cart />
                </>
              </PageTransition>
            } />

            <Route path="/checkout" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Checkout />
                </>
              </PageTransition>
            } />

            <Route path="/order-confirmation/:orderNumber" element={
              <PageTransition>
                <>
                  <BarNav />
                  <OrderConfirmation />
                </>
              </PageTransition>
            } />

            <Route path="/register" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Register />
                </>
              </PageTransition>
            } />

            <Route path="/login" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Login />
                </>
              </PageTransition>
            } />

            <Route path="/forgot-password" element={
              <PageTransition>
                <>
                  <BarNav />
                  <ForgotPassword />
                </>
              </PageTransition>
            } />

            <Route path="/reset-password/:token" element={
              <PageTransition>
                <>
                  <BarNav />
                  <ResetPassword />
                </>
              </PageTransition>
            } />

            <Route path="/wishlist" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Wishlist />
                </>
              </PageTransition>
            } />

            <Route path="/profile" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Profile />
                </>
              </PageTransition>
            } />

            <Route path="/admin/products" element={
              <PageTransition>
                <>
                  <BarNav />
                  <AdminProducts />
                </>
              </PageTransition>
            } />

            <Route path="/dashboard/admin" element={
              <PageTransition>
                <>
                  <BarNav />
                  <AdminDashboard />
                </>
              </PageTransition>
            } />

            <Route path="/dashboard/admin/products" element={
              <PageTransition>
                <>
                  <BarNav />
                  <AdminProductsManager />
                </>
              </PageTransition>
            } />

            <Route path="/*" element={
              <PageTransition>
                <>
                  <BarNav />
                  <Error />
                </>
              </PageTransition>
            } />

          </Routes>
        </AnimatePresence>
      </main>


    </div>
  );
}

export default App;
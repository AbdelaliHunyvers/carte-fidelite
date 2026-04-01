import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Scanner from './pages/Scanner';
import CustomerRegister from './pages/CustomerRegister';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<Register onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/join/:programId" element={<CustomerRegister />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout onLogout={() => setIsLoggedIn(false)} />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="programs" element={<Programs />} />
          <Route path="programs/:id" element={<ProgramDetail />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RemitosForm from './components/RemitosForm';
import RemitosList from './components/RemitosList';
import Analisis from './components/Analisis';
import Mapas from './components/Mapas';
import Register from './pages/Register';
import Login from './pages/Login';
import Notfound from './pages/Notfound';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import ResetPassword from './pages/ResetPassword';

export default function App() {

  return (
    <Routes>
      {/* Rutas publicas para no autenticados */}

      <Route path="register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      <Route path="login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />

      {/* Rutas protegidas */}

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<RemitosForm />} />
        <Route path="cargar" element={<RemitosForm />} />
        <Route path="listado" element={<RemitosList />} />
        <Route path="analisis" element={<Analisis />} />
        <Route path="mapas" element={<Mapas />} />


        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Notfound />} />
      </Route>
    </Routes>
  )
}
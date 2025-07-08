import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Faults from "./pages/Faults";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import Departments from "./pages/Departments";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes with Sidebar */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="faults" element={<Faults />} />
                </Routes>
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Customers />
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Users />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Departments />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

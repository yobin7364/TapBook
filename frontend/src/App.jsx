import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Login from "./components/auth/Login";
import RegisterForm from "./components/auth/RegisterForm";
import { HomePage } from "./components/pages/user/HomePage/HomePage";
import UserNavbar from "./components/common/userNavBar";
import UserFooter from "./components/common/UserFooter";
import BookingPage from "./components/pages/user/BookingAppointment/BookingPage";
import MyAppointments from "./components/pages/user/MyAppointments/MyAppointments";
import Membership from "./components/pages/user/Membership/Membership";
import Notifications from "./components/pages/user/Notification/Notifications";
import ProfilePage from "./components/pages/user/profile/ProfilePage";
import ChangePasswordPage from "./components/pages/user/profile/ChangePasswordPage";
import AdminNavBar from "./components/common/AdminNavBar";
import Dashboard from "./components/pages/admin/Dashboard/Dashboard";
import AppointmentTabs from "./components/pages/admin/Appointment/Appointment";
import ServiceSettingsPage from "./components/pages/admin/Service/ServiceSettingsPage";
import CustomerReviewsPage from "./components/pages/admin/Reviews/CustomerReviewsPage";
import CancelAppointments from "./components/pages/admin/CancelAppointments/CancelAppointments";

import { useSelector } from "react-redux";
import setAuthToken from "./utils/setAuthToken";
import { jwtDecode } from "jwt-decode";
import { setCurrentUser, logout } from "./redux/authSlice";
import PrivateRoute from "./components/common/PrivateRoute";
import ReportPage from "./components/pages/admin/ReportPage/ReportPage";
import AddServiceForm from "./components/pages/admin/Service/AddServiceForm";

if (localStorage.authToken) {
  setAuthToken(localStorage.authToken);
  const decoded = jwtDecode(localStorage.authToken);
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logout());
    window.location.href = "/login";
  }
}

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentRole = useSelector((state) => state.auth.user?.role);

  return (
    <Router>
      {currentRole == "admin" && <AdminNavBar />}
      {currentRole !== "admin" && <UserNavbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registerForm" element={<RegisterForm />} />
        <Route path="/bookingPage/:serviceId" element={<BookingPage />} />

        {currentRole == "admin" ? (
          <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/dashboardPage" element={<Dashboard />} />
            <Route path="/manageAppointment" element={<AppointmentTabs />} />
            <Route path="/serviceSetting" element={<ServiceSettingsPage />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/changePassword" element={<ChangePasswordPage />} />
            <Route path="/ratingPage" element={<CustomerReviewsPage />} />
            <Route path="/reportPage" element={<ReportPage />} />
            <Route
              path="/cancelAppointments"
              element={<CancelAppointments />}
            />

            <Route path="/addServiceForm" element={<AddServiceForm />} />
          </Route>
        ) : (
          <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/myAppointments" element={<MyAppointments />} />

            <Route path="/myMembership" element={<Membership />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/changePassword" element={<ChangePasswordPage />} />
          </Route>
        )}
      </Routes>
      <UserFooter />
    </Router>
  );
}

export default App;

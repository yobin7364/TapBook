import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Login from "./components/auth/Login";
import RegisterForm from "./components/auth/RegisterForm";
import { HomePage } from "./components/pages/user/HomePage/HomePage";
import UserNavbar from "./components/common/userNavBar";
import UserFooter from "./components/common/UserFooter";
import BookingPage from "./components/pages/user/BookingAppointment/BookingPage";
import AppointmentSummary from "./components/pages/user/BookingAppointment/AppointmentSummary";
import MyAppointments from "./components/pages/user/MyAppointments/MyAppointments";
import UpdateAppointment from "./components/pages/user/MyAppointments/UpdateAppointment";
import Membership from "./components/pages/user/Membership/Membership";
import Notifications from "./components/pages/user/Notification/Notifications";
import ProfilePage from "./components/pages/user/profile/ProfilePage";
import ChangePasswordPage from "./components/pages/user/profile/ChangePasswordPage";

import { useSelector } from "react-redux";
import setAuthToken from "./utils/setAuthToken";
import { jwtDecode } from "jwt-decode";
import { setCurrentUser, logout } from "./redux/authSlice";
import PrivateRoute from "./components/common/PrivateRoute";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const currentRole = useSelector((state) => state.auth.user?.role[0]);

  // Check for token to maintain auth state
  if (localStorage.authToken) {
    // Set auth header
    setAuthToken(localStorage.authToken);

    // Decode token to get user data
    const decoded = jwtDecode(localStorage.authToken);

    // Set current user in Redux
    store.dispatch(setCurrentUser(decoded));

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      store.dispatch(logout());
      window.location.href = "/login";
    }
  }

  return (
    <Provider store={store}>
      <Router>
        <UserNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registerForm" element={<RegisterForm />} />
          <Route path="/bookingPage" element={<BookingPage />} />
          <Route path="/appointmentSummary" element={<AppointmentSummary />} />

          <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/myAppointments" element={<MyAppointments />} />
            <Route path="/updateAppointment" element={<UpdateAppointment />} />
            <Route path="/myMembership" element={<Membership />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/changePassword" element={<ChangePasswordPage />} />
          </Route>
        </Routes>
        <UserFooter />
      </Router>
    </Provider>
  );
}

export default App;

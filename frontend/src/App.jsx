import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Login from "./components/auth/Login";
import RegisterForm from "./components/auth/RegisterForm";
import HomePage from "./components/pages/user/HomePage/HomePage";
import NavBar from "./components/common/NavBar";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registerForm" element={<RegisterForm />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

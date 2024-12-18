import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/Login";
import SignUp from "./components/SignUp";
import Preferences from "./components/Preferences";
import Chatbot from "./components/Chatbot";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<SignIn />} />
                <Route path="/" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
        </Router>
    );
};

export default App;

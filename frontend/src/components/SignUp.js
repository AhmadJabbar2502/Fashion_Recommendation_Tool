import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css"; // Importing the CSS file for styling

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setName] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Call your backend API to register the user
        const response = await fetch("http://localhost:8000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
                email
            })
        });

        if (response.ok) {
            // Navigate to preferences page after successful signup
            navigate("/preferences", { state: { username, email, password } });
        } else {
            alert("Sign up failed, please try again.");
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp} className="auth-form">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={username}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="auth-button">Sign Up</button>
            </form>
            <div className="auth-footer">
                <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
        </div>
    );
};

export default SignUp;

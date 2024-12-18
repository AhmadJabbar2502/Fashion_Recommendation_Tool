import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './Preferences.css';

const Preferences = () => {
    const [selectedColors, setSelectedColors] = useState([]);
    const [wearTypes, setWearTypes] = useState([]);
    const [fashionStyles, setFashionStyles] = useState([]);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // On page load, get user data from the signup page (sent via navigate state)
    useEffect(() => {
        if (location.state) {
            const { username, email, password } = location.state;
            setUsername(username);
            setEmail(email);
            setPassword(password);
        }
    }, [location.state]);

    const colors = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple"];

    const toggleColorSelection = (color) => {
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter(item => item !== color));
        } else {
            if (selectedColors.length < 4) {
                setSelectedColors([...selectedColors, color]);
            } else {
                alert("You can only select up to 4 colors.");
            }
        }
    };

    const toggleWearType = (type) => {
        setWearTypes(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
    };

    const toggleFashionStyle = (style) => {
        setFashionStyles(prev => prev.includes(style) ? prev.filter(item => item !== style) : [...prev, style]);
    };

    const handlePreferencesSubmit = async () => {
        // Combine user info with preferences
        const preferencesData = {
            username,
            email,
            password,
            preferredColors: selectedColors,
            wearTypes,
            fashionStyles
        };

        // Call the backend API to register the user with preferences
        const response = await fetch("http://localhost:8000/register_with_preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(preferencesData)
        });

        if (response.ok) {
            // Navigate to chatbot after successful registration
            navigate("/chatbot");
        } else {
            alert("Error saving preferences, please try again.");
        }
    };

    return (
        <div className="preferences-container">
            <h2>Fashion Preferences</h2>

            {/* Color Preferences */}
            <div className="preference-group">
                <label>Colors Preferred (Select up to 4)</label>
                <div className="colors-container">
                    {colors.map((color) => (
                        <div
                            key={color}
                            className={`color-tile ${selectedColors.includes(color) ? "selected" : ""}`}
                            onClick={() => toggleColorSelection(color)}
                        >
                            {color}
                        </div>
                    ))}
                </div>
            </div>

            {/* Wear Type Preferences */}
            <div className="preference-group">
                <label>Wear Type</label>
                <div className="tiles-container">
                    {["Casual", "Formal", "Sports", "Party"].map((type) => (
                        <div
                            key={type}
                            className={`tile ${wearTypes.includes(type) ? "selected" : ""}`}
                            onClick={() => toggleWearType(type)}
                        >
                            {type}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fashion Style Preferences */}
            <div className="preference-group">
                <label>Fashion Style</label>
                <div className="tiles-container">
                    {["Minimalist", "Trendy", "Classic", "Bohemian"].map((style) => (
                        <div
                            key={style}
                            className={`tile ${fashionStyles.includes(style) ? "selected" : ""}`}
                            onClick={() => toggleFashionStyle(style)}
                        >
                            {style}
                        </div>
                    ))}
                </div>
            </div>

            <button className="submit-btn" onClick={handlePreferencesSubmit}>Submit Preferences</button>
        </div>
    );
};

export default Preferences;

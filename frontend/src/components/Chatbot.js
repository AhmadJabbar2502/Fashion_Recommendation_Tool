import React, { useState } from "react";
import "./Chatbot.css"; // Import the CSS for styling

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);

    const handleUserInput = (e) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (userInput.trim() === "") return;

        // Add user message to the chat
        setMessages([...messages, { sender: "user", text: userInput }]);
        setUserInput(""); // Clear input field

        // Show typing indicator
        setIsBotTyping(true);

        // Send user message to the backend
        try {
            const response = await fetch("http://localhost:8000/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });

            const data = await response.json();
            console.log(data)
            const ids = data.ids;

            const generateImagePaths = (ids) => {
                const imagePaths = [];
            
                // Loop through each ID and generate the image paths
                ids.forEach((id) => {
                    const imagePath1 = `/images/${id}/image1.jpg`;  // Path for image 1
                    const imagePath2 = `/images/${id}/image2.jpg`;  // Path for image 2
            
                    // Add both paths to the array
                    imagePaths.push(imagePath1, imagePath2);
                });
            
                return imagePaths;
            };
            let images = []
            images = generateImagePaths(ids)

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "bot", text: data.response, images},
            ]);

            // Hide typing indicator
            setIsBotTyping(false);
        } catch (error) {
            setIsBotTyping(false);
            console.error("Error:", error);
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chat-window">
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`}>
                        <div className="message-text">{message.text}</div>
                        {message.images &&
                            message.images.map((image, imgIndex) => (
                                <img
                                    key={imgIndex}
                                    src={image}
                                    alt="Product"
                                    className="message-image"
                                />
                            ))}
                    </div>
                ))}
                {isBotTyping && (
                    <div className="chat-message bot typing-indicator">
                        <div className="typing">Typing...</div>
                    </div>
                )}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleUserInput}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chatbot;

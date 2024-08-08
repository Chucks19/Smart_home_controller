import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [devices, setDevices] = useState([]);
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3002/devices', {
                headers: { Authorization: token }
            }).then(response => {
                setDevices(response.data);
            }).catch(error => {
                console.error('Error fetching devices:', error);
            });
        }
    }, [token]);

    const login = () => {
        axios.post('http://localhost:3002/login', { username, password })
            .then(response => {
                setToken(response.data.token);
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    };

    const register = () => {
        axios.post('http://localhost:3002/register', { username: newUsername, password: newPassword })
            .then(response => {
                setToken(response.data.token);
                setIsRegistering(false);
            })
            .catch(error => {
                console.error('Registration error:', error);
            });
    };

    const updateDevice = (id, updatedDevice) => {
        axios.put(`http://localhost:3002/devices/${id}`, updatedDevice, {
            headers: { Authorization: token }
        }).then(response => {
            setDevices(devices.map(device => device._id === id ? response.data : device));
        }).catch(error => {
            console.error('Error updating device:', error);
        });
    };

    return (
        <div className="app-container">
            {!token ? (
                <div className="auth-form">
                    {isRegistering ? (
                        <div className="register-form">
                            <h2>Register</h2>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="New Username"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                            />
                            <button onClick={register}>Register</button>
                            <p>
                                Already have an account?{' '}
                                <span onClick={() => setIsRegistering(false)} className="switch-form">
                                    Login
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div className="login-form">
                            <h2>Login</h2>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                            <button onClick={login}>Login</button>
                            <p>
                                Don't have an account?{' '}
                                <span onClick={() => setIsRegistering(true)} className="switch-form">
                                    Register
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <h1>Smart Home Controller</h1>
                    <div className="devices">
                        {devices.map(device => (
                            <div key={device._id} className="device">
                                <h2>{device.name}</h2>
                                <p>Type: {device.type}</p>
                                <p>Status: {device.status}</p>
                                <button onClick={() => updateDevice(device._id, { ...device, status: device.status === 'on' ? 'off' : 'on' })}>
                                    Turn {device.status === 'on' ? 'Off' : 'On'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="notifications">
                        <h2>Notifications</h2>
                        {notifications.map((notification, index) => (
                            <div key={index} className="notification">
                                {notification}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

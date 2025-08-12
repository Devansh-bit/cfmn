import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import './App.css';

// Define a type for the user profile state
interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    reputation: number;
}

function App() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
        setError(null);
        console.log('Login Success:', credentialResponse);

        // The credential is the ID token JWT.
        const idToken = credentialResponse.credential;

        if (!idToken) {
            setError("Failed to get ID token from Google.");
            return;
        }

        try {
            // Send the ID token to your backend for verification and user creation/login
            const response = await fetch('http://localhost:3000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Backend verification failed');
            }

            const userData: UserProfile = await response.json();
            setUser(userData); // Set the user state with data from your backend
        } catch (err) {
            console.error('Backend communication error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
    };

    const handleLoginError = () => {
        console.log('Login Failed');
        setError('Google login failed. Please try again.');
    };

    const handleLogout = () => {
        setUser(null);
        // Here you would also clear any session/token stored locally
    };

    return (
        <>
            <h1>Help Me Find My Notes</h1>
            <div className="card">
                {user ? (
                    <div>
                        <h2>Welcome, {user.full_name}!</h2>
                        <p>Email: {user.email}</p>
                        <p>Reputation: {user.reputation}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div>
                        <h2>Please sign in to continue</h2>
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={handleLoginError}
                            useOneTap
                        />
                    </div>
                )}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </>
    );
}

export default App;

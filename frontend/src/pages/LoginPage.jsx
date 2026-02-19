import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser, loginUser, persistSession } from '../lib/authApi';

export default function LoginPage() {
    const [accountType, setAccountType] = useState('Student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            const loginResponse = await loginUser(email, password);
            const me = await fetchCurrentUser(loginResponse.access_token);

            persistSession(loginResponse.access_token, me.user_type);
            navigate('/');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAccountTypeClick = (type) => {
        setAccountType(type);
        setErrorMessage('');
    };

    return (
        <div className="relative max-w-md px-4 pt-24 mx-auto rounded-lg shadow-md bg-bg-main text-text-main">
            <div className="p-6 border rounded-lg shadow-lg bg-bg-secondary border-fg/5">
                <h1 className="mb-4 text-2xl font-bold text-center">Logga in</h1>

                {/* Tabs for Account Types */}
                <div className="flex justify-center mb-6 space-x-4">
                    {['Student', 'Företag', 'Skola'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleAccountTypeClick(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${accountType === type
                                ? 'bg-accent text-white'
                                : 'bg-bg-hover text-text-muted hover:bg-bg-hover/80'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleLogin} className="p-4 space-y-4 rounded-lg bg-bg-secondary">
                    {/* Email/School Email/Company Email */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">{accountType === 'Student' ? 'E-post' : accountType === 'Företag' ? 'Företagsmail' : 'Mailadress till skolan'}</label>
                        <input
                            type="email"
                            placeholder={accountType === 'Student' ? 'Din e-postadress' : accountType === 'Företag' ? 'Företagsmail' : 'Skolans e-postadress'}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Lösenord</label>
                        <input
                            type="password"
                            placeholder="Ditt lösenord"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {errorMessage ? (
                        <p className="text-sm text-red-400">{errorMessage}</p>
                    ) : null}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 text-sm font-bold text-center text-white rounded-lg bg-accent hover:bg-accent-hover focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                        {isSubmitting ? 'Loggar in...' : 'Logga in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

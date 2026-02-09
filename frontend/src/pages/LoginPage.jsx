import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [accountType, setAccountType] = useState('Student');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Map account type to role
        const roleMap = {
            'Student': 'privatperson',
            'Företag': 'foretag',
            'Skola': 'skola'
        };

        // Store the role in localStorage (temporary until real auth is implemented)
        localStorage.setItem('userRole', roleMap[accountType]);

        // Dispatch custom event to notify navbar of role change
        window.dispatchEvent(new Event('userRoleChanged'));

        // Redirect to home page
        navigate('/');
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
                            onClick={() => setAccountType(type)}
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
                            className="w-full px-3 py-2 border rounded-lg bg-bg-input border-border text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Lösenord</label>
                        <input
                            type="password"
                            placeholder="Ditt lösenord"
                            className="w-full px-3 py-2 border rounded-lg bg-bg-input border-border text-text-main focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-2 text-sm font-bold text-center text-white rounded-lg bg-accent hover:bg-accent-hover focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    >
                        Logga in
                    </button>
                </form>
            </div>
        </div>
    );
}

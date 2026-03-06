import React from 'react';

export default class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Keep a trace in console for debugging in production incidents.
        // eslint-disable-next-line no-console
        console.error('Unhandled app error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.assign('/');
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-screen px-6 pt-32 pb-20 mx-auto max-w-3xl">
                <div className="p-6 border rounded-2xl border-red-500/20 bg-red-500/5">
                    <h1 className="mb-2 text-2xl font-bold font-display text-text-main">Något gick fel</h1>
                    <p className="mb-5 text-sm text-text-muted">
                        Sidan kunde inte renderas korrekt. Prova att ladda om eller gå tillbaka till startsidan.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-accent hover:bg-accent/90"
                        >
                            Ladda om sidan
                        </button>
                        <button
                            type="button"
                            onClick={this.handleGoHome}
                            className="px-4 py-2 text-sm font-semibold border rounded-lg border-fg/15 text-text-main hover:border-accent/40 hover:text-accent"
                        >
                            Gå till startsidan
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[rgb(var(--color-text-secondary))]">Loading...</p>
            </div>
        </div>
    );
}

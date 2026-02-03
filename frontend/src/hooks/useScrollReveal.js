import { useEffect } from 'react';

export default function useScrollReveal() {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal-up');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }); // Run on every render to catch new elements, or added dependency if needed. 
    // For a simple landing page, running without dependency array (on every update) or [] (on mount) depends. 
    // Since React re-renders, elements might be re-created. 
    // But safer is probably to use a Ref or just run it. 
    // Let's run it inside a useEffect with zero deps but maybe add a slight timeout or just accept it runs once on mount for static content.
    // Actually, for dynamic content, we'd want to observe refs. 
    // But to keep it "similar to code pasted" (Vanilla style), running a global selector in useEffect is the closest simple match.
}

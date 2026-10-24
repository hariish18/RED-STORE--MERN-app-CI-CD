import { useState, useEffect } from 'react';

export default function PromoBanner() {
    const [timeLeft, setTimeLeft] = useState({ h: 14, m: 32, s: 18 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="bg-red-600 text-white py-10 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold font-anton">LIMITED EDITION</h2>
                    <p className="text-5xl font-black  font-anton  mt-2">-25%</p>
                    <p className="text-sm opacity-90 mt-1">On the entire collection</p>
                </div>
                <div className="flex gap-4 text-xl font-mono font-bold bg-white/20 px-6 py-3 rounded-xl">
                    <span>{String(timeLeft.h).padStart(2, '0')}h</span> :
                    <span>{String(timeLeft.m).padStart(2, '0')}m</span> :
                    <span>{String(timeLeft.s).padStart(2, '0')}s</span>
                </div>
            </div>
        </section>
    );
}
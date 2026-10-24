import { Truck, ShieldCheck, RotateCcw, Headset } from 'lucide-react';

export default function TrustBadges() {
  return (
    <section className="bg-white py-8 border-b border-gray-100">
  {/* Make sure you have grid-cols-2 md:grid-cols-4 */}
  <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
      
      {/* ... your 4 items ... */}
      

        {/* 1. Delivery */}
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <Truck className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-200" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">
            Fast Delivery
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            - 24/48h
          </p>
        </div>

        {/* 2. Payment */}
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <ShieldCheck className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-200" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">
            100% Secure Payment
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            - SSL Encryption
          </p>
        </div>

        {/* 3. Returns */}
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <RotateCcw className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-200" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">
            Free Returns
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            - Within 30 Days
          </p>
        </div>

        {/* 4. Support */}
        <div className="flex flex-col items-center gap-2 group cursor-default">
          <Headset className="w-8 h-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-200" />
          <h4 className="font-bold text-sm text-[var(--color-text)]">
            Service Client 24/7
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            - Always here for you
          </p>
        </div>

      </div>
    </section>
  );
}
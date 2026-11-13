export default function GlassHeroLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==========================================
          🚀 HERO SECTION (သင့်ပုံထဲကအတိုင်း)
      ========================================== */}
      <section className="relative min-h-[80vh] flex items-center justify-end p-6 md:p-16 lg:p-24 overflow-hidden">
        {/* နောက်ခံပုံ (Background Image) */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-slate-800"></div>
        )}

        {/* ပုံကို မှောင်ခွပြီး စာသားကို ထင်ရှားစေမယ့် Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/30 to-black/60" />

        {/* ဖန်သားပြင်လို ဝါကျဲကျဲ စာသားအကွက် (Glassmorphism Card) */}
        <div className="relative z-10 w-full max-w-xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 md:p-10 shadow-2xl space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {product.title}
          </h1>

          <p className="text-slate-100 text-sm md:text-base leading-relaxed">
            {product.description || "No description provided for this product."}
          </p>
        </div>
      </section>

      {/* ==========================================
          🚀 ARCHITECTURE / FEATURES SECTION
      ========================================== */}
      <section className="bg-[#0f4c5c] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* ခေါင်းစဉ် */}

          {/* Cards (Features) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="bg-black/20 border border-white/10 rounded-2xl p-6 hover:bg-black/30 transition"
              >
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CustomHrLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  const half = Math.ceil(cards.length / 2);
  const leftCards = cards.slice(0, half);
  const rightCards = cards.slice(half);

  const renderFeatureCard = (card: any) => (
    <div
      key={card.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3 hover:border-teal-500/40 transition"
    >
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-12 h-12 object-cover rounded-lg border border-slate-800"
        />
      )}
      <h3 className="text-lg font-bold text-teal-400 underline underline-offset-4 decoration-teal-500/40">
        {card.title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {card.description || "No additional description."}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-slate-800">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-6">
          <div className="space-y-5 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono rounded-full">
              {product.category?.name || "Category"}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              {product.title}
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              {product.description ||
                "No description provided for this product."}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <p className="text-teal-400 text-xs font-mono uppercase tracking-widest">
            What's inside
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Features of {product.title}
          </h2>
        </div>

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              {leftCards.map(renderFeatureCard)}
            </div>

            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative w-60 md:w-64 aspect-[9/19] rounded-[2.5rem] border-[10px] border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-950 rounded-full z-10" />
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center px-4 text-teal-400 font-bold">
                    {product.title}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 order-3">
              {rightCards.map(renderFeatureCard)}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 italic text-sm">
            No card items found for this product yet.
          </div>
        )}
      </section>
    </div>
  );
}

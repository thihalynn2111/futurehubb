export default function ZPatternLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400">
            {product.title}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
            {product.description || "No description provided for this product."}
          </p>
        </div>

        {/* Cards (Z-Pattern) */}
        <div className="space-y-24">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-80 object-cover rounded-3xl shadow-2xl border border-slate-700"
                  />
                ) : (
                  <div className="w-full h-80 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 shadow-inner">
                    No Image
                  </div>
                )}
              </div>

              {/* Text Side */}
              <div className="w-full md:w-1/2 space-y-4">
                <span className="text-teal-400 font-mono text-sm tracking-widest uppercase bg-teal-500/10 px-3 py-1 rounded-full inline-block">
                  Step 0{index + 1}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold">{card.title}</h2>
                <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">
                  {card.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-2xl text-slate-400 italic">
              No features available for this product yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

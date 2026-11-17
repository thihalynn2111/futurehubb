export default function ZPatternLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="bg-slate-950 text-white py-12 px-6">
      <div
        className={`max-w-6xl mx-auto ${cards.length > 0 ? "space-y-20" : ""}`}
      >
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
        {cards.length > 0 && (
          <div className="space-y-20">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
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

                <div className="w-full md:w-1/2 space-y-4">
                  <span className="text-teal-400 font-mono text-sm tracking-widest uppercase bg-teal-500/10 px-3 py-1 rounded-full inline-block">
                    Step 0{index + 1}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {card.title}
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed whitespace-pre-line">
                    {card.description || "No description provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GridGalleryLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative flex items-center justify-center text-center px-6 py-20 md:py-28">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover brightness-50"
          />
        )}
        <div className="relative z-10 space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            {product.title}
          </h1>
          <p className="text-lg text-slate-200">
            {product.description || "No description provided for this product."}
          </p>
        </div>
      </div>

      {/* Grid Features */}
      {cards.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg hover:border-teal-500/40 transition"
              >
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-teal-400 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

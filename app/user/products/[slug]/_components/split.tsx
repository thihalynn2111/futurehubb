export default function SplitFocusLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Left Side: Text */}
      <div className="w-full md:w-1/2 p-8 md:p-16 space-y-10">
        <div
          className={`space-y-4 ${
            cards.length > 0 ? "pb-10 border-b border-slate-800" : ""
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            {product.title}
          </h1>
          <p className="text-slate-300 text-lg">
            {product.description || "No description provided for this product."}
          </p>
        </div>

        {cards.length > 0 && (
          <div className="space-y-10">
            {cards.map((card) => (
              <div key={card.id} className="flex gap-6">
                <div className="shrink-0 w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold text-xl">
                  {card.number || "★"}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-teal-400">
                    {card.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side: Sticky Image (md:h-screen ဖယ်ထားတယ်) */}
      <div className="w-full md:w-1/2 bg-slate-900 p-8 md:p-16 flex items-start justify-center">
        <div className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 md:sticky md:top-24">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
              No Image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

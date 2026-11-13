export default function SplitFocusLayout({
  product,
  cards,
}: {
  product: any;
  cards: any[];
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side: Scrolling Text */}
      <div className="w-full md:w-1/2 p-8 md:p-16 space-y-12">
        <div className="space-y-4 pb-10 border-b border-slate-200">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            {product.title}
          </h1>
          <p className="text-slate-600 text-lg">{product.description}</p>
        </div>

        <div className="space-y-10">
          {cards.map((card) => (
            <div key={card.id} className="flex gap-6">
              <div className="shrink-0 w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xl">
                {card.number || "★"}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  {card.title}
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Sticky Image */}
      <div className="w-full md:w-1/2 bg-slate-100 p-8 md:p-16 flex items-center justify-center md:sticky md:top-0 md:h-screen">
        <div className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              No Image
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

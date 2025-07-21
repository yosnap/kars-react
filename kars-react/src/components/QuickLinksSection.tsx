const QuickLinksSection = () => {
  const quickLinks = [
    {
      id: "seminous",
      title: "Cotxes Seminous",
      subtitle: "a Andorra", 
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80",
      query: "?estat-vehicle=Seminou&ubicacio=andorra"
    },
    {
      id: "nous",
      title: "Cotxes Nous",
      subtitle: "a Andorra",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80", 
      query: "?estat-vehicle=Nou&ubicacio=andorra"
    },
    {
      id: "ocasio",
      title: "Cotxes Ocasió", 
      subtitle: "a Andorra",
      image: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80",
      query: "?estat-vehicle=Ocasio&ubicacio=andorra"
    },
    {
      id: "autocaravanes",
      title: "Autocaravanes",
      subtitle: "a Andorra",
      image: "https://images.unsplash.com/photo-1544536669-cc333a1ab241?auto=format&fit=crop&q=80",
      query: "?tipus-vehicle=Autocaravana&ubicacio=andorra"
    },
    {
      id: "classics",
      title: "Cotxes Clàssics",
      subtitle: "a Andorra", 
      image: "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?auto=format&fit=crop&q=80",
      query: "?categoria=Classic&ubicacio=andorra"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Seminous */}
          <div className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quickLinks[0].image}
                alt={quickLinks[0].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{quickLinks[0].title}</h3>
                  <p className="text-sm">{quickLinks[0].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Nous */}
          <div className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quickLinks[1].image}
                alt={quickLinks[1].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{quickLinks[1].title}</h3>
                  <p className="text-sm">{quickLinks[1].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Autocaravanes */}
          <div className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quickLinks[3].image}
                alt={quickLinks[3].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{quickLinks[3].title}</h3>
                  <p className="text-sm">{quickLinks[3].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Ocasió */}
          <div className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg md:col-span-2">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quickLinks[2].image}
                alt={quickLinks[2].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold">{quickLinks[2].title}</h3>
                  <p className="text-base">{quickLinks[2].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Clàssics */}
          <div className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow rounded-lg">
            <div className="relative h-48 overflow-hidden">
              <img
                src={quickLinks[4].image}
                alt={quickLinks[4].title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold">{quickLinks[4].title}</h3>
                  <p className="text-sm">{quickLinks[4].subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection; 
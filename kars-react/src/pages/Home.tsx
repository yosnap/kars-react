import HeroSection from "../components/HeroSection";
import FeaturedVehicles from "../components/FeaturedVehicles";
import Footer from "../components/Footer";

export default function Home({ onSearch }: { onSearch: (params: { vehicleType?: string; searchTerm?: string }) => void }) {
  return (
    <div className="min-h-screen">
      <HeroSection onSearch={onSearch} />
      <FeaturedVehicles />
      <Footer />
    </div>
  );
}
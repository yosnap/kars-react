import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React from "react";

// TODO: Integrar con el selector de idioma global
const currentLang = "ca"; // Cambiar a 'ca', 'en', 'fr' según el idioma

interface BreadcrumbLabel {
  es: string;
  ca: string;
  en: string;
  fr: string;
}

interface BrandOption {
  value: string;
  label: string;
}

interface PageBreadcrumbItem {
  label: BreadcrumbLabel;
  href?: string;
  icon?: React.ComponentType<unknown>;
}

interface PageBreadcrumbsProps {
  items: PageBreadcrumbItem[];
  brands?: BrandOption[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[ -]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Mapeo de tipos de vehículos para las migas de pan
function mapVehicleType(type: string): string {
  const mapping: Record<string, string> = {
    "autocaravana": "autocaravana-camper",
    "caravana": "autocaravana-camper",
    "moto": "moto-quad-atv",
    "quad": "moto-quad-atv",
    "atv": "moto-quad-atv",
    "comercial": "vehicle-comercial",
    "furgoneta": "vehicle-comercial",
    "coche": "cotxe",
    "cotxe": "cotxe"
  };
  
  return mapping[type.toLowerCase()] || type.toLowerCase();
}

const PageBreadcrumbs = ({ items, brands = [] }: PageBreadcrumbsProps) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tipusVehicle = params.get("tipus-vehicle") || "";

  const allItems = [
    { label: { es: "Inicio", ca: "Inici", en: "Home", fr: "Accueil" }, href: "/", icon: Home },
    ...items
  ];

  return (
    <div className="py-4">
      <Breadcrumb>
        <BreadcrumbList className="flex items-center space-x-2">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const Icon = item.icon;
            const label = typeof item.label === "string" ? item.label : item.label[currentLang];
            let href = item.href || "/";
            if (href.includes("marques-cotxe")) {
              const url = new URL(href, window.location.origin);
              if (tipusVehicle) {
                url.searchParams.set("tipus-vehicle", mapVehicleType(tipusVehicle));
              }
              // Busca el slug (value) en brands, si no lo encuentra usa slugify
              const marcaLabel = typeof item.label === "string" ? item.label : item.label[currentLang];
              const brandObj = brands.find(b => b.label.toLowerCase() === marcaLabel.toLowerCase());
              const marcaSlug = brandObj ? brandObj.value : slugify(marcaLabel);
              url.searchParams.set("marques-cotxe", marcaSlug);
              href = url.pathname + "?" + url.searchParams.toString();
            } else if (href.includes("vehicles-andorra") && tipusVehicle) {
              const url = new URL(href, window.location.origin);
              url.searchParams.set("tipus-vehicle", mapVehicleType(tipusVehicle));
              href = url.pathname + "?" + url.searchParams.toString();
            }
            return (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center font-semibold text-primary">
                      {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />}
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="flex items-center text-white hover:text-primary transition-colors font-medium"
                    >
                      <Link to={href}>
                        {Icon && <Icon className="w-4 h-4 mr-2 text-white" />}
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="mx-2">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default PageBreadcrumbs; 
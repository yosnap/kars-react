import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

// TODO: Integrar con el selector de idioma global
const currentLang = "es"; // Cambiar a 'ca', 'en', 'fr' según el idioma

interface BreadcrumbLabel {
  es: string;
  ca: string;
  en: string;
  fr: string;
}

interface PageBreadcrumbItem {
  label: BreadcrumbLabel;
  href?: string;
  icon?: React.ComponentType<unknown>;
}

interface PageBreadcrumbsProps {
  items: PageBreadcrumbItem[];
}

const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => {
  const allItems = [
    { label: { es: "Inicio", ca: "Inici", en: "Home", fr: "Accueil" }, href: "/", icon: Home },
    ...items
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center space-x-2">
            {allItems.map((item, index) => {
              const isLast = index === allItems.length - 1;
              const Icon = item.icon;
              const label = typeof item.label === "string" ? item.label : item.label[currentLang];
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
                        className="flex items-center text-gray-700 hover:text-primary transition-colors font-medium"
                      >
                        <Link to={item.href || "/"}>
                          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="mx-2">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default PageBreadcrumbs; 
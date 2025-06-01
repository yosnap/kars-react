import React from "react";
import { Link } from "react-router-dom";

// TODO: Integrar con el selector de idioma global
const currentLang = "es"; // Cambiar a 'ca', 'en', 'fr' según el idioma

interface BreadcrumbItem {
  href: string;
  label: {
    es: string;
    ca: string;
    en: string;
    fr: string;
  };
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center">
            {idx > 0 && <span className="mx-2 text-gray-400">/</span>}
            {idx < items.length - 1 ? (
              <Link to={item.href} className="text-primary hover:underline">
                {item.label[currentLang]}
              </Link>
            ) : (
              <span className="text-gray-700 font-semibold">{item.label[currentLang]}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 
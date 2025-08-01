import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid2X2, LayoutList } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ListViewControlsProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  sortBy?: string;
  onSortByChange?: (sortBy: string) => void;
  currentPage: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

const ListViewControls = ({
  viewMode,
  onViewModeChange,
  itemsPerPage = 12,
  onItemsPerPageChange,
  sortBy = "featured",
  onSortByChange,
  //currentPage = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0
}: ListViewControlsProps) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-700/50 shadow-xl text-white">
      {/* DESKTOP: Todo en una sola fila horizontal forzada */}
      <div className="hidden lg:flex lg:items-center lg:gap-4 lg:flex-nowrap lg:min-h-[40px]">
        {/* Contador de resultados - flex-shrink para que se comprima si es necesario */}
        <div className="text-sm text-gray-300 flex-shrink-0">
          <span className="font-medium">
            {t('controls.showing')} {startIndex + 1} - {Math.min(endIndex, totalItems)} {t('controls.of')} {totalItems.toLocaleString()} {t('controls.results')}
          </span>
        </div>

        {/* Espaciador flexible */}
        <div className="flex-1"></div>

        {/* Todos los controles en línea horizontal - sin flex-wrap */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Selector de ordenación - más compacto */}
          {onSortByChange && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.sort_by')}</span>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                  <SelectValue placeholder={t('controls.select_option')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50">
                  <SelectItem value="featured" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.featured_first')}</SelectItem>
                  <SelectItem value="price_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.price_low_high')}</SelectItem>
                  <SelectItem value="price_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.price_high_low')}</SelectItem>
                  <SelectItem value="date_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.newest_first')}</SelectItem>
                  <SelectItem value="date_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.oldest_first')}</SelectItem>
                  <SelectItem value="title_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.alphabetic_az')}</SelectItem>
                  <SelectItem value="title_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">{t('controls.alphabetic_za')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mostrar - más compacto */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.show')}</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
              <SelectTrigger className="w-16 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50">
                <SelectItem value="5" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">5</SelectItem>
                <SelectItem value="10" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">10</SelectItem>
                <SelectItem value="12" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">12</SelectItem>
                <SelectItem value="24" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">24</SelectItem>
                <SelectItem value="36" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">36</SelectItem>
                <SelectItem value="48" className="text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vista - sin cambios */}
          <div className="flex items-center gap-1 border border-gray-600 rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-r-none ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`rounded-l-none ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET: Layout original */}
      <div className="lg:hidden">
        {/* Contador de resultados */}
        <div className="text-sm text-gray-300 mb-4">
          <span className="font-medium">
            {t('controls.showing')} {startIndex + 1} - {Math.min(endIndex, totalItems)} {t('controls.of')} {totalItems.toLocaleString()} {t('controls.results')}
          </span>
        </div>

        {/* Controles */}
        <div className="space-y-4">
        {/* MÓVIL: Selector de ordenación ancho completo */}
        {onSortByChange && (
          <div className="flex md:hidden items-center gap-2">
            <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.sort_by')}</span>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="flex-1 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                <SelectValue placeholder={t('controls.select_option')} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50 text-white">
                <SelectItem value="featured" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.featured_first')}</SelectItem>
                <SelectItem value="price_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.price_low_high')}</SelectItem>
                <SelectItem value="price_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.price_high_low')}</SelectItem>
                <SelectItem value="date_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.newest_first')}</SelectItem>
                <SelectItem value="date_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.oldest_first')}</SelectItem>
                <SelectItem value="title_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.alphabetic_az')}</SelectItem>
                <SelectItem value="title_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.alphabetic_za')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* MÓVIL: Mostrar + vista en una fila */}
        <div className="flex md:hidden items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.show')}</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
              <SelectTrigger className="w-20 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50 text-white">
                <SelectItem value="5" className="text-white hover:bg-gray-700 focus:bg-gray-700">5</SelectItem>
                <SelectItem value="10" className="text-white hover:bg-gray-700 focus:bg-gray-700">10</SelectItem>
                <SelectItem value="12" className="text-white hover:bg-gray-700 focus:bg-gray-700">12</SelectItem>
                <SelectItem value="24" className="text-white hover:bg-gray-700 focus:bg-gray-700">24</SelectItem>
                <SelectItem value="36" className="text-white hover:bg-gray-700 focus:bg-gray-700">36</SelectItem>
                <SelectItem value="48" className="text-white hover:bg-gray-700 focus:bg-gray-700">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 border border-gray-600 rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-r-none ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`rounded-l-none ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* TABLET: Layout horizontal con ordenar izquierda, mostrar+vista derecha */}
        <div className="hidden md:flex lg:hidden md:items-center md:justify-between gap-4">
          {/* Selector de ordenación */}
          {onSortByChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.sort_by')}</span>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                  <SelectValue placeholder={t('controls.select_option')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50 text-white">
                  <SelectItem value="featured" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.featured_first')}</SelectItem>
                  <SelectItem value="price_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.price_low_high')}</SelectItem>
                  <SelectItem value="price_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.price_high_low')}</SelectItem>
                  <SelectItem value="date_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.newest_first')}</SelectItem>
                  <SelectItem value="date_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.oldest_first')}</SelectItem>
                  <SelectItem value="title_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.alphabetic_az')}</SelectItem>
                  <SelectItem value="title_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">{t('controls.alphabetic_za')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mostrar + vista agrupados a la derecha */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 whitespace-nowrap">{t('controls.show')}</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-20 bg-gray-700 border-gray-600 text-white [&>span]:text-white [&>span]:font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-50 text-white">
                  <SelectItem value="5" className="text-white hover:bg-gray-700 focus:bg-gray-700">5</SelectItem>
                  <SelectItem value="10" className="text-white hover:bg-gray-700 focus:bg-gray-700">10</SelectItem>
                  <SelectItem value="12" className="text-white hover:bg-gray-700 focus:bg-gray-700">12</SelectItem>
                  <SelectItem value="24" className="text-white hover:bg-gray-700 focus:bg-gray-700">24</SelectItem>
                  <SelectItem value="36" className="text-white hover:bg-gray-700 focus:bg-gray-700">36</SelectItem>
                  <SelectItem value="48" className="text-white hover:bg-gray-700 focus:bg-gray-700">48</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 border border-gray-600 rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={`rounded-r-none ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
              >
                <Grid2X2 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={`rounded-l-none ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default ListViewControls; 
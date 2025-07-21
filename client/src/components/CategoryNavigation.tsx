import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Users, User, Smartphone, Shirt, Gem, Gift } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

interface CategoryNavigationProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categoryIcons = {
  "fas fa-th-large": LayoutGrid,
  "fas fa-male": Users,
  "fas fa-female": User,
  "fas fa-mobile-alt": Smartphone,
  "fas fa-tshirt": Shirt,
  "fas fa-gem": Gem,
  "fas fa-gift": Gift,
};

const categoryThemes = {
  men: "men-theme",
  women: "women-theme",
  gadgets: "gadgets-theme",
  clothing: "clothing-theme",
  jewelry: "jewelry-theme",
  gifts: "gifts-theme",
};

export function CategoryNavigation({ selectedCategory, onCategorySelect }: CategoryNavigationProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getIconComponent = (iconClass: string) => {
    return categoryIcons[iconClass as keyof typeof categoryIcons] || LayoutGrid;
  };

  const getCategoryTheme = (slug: string) => {
    return categoryThemes[slug as keyof typeof categoryThemes] || "";
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {/* All Category */}
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            onClick={() => onCategorySelect("all")}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            All
          </Button>

          {/* Category Buttons */}
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            const themeClass = getCategoryTheme(category.slug);
            
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "ghost"}
                onClick={() => onCategorySelect(category.slug)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.slug
                    ? themeClass || "bg-gray-900 text-white"
                    : `hover:${themeClass || "bg-gray-100 dark:hover:bg-gray-700"}`
                }`}
                style={
                  selectedCategory !== category.slug
                    ? { color: category.color }
                    : {}
                }
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

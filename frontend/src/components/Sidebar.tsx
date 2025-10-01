import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  navigationSections,
  type NavigationItem,
  type NavigationSection,
} from "../navigation";
import siteConfig from "../config/site.config";
import { useSession } from "../hooks/useSession";
import { hasPermission } from "../utils/acl";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { user } = useSession();

  // Filter navigation items based on user permissions
  const filteredNavigationSections = useMemo(() => {
    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // If no permission is required, show the item
          if (!item.permission) return true;
          // Check if user has the required permission
          return hasPermission(user, item.permission);
        }),
      }))
      .filter((section) => section.items.length > 0); // Remove empty sections
  }, [user]);

  const toggleSubmenu = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isSubmenuActive = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some((item) => isActive(item.path));
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked and sidebar is currently expanded
    // This function should only be called when sidebar is not collapsed
    if (window.innerWidth < 768 && onToggle) {
      onToggle();
    }
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <li key={item.id}>
      {item.children ? (
        // Menu item with submenu
        <div>
          <button
            onClick={() => !isCollapsed && toggleSubmenu(item.id)}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            } px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
              isSubmenuActive(item.children)
                ? "bg-primary-500 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
            {!isCollapsed && (
              <span
                className={`transform transition-transform duration-200 ${
                  expandedItems.includes(item.id) ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            )}
          </button>

          {/* Submenu */}
          {!isCollapsed && expandedItems.includes(item.id) && (
            <ul className="ml-8 mt-1 space-y-1">
              {item.children.map((subItem: NavigationItem) => (
                <li key={subItem.id}>
                  <Link
                    to={subItem.path || "#"}
                    onClick={!isCollapsed ? handleLinkClick : undefined}
                    className={`block px-4 py-2 text-sm rounded-lg mx-2 transition-colors duration-200 ${
                      isActive(subItem.path)
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        // Regular menu item
        <Link
          to={item.path || "#"}
          onClick={!isCollapsed ? handleLinkClick : undefined}
          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
            isActive(item.path)
              ? "bg-primary-500 text-white"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <span className="text-lg">{item.icon}</span>
          {!isCollapsed && <span>{item.label}</span>}
        </Link>
      )}
    </li>
  );

  return (
    <div
      className={`bg-gray-800 text-white min-h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">MoneyFlow</h1>
            <p className="text-xs text-gray-400">Money Remittance</p>
          </div>
        </div>
      </div> */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <img
              src={siteConfig?.logo || "/logo-green.svg"}
              alt={siteConfig?.display_name || "Money Flow"}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <img
              src={siteConfig?.logo || "/logo-green.svg"}
              alt={siteConfig?.display_name || "Money Flow"}
              className="h-24 w-200" // adjust size to fit
            />
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredNavigationSections.map((section: NavigationSection) => (
          <div key={section.id} className="mb-6">
            {/* Section Header */}
            {!isCollapsed && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.label}
                </h3>
              </div>
            )}

            {/* Section Items */}
            <ul className="space-y-1">
              {section.items.map(renderNavigationItem)}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavItem } from "@/types/navigation";

export function useMenuNavigation(navItems: NavItem[]) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const shouldAutoExpand = (item: NavItem): boolean => {
      if (!item.submenu) return false;
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return true;
      }
      return item.submenu.some(
        (subItem) =>
          pathname === subItem.href || pathname.startsWith(subItem.href + "/")
      );
    };

    const initiallyExpanded = new Set<string>();
    navItems.forEach((item) => {
      if (item.hasSubmenu && shouldAutoExpand(item)) {
        initiallyExpanded.add(item.href);
      }
    });
    setExpandedMenus(initiallyExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSubmenu = (item: NavItem) => {
    const isCurrentlyExpanded = expandedMenus.has(item.href);
    const firstSubmenuHref = item.submenu?.[0]?.href;

    if (isCurrentlyExpanded) {
      setExpandedMenus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(item.href);
        return newSet;
      });
    } else {
      setExpandedMenus((prev) => {
        const newSet = new Set(prev);
        newSet.add(item.href);
        return newSet;
      });

      if (
        firstSubmenuHref &&
        pathname !== firstSubmenuHref &&
        !pathname.startsWith(firstSubmenuHref + "/")
      ) {
        router.push(firstSubmenuHref);
      }
    }
  };

  const handleMenuClick = (item: NavItem) => {
    toggleSubmenu(item);
  };

  const isSubmenuExpanded = (href: string) => expandedMenus.has(href);

  const isItemActive = (item: NavItem): boolean => {
    if (item.hasSubmenu) {
      const firstSubmenuHref = item.submenu?.[0]?.href;
      return pathname === item.href || pathname === firstSubmenuHref;
    }
    return pathname === item.href || pathname === item.href + "/";
  };

  const hasActiveSubmenu = (item: NavItem): boolean => {
    if (!item.submenu) return false;
    return item.submenu.some((subItem) => {
      if (pathname === item.href) {
        return subItem.href === item.submenu?.[0]?.href;
      }
      return (
        pathname === subItem.href || pathname.startsWith(subItem.href + "/")
      );
    });
  };

  const isSubmenuItemActive = (
    subItemHref: string,
    parentItem: NavItem
  ): boolean => {
    if (pathname === parentItem.href) {
      return subItemHref === parentItem.submenu?.[0]?.href;
    }

    if (subItemHref === parentItem.href) {
      return pathname === subItemHref;
    }

    return (
      pathname === subItemHref || pathname.startsWith(subItemHref + "/")
    );
  };

  return {
    expandedMenus,
    isSubmenuExpanded,
    isItemActive,
    hasActiveSubmenu,
    isSubmenuItemActive,
    handleMenuClick,
    toggleSubmenu,
  };
}

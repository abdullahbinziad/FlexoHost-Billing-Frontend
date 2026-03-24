import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { NavItem, SubMenuItem } from "@/types/navigation";

export function useMenuNavigation(navItems: NavItem[]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const matchesHref = (href: string): boolean => {
    const [path, query] = href.split("?");
    // Exact match for /admin/settings so /admin/settings/foo does not activate the parent alone.
    if (path === "/admin/settings") {
      if (pathname !== "/admin/settings") return false;
    } else if (pathname !== path && !pathname.startsWith(path + "/")) {
      return false;
    }
    if (query && search !== query) return false;
    return true;
  };

  useEffect(() => {
    const hrefMatches = (href: string) => {
      const [path] = href.split("?");
      return pathname === path || pathname.startsWith(path + "/");
    };
    const shouldAutoExpand = (item: NavItem): boolean => {
      if (!item.submenu) return false;
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return true;
      }
      const checkSub = (sub: SubMenuItem): boolean => {
        if (hrefMatches(sub.href)) return true;
        return sub.submenu?.some(checkSub) ?? false;
      };
      return item.submenu.some(checkSub);
    };

    const initiallyExpanded = new Set<string>();
    navItems.forEach((item) => {
      if (item.hasSubmenu && shouldAutoExpand(item)) {
        initiallyExpanded.add(item.href);
      }
    });
    setExpandedMenus(initiallyExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

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
    const checkSub = (sub: SubMenuItem): boolean => {
      if (matchesHref(sub.href)) return true;
      return sub.submenu?.some(checkSub) ?? false;
    };
    return item.submenu.some(checkSub);
  };

  const isSubmenuItemActive = (
    subItemHref: string,
    parentItem: NavItem
  ): boolean => {
    return matchesHref(subItemHref);
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

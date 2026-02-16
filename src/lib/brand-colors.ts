/**
 * Brand Colors Configuration
 * 
 * Change colors here to update throughout the entire application
 * Colors extracted from brand logo
 */

export const brandColors = {
  // Primary Brand Blue (Lighter, Vibrant)
  primary: {
    50: "#E6F2FF",   // Lightest tint
    100: "#CCE5FF",
    200: "#99CCFF",
    300: "#66B2FF",
    400: "#3399FF",
    500: "#0078F0",  // Main brand color
    600: "#0066CC",
    700: "#0052A3",
    800: "#003D7A",
    900: "#002952",  // Darkest shade
  },
  // Secondary Brand Blue (Deeper, Darker)
  secondary: {
    50: "#E6F0F9",
    100: "#CCE1F3",
    200: "#99C3E7",
    300: "#66A5DB",
    400: "#3387CF",
    500: "#004EA1",  // Secondary brand color
    600: "#003E81",
    700: "#002F61",
    800: "#001F41",
    900: "#001020",
  },
} as const;

// HSL values for CSS variables (converted from hex)
export const brandColorsHSL = {
  primary: {
    50: "210 100% 95%",
    100: "210 100% 90%",
    200: "210 100% 80%",
    300: "210 100% 70%",
    400: "210 100% 60%",
    500: "210 100% 47%",  // #0078F0
    600: "210 100% 40%",
    700: "210 100% 32%",
    800: "210 100% 24%",
    900: "210 100% 16%",
  },
  secondary: {
    50: "210 100% 95%",
    100: "210 100% 90%",
    200: "210 100% 80%",
    300: "210 100% 70%",
    400: "210 100% 60%",
    500: "210 100% 32%",  // #004EA1
    600: "210 100% 25%",
    700: "210 100% 19%",
    800: "210 100% 13%",
    900: "210 100% 6%",
  },
} as const;

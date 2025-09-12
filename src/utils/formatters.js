import {UAParser} from "ua-parser-js";

/**
 * Formats a date string to a localized format
 * @param {string} isoString - ISO date string
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} Formatted date string
 */
export const formatDate = (isoString, includeTime = true) => {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('it-IT', options);
  };
  
  /**
   * Formats a number with thousand separators
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  export const formatNumber = (number) => {
    if (number === undefined || number === null) return '';
    
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  /**
   * Truncates a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated string
   */
  export const truncateString = (str, length = 50) => {
    if (!str) return '';
    
    if (str.length <= length) return str;
    
    return `${str.substring(0, length)}...`;
  };
  
 /* 
 * sort in alphabetical order the array given
 */
export const sortArrayAlphabetically = (array) => {
  if (!Array.isArray(array)) return [];
  return array.sort((a, b) => a.localeCompare(b));
};

/**
 * format user agent string
 */
export const getReadableUserAgent = (uaString) => {
  if (!uaString) {
    return "User Agent non fornito";
  }

  const parser = new UAParser(uaString);
  const result = parser.getResult();

  const browser = result.browser.name ? `${result.browser.name} ${result.browser.major}` : "Sconosciuto";
  const os = result.os.name ? `${result.os.name} ${result.os.version || ''}`.trim() : "Sconosciuto";
  // La libreria rileva 'console', 'mobile', 'tablet', 'smarttv', etc.
  const device = result.device.type || "Desktop";
  const res = {
    browser,
    os,
    device
  }

  return res;
}

export const mapOrganizationTypeToItalian = (type) => {
  switch (type) {
    case 'ENTERPRISE':
      return 'Impresa';
    case 'TOWNHALL':
      return 'Comune';
    default:
      return '';
  }

}

export const formatTitleCase = (str) => {
  if (!str) return ""
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
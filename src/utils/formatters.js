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
  
  /**
   * Translates report types from English to Italian
   * @param {string} englishString - English report type
   * @returns {string} Italian translation
   */

/**
 * Format phone number as (XXX) XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '')
  
  // Limit to 10 digits
  const phoneNumberLength = phoneNumber.length
  if (phoneNumberLength < 4) return phoneNumber
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
}

/**
 * Format name with proper capitalization (Title Case)
 */
export function formatName(value: string): string {
  if (!value) return value
  
  // Preserve leading/trailing spaces and multiple spaces during typing
  // Only trim and normalize when formatting
  const trimmed = value.trim()
  if (!trimmed) return value // Return original if only spaces
  
  // Handle names with prefixes, suffixes, and multiple words
  // Split on one or more spaces, but preserve the structure
  const words = trimmed.split(/\s+/).map((word, index, arr) => {
    if (!word) return word
    
    const lowerWord = word.toLowerCase()
    
    // Common name prefixes (keep lowercase unless at start)
    const prefixes = ['de', 'da', 'del', 'della', 'di', 'du', 'el', 'la', 'le', 'van', 'von', 'der', 'den']
    
    // Common name suffixes (keep lowercase)
    const suffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v', 'esq', 'phd', 'md', 'dds']
    
    // If it's a prefix and not the first word, keep lowercase
    if (prefixes.includes(lowerWord) && index > 0) {
      return word.toLowerCase()
    }
    
    // If it's a suffix, keep lowercase
    if (suffixes.includes(lowerWord)) {
      return word.toLowerCase()
    }
    
    // Capitalize first letter, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })
  
  // Join with single space (normalize multiple spaces to single space)
  return words.join(' ')
}

/**
 * Format address with proper capitalization
 */
export function formatAddress(value: string): string {
  if (!value) return value
  
  // Split by lines (for multi-line addresses)
  const lines = value.split('\n').map(line => {
    if (!line.trim()) return line
    
    const trimmedLine = line.trim()
    const words = trimmedLine.split(/\s+/)
    
    // State abbreviations (always uppercase if 2 letters)
    const stateAbbrevs = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 
                         'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 
                         'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 
                         'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 
                         'wi', 'wy', 'dc']
    
    const formattedWords = words.map((word, index, arr) => {
      if (!word) return word
      
      const cleanWord = word.replace(/[.,]/g, '')
      const lowerWord = cleanWord.toLowerCase()
      
      // Directional abbreviations - handle FIRST
      const directions = ['n', 's', 'e', 'w', 'north', 'south', 'east', 'west']
      const directionAbbrevs = ['nw', 'ne', 'sw', 'se', 'nnw', 'nne', 'ene', 'ese', 'sse', 'ssw', 'wsw', 'wnw']
      
      if (directionAbbrevs.includes(lowerWord)) {
        return word.toUpperCase()
      }
      if (directions.includes(lowerWord)) {
        // Single letter directions: uppercase
        if (word.length === 1) {
          return word.toUpperCase()
        }
        // Full words: capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      
      // State abbreviations - check if it's a 2-letter word that could be a state
      // Usually states appear near the end (last 2-3 words) and before ZIP codes
      if (stateAbbrevs.includes(lowerWord) && word.length === 2) {
        // Check if it's near the end (likely a state)
        const isNearEnd = index >= arr.length - 3
        // Check if next word might be a ZIP (numbers)
        const nextIsZip = index < arr.length - 1 && /^\d{5}/.test(arr[index + 1])
        if (isNearEnd || nextIsZip) {
          return word.toUpperCase()
        }
      }
      
      // Common address abbreviations - capitalize them (Ave, St, Rd, etc.)
      // But be careful: "St" could be "Saint" in city names like "St Petersburg"
      const abbreviations = ['ave', 'avenue', 'rd', 'road', 'blvd', 'boulevard', 
                            'ln', 'lane', 'dr', 'drive', 'ct', 'court', 'pl', 'place', 'pkwy', 'parkway',
                            'apt', 'apartment', 'ste', 'suite', 'unit', 'po', 'box', 'p.o.']
      
      // Handle "st" specially - it could be "street" or "saint"
      // If "st" is followed by a word that looks like a city name (not a number, not lowercase),
      // treat it as "Saint" and capitalize it
      if (lowerWord === 'st') {
        const nextWord = index < arr.length - 1 ? arr[index + 1] : ''
        const nextWordLower = nextWord.toLowerCase()
        // If next word is a city-like name (not a number, not a common street word), it's probably "Saint"
        const cityIndicators = ['petersburg', 'louis', 'paul', 'augustine', 'cloud', 'helens', 'joseph']
        const isSaint = cityIndicators.some(indicator => nextWordLower.includes(indicator)) ||
                       (nextWord.length > 3 && !/^\d/.test(nextWord) && !abbreviations.includes(nextWordLower))
        
        if (isSaint) {
          // It's "Saint" - capitalize it
          return 'St'
        } else {
          // It's "street" - capitalize it
          return 'St'
        }
      }
      
      if (abbreviations.includes(lowerWord)) {
        // Capitalize abbreviations
        if (word.length <= 3) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      
      // Numbers stay as-is (like "7th", "124")
      if (/^\d+/.test(word)) {
        // Ordinal numbers like "7th" should stay lowercase
        if (/^\d+(st|nd|rd|th)$/i.test(word)) {
          return word.toLowerCase()
        }
        return word
      }
      
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    
    return formattedWords.join(' ')
  })
  
  return lines.join('\n')
}


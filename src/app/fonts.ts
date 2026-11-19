/**
 * Fonts are bundled from npm (Fontsource) instead of next/font/google, so builds never depend on
 * Google Fonts being reachable. Each file declares unicode ranges, so browsers only download the
 * Thai / Latin parts a page uses.
 */
import '@fontsource-variable/anuphan';
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/600.css';
import './fonts.css';

/** Class on <html> that sets --font-anuphan and --font-plex-thai (see global.css). */
export const fontVariables = 'bb-fonts';

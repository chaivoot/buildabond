import { Anuphan, IBM_Plex_Sans_Thai } from 'next/font/google';

const anuphan = Anuphan({ subsets: ['thai', 'latin'], weight: ['200', '300', '400', '500', '600'], variable: '--font-anuphan', display: 'swap' });
const plexThai = IBM_Plex_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '500', '600'], variable: '--font-plex-thai', display: 'swap' });

export const fontVariables = `${anuphan.variable} ${plexThai.variable}`;

import type { Locale } from './config';
import { en } from './en';
import { th, type Dict } from './th';

export type { Dict };
export const getDict = (lang: Locale): Dict => (lang === 'th' ? th : en);

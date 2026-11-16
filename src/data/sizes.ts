/** `sizes` hints for next/image, matching the layout widths in global.css. */
export const SIZES = {
  /** Inside the 1200px container */
  full: '(min-width: 1232px) 1200px, 100vw',
  /** One column of a two-up `.split` */
  half: '(min-width: 900px) 580px, 100vw',
  /** A card in a 3-up grid */
  third: '(min-width: 900px) 390px, 100vw',
  /** A product tile in the shop grid */
  tile: '(min-width: 900px) 280px, 50vw',
};

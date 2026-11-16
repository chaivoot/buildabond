import type { StaticImageData } from 'next/image';

const i = (src: string, width: number, height: number): StaticImageData => ({ src, width, height });

/** Site photos served from /public/images. Dimensions let next/image reserve space. */
export const img = {
  beagleFlirt: i('/images/beagle-flirt.jpg', 610, 620),
  bungeePocket: i('/images/bungee-pocket.jpg', 320, 245),
  cockerOctBox: i('/images/cocker-oct-box.jpg', 1294, 864),
  customer1: i('/images/customer-1.jpg', 1292, 662),
  dogsOnBoxes: i('/images/dogs-on-boxes.jpg', 1294, 835),
  epdmCloseup: i('/images/epdm-closeup.jpg', 1292, 988),
  flirtPole: i('/images/flirt-pole.jpg', 660, 682),
  heroSet: i('/images/hero-set.jpg', 1306, 834),
  jumpBox: i('/images/jump-box.jpg', 1050, 610),
  logo: i('/images/logo.png', 202, 200),
  magnets: i('/images/magnets.jpg', 782, 792),
  narrowTarget: i('/images/narrow-target.jpg', 585, 510),
  octBox: i('/images/oct-box.jpg', 640, 495),
  placeBoard: i('/images/place-board.jpg', 1294, 685),
  rabbitDummy: i('/images/rabbit-dummy.jpg', 390, 265),
  rabbitskinChaser: i('/images/rabbitskin-chaser.jpg', 280, 255),
  sheepskinBungee: i('/images/sheepskin-bungee.jpg', 480, 275),
  sheepskinChaser: i('/images/sheepskin-chaser.jpg', 290, 265),
  slantBox: i('/images/slant-box.jpg', 365, 290),
  targetBox: i('/images/target-box.jpg', 420, 255),
};

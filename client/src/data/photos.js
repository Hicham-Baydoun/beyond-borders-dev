// Destination photos (public/images/destinations). All from Wikimedia Commons under Creative Commons licences.
// The licences require credit: the /credits page lists every photo, and the footer links to it.
// To add a photo: put a ~1280 px JPG in public/images/destinations and add an entry here.
//
// Content rule for every photo on this site (set by the project owner):
//   - No churches, cathedrals, religious statues or statues of people.
//   - Use landmarks, nature and architecture instead (e.g. Rome -> the Colosseum, Paris -> the Eiffel Tower).
//   - Look at the photo itself before adding it, not only its title.
const base = '/images/destinations';

export const photos = {
  istanbul: {
    src: `${base}/istanbul.jpg`, width: 1280, height: 900,
    alt: 'The courtyard of the Blue Mosque in Istanbul, lit up at dusk under a deep blue sky',
    subject: 'Blue Mosque courtyard at dusk, Istanbul', author: 'Benh LIEU SONG',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Blue_Mosque_Courtyard_Dusk_Wikimedia_Commons.jpg',
  },
  antalya: {
    src: `${base}/antalya.jpg`, width: 1280, height: 882,
    alt: 'Kaputaş beach on the Antalya coast: turquoise sea, white umbrellas and an island on the horizon',
    subject: 'Kaputaş beach, Antalya coast', author: 'Liselottediehl',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Kaputas_Beach_Kas.jpg',
  },
  paris: {
    src: `${base}/paris.jpg`, width: 1280, height: 853,
    alt: 'The Eiffel Tower framed by spring blossom and green trees',
    subject: 'The Eiffel Tower in spring, Paris', author: 'Jorge Royan',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Paris_-_The_Eiffel_Tower_in_spring_-_2307.jpg',
  },
  parisSunrise: {
    src: `${base}/paris-sunrise.jpg`, width: 1280, height: 1920,
    alt: 'The Eiffel Tower in silhouette against a golden sunrise, seen from the Trocadéro',
    subject: 'Eiffel Tower at sunrise from the Trocadéro, Paris', author: 'Tristan Nitot',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Tour_eiffel_at_sunrise_from_the_trocadero.jpg',
  },
  dubai: {
    src: `${base}/dubai.jpg`, width: 1280, height: 867,
    alt: 'Madinat Jumeirah in Dubai with palm trees, a canal and the Burj Al Arab behind',
    subject: 'Madinat Jumeirah and the Burj Al Arab, Dubai', author: 'Diego Delso',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Madinat_Jumeirah-Dubai3303.JPG',
  },
  beirut: {
    src: `${base}/beirut.jpg`, width: 1280, height: 960,
    alt: 'Pigeon Rocks off the Beirut coast at sunset, the sun reflecting on the Mediterranean',
    subject: 'Pigeon Rocks at sunset, Beirut', author: 'Vyacheslav Argenberg',
    license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    source: 'https://commons.wikimedia.org/wiki/File:A_sunset_on_the_Mediterranean_sea,_Pigeon_Rocks,_Beirut,_Lebanon.jpg',
  },
};

// Views shown one after another in the airplane window on the home page.
export const windowViews = [
  { photo: photos.parisSunrise, city: 'Paris' },
  { photo: photos.istanbul, city: 'Istanbul' },
  { photo: photos.antalya, city: 'Antalya' },
  { photo: photos.dubai, city: 'Dubai' },
];

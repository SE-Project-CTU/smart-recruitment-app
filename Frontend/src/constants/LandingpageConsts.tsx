const baseLogoItems = [
  {
    id: "1",
    content: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
        alt="Google"
        className="h-10 w-auto object-contain transition-all"
      />
    ),
  },
  {
    id: "2",
    content: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
        alt="Amazon"
        className="h-10 w-auto object-contain transition-all"
      />
    ),
  },
  {
    id: "3",
    content: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        alt="Microsoft"
        className="h-10 w-auto object-contain transition-all"
      />
    ),
  },
  {
    id: "4",
    content: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
        alt="Netflix"
        className="h-10 w-auto object-contain transition-all"
      />
    ),
  },
  {
    id: "5",
    content: (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
        alt="LinkedIn"
        className="h-10 w-auto object-contain transition-all"
      />
    ),
  },
];

export const imageSlide = [
  {
    src: "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-senior-_B1tfBFEAUgALBAgBBl0MD1wECQBQAQFQAwIAAw44ec.webp?t=1756265781&color=000000&template_name=senior_v2&lang=vi",
    title: "test",
    subtitle: "test",
    badge: "testtt",
  },
  {
    src: "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-tieu-chuan-it-kinh-nghiem-_AwMBBgcFDlZRVAYCWQwLUgBVB1ACUlQAAlsHUg57b4.webp?t=1763723169&color=F6F6F6&template_name=default_junior&lang=vi",
    title: "test",
    subtitle: "test",
    badge: "testtt",
  },
  {
    src: "https://www.topcv.vn/v4/image/cv-template/screenshots/thumbs/cv-template-thumbnails-v1.4/vi/senior_2.webp?v=3.5&lang=vi",
    title: "test",
    subtitle: "test",
    badge: "testtt",
  },
  {
    src: "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-toi-gian-2-_BQIFVQdWDgNUDgJXVlcNCw0KDwxSV1ZTVFAJBge3ff.webp?t=1762145812&color=263A4D&template_name=minimalism_v2&lang=vi",
    title: "test",
    subtitle: "test",
    badge: "testtt",
  },
  {
    src: "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-clarity-_A1QFA1EGBwJXUVcACgcPAA1RVAVcUlcBBwYEAg90e5.webp?t=1751514549&color=2E2E2E&template_name=clarity&lang=vi",
    title: "test",
    subtitle: "test",
    badge: "testtt",
  },
];

export const logoItems = [
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-1` })),
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-2` })),
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-3` })),
];

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

export const logoItems = [
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-1` })),
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-2` })),
  ...baseLogoItems.map((item) => ({ ...item, id: `${item.id}-3` })),
];

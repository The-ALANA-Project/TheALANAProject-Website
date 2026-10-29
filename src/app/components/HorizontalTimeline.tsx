import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineEvent {
  date: string;
  displayDate: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
}

const events: TimelineEvent[] = [
  {
    date: '01/06/2021',
    displayDate: 'Jun 2021',
    title: 'Birth of theweb3girl',
    description: 'Designer Stella Achenbach creates theweb3girl as a 3D avatar and personal project, modelling looks for independent digital fashion designers and experimenting with Web3 storytelling, selling the results as NFTs.',
  },
  {
    date: '01/10/2021',
    displayDate: 'Oct 2021',
    title: 'Digitalax Era and Web3 Fashion Week',
    description: 'ALANA becomes an official project within the Digitalax ecosystem and moderates the first Web3 Fashion Week, marking her arrival as a recognisable Web3 fashion persona.',
  },
  {
    date: '01/02/2022',
    displayDate: 'Feb 2022',
    title: 'From Persona to Community Project',
    description: 'theweb3girl breaks off from Digitalax and is re-designed as a co-created community project, with the first core members voted in and a new focus on easy-to-access Web3 and blockchain education.',
  },
  {
    date: '01/05/2023',
    displayDate: 'May 2023',
    title: 'Renaming to The ALANA Project',
    description: 'ALANAtheweb3girl is officially renamed The ALANA Project, with the main pillars defined as learn, co-create, and build, alongside the first rewarded "Learner Journey" and ALANA NewsFlash plus free educational webinars.',
  },
  {
    date: '01/01/2024',
    displayDate: 'Jan 2024',
    title: 'DAO Foundations and ALANA Manifesto',
    description: "ALANA's Hot Seat sessions clearly define the need for DAO roles and result in the ALANA Manifesto for clear rules, while work on the new brand identity begins, setting a structured foundation for community alignment and governance.",
  },
  {
    date: '01/06/2024',
    displayDate: 'Jun 2024',
    title: 'First ALANAmagazine Edition',
    description: 'The first ALANAmagazine Edition launches, shortly followed by the podcast led by Elahn Danee and a successful first Artizen funding campaign, expanding ALANA into editorial, audio, and grant-supported experimentation.',
  },
  {
    date: '01/02/2025',
    displayDate: 'Feb 2025',
    title: 'Contribution Calculator and Token Economy',
    description: "The first draft of the Contribution Calculator is shared with the community for review, and work begins on the first draft of the ALANA whitepaper.",
  },
  {
    date: '01/10/2025',
    displayDate: 'Oct 2025',
    title: 'MINIFI at basebatches.xyz Hackathon',
    description: 'We hand in MINIFI, a playful savings app co-created by ALANA contributors, to the basebatches.xyz hackathon, exploring fun, DeFi-powered micro-investing through digital creatures.',
  },
  {
    date: '01/12/2025',
    displayDate: 'Dec 2025',
    title: 'Second Artizen Campaign and AIR Edition',
    description: "A second successful Artizen campaign funds the ALANAmagazine AIR Edition, scheduled for late 2026, reinforcing ALANA's role in community-backed creative publishing.",
  },
  {
    date: '01/07/2026',
    displayDate: 'Jul 2026',
    title: 'Contribution Calculator Launch',
    description: 'The Contribution Calculator officially launches as a web tool, giving ALANA community members a transparent way to track and quantify their contributions to the project.',
    link: 'https://contributions.the-alana-project.xyz/',
    linkText: 'Contribution Calculator',
  },
  {
    date: '01/09/2026',
    displayDate: 'Sep 2026',
    title: 'Token Design Snapshot Vote',
    description: 'The ALANA community comes together to agree on how the token will work through a Snapshot vote, marking a key step in shaping the governance and economy of the project.',
    link: 'https://snapshot.org/#/s:the-alana-project.eth/proposal/0x4781783c44b4dc14026455a165b94db3928606a6c091cbb811ea3c9b080163a4',
    linkText: 'Snapshot vote',
  },
  {
    date: '01/10/2026',
    displayDate: 'Oct 2026',
    title: 'New Website and ALANA 3D Avatar',
    description: 'The ALANA Project launches its new website and releases a new version of the ALANA avatar in 3D, made available for the community to use.',
  },
  {
    date: '01/11/2026',
    displayDate: 'Nov 2026',
    title: 'AIR Edition, ALANAboutique and FABAstudio',
    description: 'The ALANAmagazine AIR Edition is released, ALANAboutique is officially announced, and a first beta version of FABAstudio goes live — expanding the ALANA ecosystem into publishing, commerce, and creative tooling.',
  },
];

const MIN_DISTANCE = 80;

export function HorizontalTimeline() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [translateValue, setTranslateValue] = useState(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const parsedDates = events.map((e) => {
    const [d, m, y] = e.date.split('/');
    return new Date(+y, +m - 1, +d);
  });

  useEffect(() => {
    if (!wrapperRef.current || !eventsRef.current) return;

    const wWidth = wrapperRef.current.offsetWidth;
    setWrapperWidth(wWidth);

    const minDate = parsedDates[0];
    const maxDate = parsedDates[parsedDates.length - 1];
    const totalDays = Math.round((maxDate.getTime() - minDate.getTime()) / 86400000);

    let minLapse = Infinity;
    for (let i = 1; i < parsedDates.length; i++) {
      const lapse = Math.round((parsedDates[i].getTime() - parsedDates[i - 1].getTime()) / 86400000);
      if (lapse < minLapse) minLapse = lapse;
    }

    const links = eventsRef.current.querySelectorAll('button.tl-event');
    links.forEach((el, i) => {
      const distance = Math.round((parsedDates[i].getTime() - minDate.getTime()) / 86400000);
      const norm = Math.round(distance / minLapse) + 2;
      (el as HTMLElement).style.left = `${norm * MIN_DISTANCE}px`;
    });

    const timeSpanNorm = Math.round(totalDays / minLapse) + 4;
    const tWidth = timeSpanNorm * MIN_DISTANCE;
    setTimelineWidth(tWidth);
    eventsRef.current.style.width = `${tWidth}px`;
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const selected = contentRef.current.querySelector('.tl-selected') as HTMLElement;
    if (selected) contentRef.current.style.height = `${selected.offsetHeight}px`;
  }, [selectedIndex]);

  const navigateTo = (index: number) => {
    setSelectedIndex(index);

    if (!eventsRef.current || !wrapperRef.current) return;
    const link = eventsRef.current.querySelectorAll('button.tl-event')[index] as HTMLElement;
    if (!link) return;
    const eventCenter = parseFloat(link.style.left) + link.offsetWidth / 2;

    if (eventCenter > wrapperWidth - translateValue || eventCenter < -translateValue) {
      const desired = -eventCenter + wrapperWidth / 2;
      const minT = wrapperWidth - timelineWidth;
      setTranslateValue(Math.max(minT, Math.min(0, desired)));
    }
  };

  const fillingPct =
    selectedIndex > 0 && timelineWidth > 0 && eventsRef.current
      ? (() => {
          const link = eventsRef.current.querySelectorAll('button.tl-event')[selectedIndex] as HTMLElement;
          if (!link) return 0;
          return ((parseFloat(link.style.left) + link.offsetWidth / 2) / timelineWidth) * 100;
        })()
      : 0;

  return (
    <section className="w-full bg-background py-14">
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">Our Journey</h2>
          
        </div>

        {/* Timeline bar */}
        <div className="relative h-[100px] w-full mb-8">
          <div ref={wrapperRef} className="relative h-full px-[44px] overflow-hidden">
            <div
              ref={eventsRef}
              className="absolute z-[1] left-0 top-[49px] h-[1px] bg-[#D9D9D9]"
              style={{ transform: `translateX(${translateValue}px)`, transition: 'transform 0.4s ease' }}
            >
              <span
                className="absolute z-[1] left-0 top-0 h-full bg-[#262424] origin-left"
                style={{ transform: `scaleX(${fillingPct / 100})`, width: '100%', transition: 'transform 0.3s ease' }}
                aria-hidden="true"
              />
              {events.map((ev, i) => (
                <button
                  key={i}
                  className={`tl-event absolute bottom-0 z-[2] text-center text-[13px] pb-[15px] transition-colors duration-300 whitespace-nowrap ${
                    i === selectedIndex
                      ? 'text-[#262424] font-medium'
                      : i < selectedIndex
                      ? 'text-[#262424]/70'
                      : 'text-[#262424]/35'
                  } hover:text-[#262424]`}
                  style={{ left: 0 }}
                  onClick={() => navigateTo(i)}
                >
                  {ev.displayDate}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 -bottom-[5px] h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                      i === selectedIndex
                        ? 'bg-[#DCC2FE] border-[#262424]'
                        : i < selectedIndex
                        ? 'bg-[#262424] border-[#262424]'
                        : 'bg-[#F3F3F3] border-[#D9D9D9]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedIndex > 0 && navigateTo(selectedIndex - 1)}
            disabled={selectedIndex === 0}
            className={`absolute z-[1] top-1/2 -translate-y-1/2 left-0 h-[34px] w-[34px] rounded-full border flex items-center justify-center transition-all duration-300 bg-[#F3F3F3] ${
              selectedIndex === 0
                ? 'border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed'
                : 'border-[#262424] text-[#262424] hover:bg-[#F3F3F3]'
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => selectedIndex < events.length - 1 && navigateTo(selectedIndex + 1)}
            disabled={selectedIndex === events.length - 1}
            className={`absolute z-[1] top-1/2 -translate-y-1/2 right-0 h-[34px] w-[34px] rounded-full border flex items-center justify-center transition-all duration-300 bg-[#F3F3F3] ${
              selectedIndex === events.length - 1
                ? 'border-[#D9D9D9] text-[#D9D9D9] cursor-not-allowed'
                : 'border-[#262424] text-[#262424] hover:bg-[#F3F3F3]'
            }`}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Event content */}
        <div
          ref={contentRef}
          className="relative w-full overflow-hidden"
          style={{ minHeight: 80, transition: 'height 0.4s ease' }}
        >
          {events.map((ev, i) => (
            <div
              key={i}
              className={`transition-all duration-400 ${
                i === selectedIndex
                  ? 'tl-selected relative opacity-100 translate-x-0'
                  : 'absolute top-0 left-0 w-full opacity-0 -translate-x-8 pointer-events-none'
              }`}
            >
              <h4 className="font-medium text-[#262424] mb-2 text-lg">{ev.title}</h4>
              <p className="text-[#262424]/75 leading-relaxed text-sm md:text-base max-w-2xl">
                {ev.link && ev.linkText
                  ? (() => {
                      const parts = ev.description.split(ev.linkText);
                      return parts.map((part, i) => (
                        <span key={i}>
                          {part}
                          {i < parts.length - 1 && (
                            <a
                              href={ev.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#262424] underline underline-offset-4 hover:text-accent transition-colors"
                            >
                              {ev.linkText}
                            </a>
                          )}
                        </span>
                      ));
                    })()
                  : ev.description}
              </p>
              {ev.link && !ev.linkText && (
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm font-mono text-[#262424] underline underline-offset-4 hover:text-accent transition-colors"
                >
                  {ev.link}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState, useRef, useEffect } from "react";

interface Milestone {
  id: string;
  year: string;
  title: string;
  institution: string;
  institution2: string;
  degree?: string;
  description: string;
  celestialType: 'star' | 'galaxy';
}

const timelineData: Milestone[] = [
    {
    id: "postdoc",
    year: "2025 - present",
    title: "Postdoctoral Researcher",
    institution: "Centro de Astrobiología (CSIC-INTA)",
    institution2: "",
    degree: "",
    description: "Postdoctoral researcher at Centro de Astrobiología for the European Space Agency @ESAC. Exploring the detailed mophology of galaxies in clusters using deep learning classifications in the Euclid survey.",
    celestialType: "galaxy"
  },
    {
    id: "ucsd",
    year: "Sep 2024 - Dec 2024",
    title: "Reserch project at the University of California San Diego",
    institution: "University of California San Diego (UCSD)",
    institution2: "",
    degree: "",
    description: "Research collaboration focused on developing a deep transfer learning methodology to determine the effective temperature of ultracool dwarfs from low-resolution spectra.",
    celestialType: "star"
  },
  {
    id: "phd",
    year: "2021 - 2025",
    title: "PhD in Astrophysics",
    institution: "Centro de Astrobiología (CSIC-INTA)",
    institution2: "Universidad Complutense de Madrid",
    degree: "Doctor of Philosophy",
    description: "Virtual Observatory and Machine Learning for the study of low-mass objects in photometric and spectroscopic surveys.",
    celestialType: "galaxy"
  },
  {
    id: "msc",
    year: "2018 - 2019", 
    title: "MSc in Astrophysics",
    institution: "Universidad Complutense de Madrid",
    institution2: "",
    degree: "Master of Science",
    description: "",
    celestialType: "star"
  },
  {
    id: "bsc",
    year: "2014 - 2018",
    title: "BSc in Physics",
    institution: "Universidad Complutense de Madrid", 
    institution2: "",
    degree: "Bachelor of Science",
    description: "",
    celestialType: "galaxy"
  }
];

export default function CareerTimeline() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Move rocket to hovered item
  useEffect(() => {
    const moveRocket = () => {
      if (!rocketRef.current) return;
      
      if (activeId && itemRefs.current[activeId]) {
        const itemElement = itemRefs.current[activeId];
        const timelineContainer = rocketRef.current.parentElement;
        
        if (itemElement && timelineContainer) {
          const containerRect = timelineContainer.getBoundingClientRect();
          const itemRect = itemElement.getBoundingClientRect();
          const relativeTop = itemRect.top - containerRect.top;
          
          // Move to the marker position
          const targetY = relativeTop + 20;
          rocketRef.current.style.transform = `translate(-50%, ${targetY}px)`;
          rocketRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
      } else {
        // Return to default position at top
        rocketRef.current.style.transform = 'translate(-50%, 0px)';
        rocketRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    };
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(moveRocket, 10);
    return () => clearTimeout(timeoutId);
  }, [activeId]);


  return (
    <div className="career-timeline">
      <div className="timeline-container">
        {/* Realistic Rocket SVG */}
        <div className="timeline-rocket" ref={rocketRef}>
          <svg className="rocket-icon" viewBox="0 0 32 48" fill="none">
            {/* Rocket nose cone */}
            <path 
              d="M16 2L22 10L16 8L10 10L16 2Z" 
              fill="currentColor" 
              className="rocket-nose"
            />
            {/* Main body */}
            <rect 
              x="10" 
              y="10" 
              width="12" 
              height="20" 
              rx="2" 
              fill="currentColor" 
              className="rocket-body"
            />
            {/* Side boosters */}
            <rect 
              x="6" 
              y="14" 
              width="3" 
              height="12" 
              rx="1.5" 
              fill="currentColor" 
              className="rocket-booster-left"
            />
            <rect 
              x="23" 
              y="14" 
              width="3" 
              height="12" 
              rx="1.5" 
              fill="currentColor" 
              className="rocket-booster-right"
            />
            {/* Windows */}
            <circle cx="16" cy="16" r="2" fill="rgba(135,206,235,0.9)" className="rocket-window-main" />
            <circle cx="13" cy="22" r="1" fill="rgba(135,206,235,0.7)" className="rocket-window-small" />
            <circle cx="19" cy="22" r="1" fill="rgba(135,206,235,0.7)" className="rocket-window-small" />
            {/* Engine nozzles */}
            <ellipse 
              cx="16" 
              cy="30" 
              rx="3" 
              ry="2" 
              fill="currentColor" 
              className="rocket-engine-main"
            />
            <ellipse 
              cx="7.5" 
              cy="26" 
              rx="1.5" 
              ry="1" 
              fill="currentColor" 
              className="rocket-engine-side"
            />
            <ellipse 
              cx="24.5" 
              cy="26" 
              rx="1.5" 
              ry="1" 
              fill="currentColor" 
              className="rocket-engine-side"
            />
            {/* Exhaust flames */}
            <path 
              d="M13 32L16 42L19 32Z" 
              fill="#ff4500" 
              className="rocket-flame-main"
            />
            <path 
              d="M6.5 27L7.5 34L8.5 27Z" 
              fill="#ff6500" 
              className="rocket-flame-side"
            />
            <path 
              d="M23.5 27L24.5 34L25.5 27Z" 
              fill="#ff6500" 
              className="rocket-flame-side"
            />
            {/* Flame inner cores */}
            <path 
              d="M14 32L16 40L18 32Z" 
              fill="#ffff00" 
              className="rocket-flame-core"
            />
          </svg>
        </div>
        
        {/* Enhanced smoke trail connecting all items */}
        <div className="timeline-smoke-trail-full"></div>
        
        {timelineData.map((milestone) => (
          <div
            key={milestone.id}
            className={`timeline-item ${activeId === milestone.id ? 'active' : ''}`}
            ref={(el) => itemRefs.current[milestone.id] = el}
          >
            <div className="timeline-marker">
              {milestone.celestialType === 'star' ? (
                <div className="marker-star">
                  <svg className="celestial-icon" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                      fill="currentColor"
                    />
                    <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.9)" className="star-center" />
                  </svg>
                </div>
              ) : (
                <div className="marker-galaxy">
                  <svg className="celestial-icon" viewBox="0 0 32 32" fill="none">
                    {/* Outer galaxy disk */}
                    <ellipse 
                      cx="16" 
                      cy="16" 
                      rx="14" 
                      ry="10" 
                      fill="rgba(var(--color-accent), 0.1)" 
                      className="galaxy-disk"
                    />
                    {/* Spiral arm 1 */}
                    <path 
                      d="M16 16 Q10 12 6 16 Q8 20 12 18 Q16 16 20 18 Q24 20 26 16 Q22 12 16 16" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      fill="none" 
                      opacity="0.8"
                      className="galaxy-arm-1"
                    />
                    {/* Spiral arm 2 */}
                    <path 
                      d="M16 16 Q12 10 16 6 Q20 8 18 12 Q16 16 18 20 Q20 24 16 26 Q12 22 16 16" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      fill="none" 
                      opacity="0.8"
                      className="galaxy-arm-2"
                    />
                    {/* Star clusters along arms */}
                    <circle cx="8" cy="16" r="0.5" fill="rgba(255,255,255,0.9)" className="galaxy-star" />
                    <circle cx="24" cy="16" r="0.5" fill="rgba(255,255,255,0.8)" className="galaxy-star" />
                    <circle cx="16" cy="8" r="0.5" fill="rgba(255,255,255,0.9)" className="galaxy-star" />
                    <circle cx="16" cy="24" r="0.5" fill="rgba(255,255,255,0.8)" className="galaxy-star" />
                    <circle cx="12" cy="12" r="0.3" fill="rgba(255,255,255,0.7)" className="galaxy-star" />
                    <circle cx="20" cy="20" r="0.3" fill="rgba(255,255,255,0.6)" className="galaxy-star" />
                    <circle cx="20" cy="12" r="0.3" fill="rgba(255,255,255,0.7)" className="galaxy-star" />
                    <circle cx="12" cy="20" r="0.3" fill="rgba(255,255,255,0.6)" className="galaxy-star" />
                    {/* Bright galactic core */}
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="3" 
                      fill="rgba(255,255,255,0.9)" 
                      className="galaxy-core"
                    />
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="1.5" 
                      fill="rgba(255,255,255,1)" 
                      className="galaxy-core-bright"
                    />
                  </svg>
                </div>
              )}
              <div className="marker-year">{milestone.year}</div>
            </div>
            
            <div
              className={`timeline-content ${activeId === milestone.id ? 'constellation-active' : ''}`}
              onMouseEnter={() => setActiveId(milestone.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(activeId === milestone.id ? null : milestone.id)}
            >
              {/* Constellation line connecting star to content */}
              <div className="constellation-line"></div>
              <div className="timeline-header">
                <h3 className="timeline-title">{milestone.title}</h3>
                <p className="timeline-institution">{milestone.institution}</p>
                <p className="timeline-institution">{milestone.institution2}</p>
                {milestone.degree && (
                  <p className="timeline-degree">{milestone.degree}</p>
                )}
              </div>

              <p className="timeline-description">{milestone.description}</p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
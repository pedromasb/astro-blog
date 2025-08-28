import { useState, useEffect } from "react";

interface Milestone {
  id: string;
  year: string;
  title: string;
  institution: string;
  institution2: string;
  degree?: string;
  description: string;
}

const timelineData: Milestone[] = [
    {
    id: "postdoc",
    year: "2025 - present",
    title: "Postdoctoral Researcher",
    institution: "Centro de Astrobiología (CSIC-INTA)",
    institution2: "",
    degree: "",
    description: "Postdoctoral researcher for the European Space Agency @ESAC. Exploring the detailed mophology of galaxies in clusters using deep learning classifications in the Euclid survey.",
  },
    {
    id: "ucsd",
    year: "Sep 2024 - Dec 2024",
    title: "Reserch project at the University of California San Diego",
    institution: "University of California San Diego (UCSD)",
    institution2: "",
    degree: "",
    description: "Research collaboration focused on developing a deep transfer learning methodology to determine the effective temperature of ultracool dwarfs from low-resolution spectra.",
  },
  {
    id: "phd",
    year: "2021 - 2025",
    title: "PhD in Astrophysics",
    institution: "Centro de Astrobiología (CSIC-INTA)",
    institution2: "Universidad Complutense de Madrid",
    degree: "Doctor of Philosophy",
    description: "Virtual Observatory and Machine Learning for the study of low-mass objects in photometric and spectroscopic surveys.",
  },
  {
    id: "msc",
    year: "2018 - 2019", 
    title: "MSc in Astrophysics",
    institution: "Universidad Complutense de Madrid",
    institution2: "",
    degree: "Master of Science",
    description: ""
  },
  {
    id: "bsc",
    year: "2014 - 2018",
    title: "BSc in Physics",
    institution: "Universidad Complutense de Madrid", 
    institution2: "",
    degree: "Bachelor of Science",
    description: ""
  }
];

export default function CareerTimeline() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const AnimatedNumber = ({ value, isActive }: { value: string; isActive: boolean }) => {
    const [displayValue, setDisplayValue] = useState("0");
    
    useEffect(() => {
      if (isActive) {
        const numericValue = parseInt(value.replace(/\D/g, ''));
        let current = 0;
        const increment = numericValue / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setDisplayValue(value);
            clearInterval(timer);
          } else {
            setDisplayValue(Math.floor(current) + value.replace(/\d/g, '').substring(1));
          }
        }, 50);
        return () => clearInterval(timer);
      }
    }, [isActive, value]);

    return <span>{displayValue}</span>;
  };

  return (
    <div className="career-timeline">
      <div className="timeline-container">
        <div className="timeline-line" 
             style={{ transform: `translateX(${scrollY * 0.1}px)` }}>
        </div>
        
        {timelineData.map((milestone, index) => (
          <div
            key={milestone.id}
            className={`timeline-item ${activeId === milestone.id ? 'active' : ''}`}
            style={{
              transform: `translateX(${scrollY * (index % 2 === 0 ? -0.05 : 0.05)}px)`
            }}
          >
            <div className="timeline-marker">
              <div className="marker-dot"></div>
              <div className="marker-year">{milestone.year}</div>
            </div>
            
            <div
              className="timeline-content"
              onMouseEnter={() => setActiveId(milestone.id)}
              onMouseLeave={() => setActiveId(null)}
              onClick={() => setActiveId(activeId === milestone.id ? null : milestone.id)}
            >
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
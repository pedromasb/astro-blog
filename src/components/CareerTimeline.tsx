import { useState } from "react";

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
    description: "Postdoctoral researcher at Centro de Astrobiología for the European Space Agency @ESAC. Exploring the detailed mophology of galaxies in clusters using deep learning classifications in the Euclid survey.",
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


  return (
    <div className="career-timeline">
      <div className="timeline-container">
        <div className="timeline-line"></div>
        
        {timelineData.map((milestone) => (
          <div
            key={milestone.id}
            className={`timeline-item ${activeId === milestone.id ? 'active' : ''}`}
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
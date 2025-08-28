import { useEffect, useRef, useState } from "react";

interface Skill {
  name: string;
  proficiency: number; // 0-1
  category: string;
  position: [number, number, number];
  connections: string[];
  description: string;
}

const skillsData: Skill[] = [
  // Programming Languages
  { name: "Python", proficiency: 0.95, category: "programming", position: [0, 0, 0], connections: ["Machine Learning", "Data Analysis", "Astronomy"], description: "Advanced Python development for scientific computing" },
  { name: "JavaScript", proficiency: 0.85, category: "programming", position: [4, 2, -2], connections: ["Web Development", "Visualization"], description: "Modern JS/TS for web applications and data visualization" },
  { name: "R", proficiency: 0.75, category: "programming", position: [-4, 1, 2], connections: ["Statistics", "Data Analysis"], description: "Statistical analysis and data visualization" },
  { name: "SQL", proficiency: 0.80, category: "programming", position: [3, -2, 1], connections: ["Databases", "Data Analysis"], description: "Database design and complex queries" },
  
  // Machine Learning & AI
  { name: "Machine Learning", proficiency: 0.90, category: "ai", position: [0, 4, 0], connections: ["Python", "Deep Learning", "Statistics"], description: "ML algorithms and model development" },
  { name: "Deep Learning", proficiency: 0.85, category: "ai", position: [-2, 5, -1], connections: ["Machine Learning", "Neural Networks", "TensorFlow"], description: "Neural networks and deep learning architectures" },
  { name: "TensorFlow", proficiency: 0.80, category: "ai", position: [2, 4.5, -2], connections: ["Deep Learning", "Python"], description: "Deep learning framework expertise" },
  { name: "PyTorch", proficiency: 0.75, category: "ai", position: [1, 6, 1.5], connections: ["Deep Learning", "Python"], description: "Research-oriented deep learning" },
  { name: "Neural Networks", proficiency: 0.85, category: "ai", position: [-3, 3.5, 2], connections: ["Deep Learning", "Machine Learning"], description: "Neural network architectures and optimization" },
  
  // Astronomy & Physics  
  { name: "Astronomy", proficiency: 0.95, category: "science", position: [0, -4, 0], connections: ["Spectroscopy", "Stellar Physics", "Python"], description: "Observational and theoretical astronomy" },
  { name: "Spectroscopy", proficiency: 0.90, category: "science", position: [4, -5, 2], connections: ["Astronomy", "Data Analysis"], description: "Stellar spectral analysis and interpretation" },
  { name: "Stellar Physics", proficiency: 0.88, category: "science", position: [-4, -3.5, -1], connections: ["Astronomy", "Physics"], description: "Stellar atmospheres and evolution" },
  { name: "Physics", proficiency: 0.85, category: "science", position: [-2, -5.5, 1.5], connections: ["Stellar Physics", "Mathematics"], description: "Theoretical and experimental physics" },
  
  // Data Science
  { name: "Data Analysis", proficiency: 0.92, category: "data", position: [6, 0, 0], connections: ["Python", "R", "Statistics"], description: "Advanced data analysis and interpretation" },
  { name: "Statistics", proficiency: 0.88, category: "data", position: [5, -2, -2], connections: ["Data Analysis", "R", "Machine Learning"], description: "Statistical modeling and hypothesis testing" },
  { name: "Visualization", proficiency: 0.85, category: "data", position: [6.5, 2, 2], connections: ["Python", "JavaScript", "Data Analysis"], description: "Scientific data visualization and plotting" },
  
  // Tools & Technologies
  { name: "Git", proficiency: 0.90, category: "tools", position: [-6, 0, 0], connections: ["Programming"], description: "Version control and collaborative development" },
  { name: "Docker", proficiency: 0.70, category: "tools", position: [-5.5, 2, -2], connections: ["DevOps"], description: "Containerization and deployment" },
  { name: "Linux", proficiency: 0.85, category: "tools", position: [-6.5, -1, 2], connections: ["System Admin"], description: "Unix/Linux system administration" },
  { name: "Web Development", proficiency: 0.80, category: "tools", position: [3.5, 1.5, 4], connections: ["JavaScript", "React"], description: "Modern web development with React/Astro" },
  
  // Mathematics
  { name: "Mathematics", proficiency: 0.88, category: "math", position: [0, 0, -6], connections: ["Physics", "Statistics", "Machine Learning"], description: "Advanced mathematics for scientific computing" },
  { name: "Numerical Methods", proficiency: 0.82, category: "math", position: [2, -2, -5.5], connections: ["Mathematics", "Python"], description: "Numerical algorithms and scientific computing" }
];

// Simplified Three.js-like implementation for the demo
const SkillsGalaxy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw galaxy background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.6)');
      gradient.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (behind stars)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = 1;
      
      skillsData.forEach(skill => {
        skill.connections.forEach(connectionName => {
          const connectedSkill = skillsData.find(s => s.name === connectionName);
          if (connectedSkill) {
            const start = project3DTo2D(skill.position, canvas.width, canvas.height, rotation, zoom);
            const end = project3DTo2D(connectedSkill.position, canvas.width, canvas.height, rotation, zoom);
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        });
      });

      // Draw skills as stars
      skillsData.forEach((skill, index) => {
        const projected = project3DTo2D(skill.position, canvas.width, canvas.height, rotation, zoom);
        const size = Math.max(3, skill.proficiency * 8 * zoom);
        const brightness = Math.min(1, skill.proficiency + 0.3);
        
        // Star glow
        const glowGradient = ctx.createRadialGradient(
          projected.x, projected.y, 0,
          projected.x, projected.y, size * 2
        );
        
        const color = getCategoryColor(skill.category);
        glowGradient.addColorStop(0, `rgba(${color}, ${brightness})`);
        glowGradient.addColorStop(0.5, `rgba(${color}, ${brightness * 0.5})`);
        glowGradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Star core
        ctx.fillStyle = `rgba(${color}, 1)`;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add skill name on hover/selection
        if (selectedSkill === skill) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(skill.name, projected.x, projected.y - size - 10);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse interaction
    const handleMouseDown = (event: MouseEvent) => {
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMousePos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleClick = (event: MouseEvent) => {
      if (isDragging) return; // Don't select if dragging
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Find clicked skill
      const clickedSkill = skillsData.find(skill => {
        const projected = project3DTo2D(skill.position, canvas.width, canvas.height, rotation, zoom);
        const distance = Math.sqrt((x - projected.x) ** 2 + (y - projected.y) ** 2);
        return distance < skill.proficiency * 8 * zoom + 10;
      });
      
      setSelectedSkill(clickedSkill || null);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotation, zoom]);

  const project3DTo2D = (
    position: [number, number, number],
    width: number,
    height: number,
    rot: { x: number; y: number },
    zoomLevel: number
  ) => {
    const [x, y, z] = position;
    
    // Simple 3D rotation
    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);
    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);
    
    const rotatedY = y * cosX - z * sinX;
    const rotatedZ = y * sinX + z * cosX;
    const rotatedX = x * cosY + rotatedZ * sinY;
    const finalZ = -x * sinY + rotatedZ * cosY;
    
    // Project to 2D
    const scale = 50 * zoomLevel / (finalZ + 10);
    return {
      x: width / 2 + rotatedX * scale,
      y: height / 2 + rotatedY * scale,
      z: finalZ
    };
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      programming: "59, 130, 246",  // Blue
      ai: "168, 85, 247",          // Purple  
      science: "34, 197, 94",      // Green
      data: "249, 115, 22",        // Orange
      tools: "156, 163, 175",      // Gray
      math: "236, 72, 153"         // Pink
    };
    return colors[category as keyof typeof colors] || "156, 163, 175";
  };

  return (
    <div className="skills-galaxy">
      <div className="galaxy-container">
        <canvas 
          ref={canvasRef}
          className="galaxy-canvas"
        />
        
        <div className="galaxy-controls">
          <button 
            onClick={() => setZoom(zoom * 1.2)}
            className="zoom-btn"
          >
            Zoom In
          </button>
          <button 
            onClick={() => setZoom(zoom / 1.2)}
            className="zoom-btn"
          >
            Zoom Out
          </button>
        </div>

        {selectedSkill && (
          <div className="skill-info-panel">
            <h3>{selectedSkill.name}</h3>
            <p className="skill-category">{selectedSkill.category.charAt(0).toUpperCase() + selectedSkill.category.slice(1)}</p>
            <p className="skill-description">{selectedSkill.description}</p>
            <div className="skill-connections">
              <h4>Connected Skills:</h4>
              <div className="connections-list">
                {selectedSkill.connections.map((conn, i) => (
                  <span key={i} className="connection-tag">{conn}</span>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setSelectedSkill(null)}
              className="close-panel"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="galaxy-legend">
        <h4>Skill Categories</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(59, 130, 246)" }}></div>
            <span>Programming</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(168, 85, 247)" }}></div>
            <span>AI/ML</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(34, 197, 94)" }}></div>
            <span>Science</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(249, 115, 22)" }}></div>
            <span>Data</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(156, 163, 175)" }}></div>
            <span>Tools</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "rgb(236, 72, 153)" }}></div>
            <span>Math</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsGalaxy;
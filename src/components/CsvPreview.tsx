import { useState, useEffect } from "react";

interface CsvPreviewProps {
  csvPath: string;
  maxRows?: number;
  height?: string;
  title?: string;
}

interface CsvData {
  headers: string[];
  rows: string[][];
}

export default function CsvPreview({ 
  csvPath, 
  maxRows = 20, 
  height = "600px",
  title = "Dataset Preview" 
}: CsvPreviewProps) {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        const response = await fetch(csvPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim())
        );

        setCsvData({ headers, rows });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CSV');
        setLoading(false);
      }
    };

    fetchCsv();
  }, [csvPath]);

  if (loading) {
    return (
      <div className="csv-modern-container">
        <div className="csv-modern-header">
          <div className="csv-title-section">
            <h3 className="csv-modern-title">{title}</h3>
          </div>
        </div>
        <div className="csv-modern-loading">
          <div className="loading-modern-spinner"></div>
          <span className="loading-text">Loading dataset...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="csv-modern-container">
        <div className="csv-modern-header">
          <div className="csv-title-section">
            <h3 className="csv-modern-title">{title}</h3>
          </div>
        </div>
        <div className="csv-modern-error">
          <div className="error-icon">⚠️</div>
          <span>Error loading dataset: {error}</span>
        </div>
      </div>
    );
  }

  if (!csvData) return null;

  const totalRows = csvData.rows.length;
  const displayRows = csvData.rows.slice(0, maxRows);

  return (
    <div className="csv-modern-container">
      <div className="csv-modern-header">
        <div className="csv-title-section">
          <h3 className="csv-modern-title">{title}</h3>
          <div className="csv-modern-badge">
            {totalRows.toLocaleString()} rows × {csvData.headers.length} columns
          </div>
        </div>
      </div>
      
      <div className="csv-modern-viewport" style={{ height }}>
        <div className="csv-modern-table-wrapper">
          <table className="csv-modern-table">
            <thead className="csv-modern-thead">
              <tr>
                {csvData.headers.map((header, idx) => (
                  <th key={idx} className="csv-modern-th">
                    <div className="csv-header-content">
                      <span className="csv-header-text">{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="csv-modern-tbody">
              {displayRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="csv-modern-row group">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="csv-modern-cell">
                      <div className="csv-cell-content">
                        {cell}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalRows > maxRows && (
          <div className="csv-fade-indicator">
            <div className="fade-gradient"></div>
            <div className="more-rows-text">
              +{totalRows - maxRows} more rows available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
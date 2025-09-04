import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ExpandableTextProps {
  text: string;
  maxLength: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

      if (text.length <= maxLength) {
    return <div className="whitespace-pre-wrap"><ReactMarkdown>{text}</ReactMarkdown></div>;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
                  <div className="whitespace-pre-wrap">
        <ReactMarkdown>
          {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        </ReactMarkdown>
      </div>
      <button 
        onClick={toggleExpanded} 
        className="text-primary hover:text-secondary font-semibold mt-2"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
};

export default ExpandableText;

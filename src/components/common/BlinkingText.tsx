import React, { useState, useEffect } from 'react';

interface BlinkingTextProps {
  text: string;
  color: string;
  shouldBlink: boolean;
  blinkInterval?: number;
}

/**
 * Componente que exibe um texto que pisca de acordo com o parâmetro shouldBlink
 */
const BlinkingText: React.FC<BlinkingTextProps> = ({ 
  text, 
  color, 
  shouldBlink, 
  blinkInterval = 500 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!shouldBlink) {
      setVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, blinkInterval);

    return () => clearInterval(interval);
  }, [shouldBlink, blinkInterval]);

  return (
    <span style={{ 
      color, 
      fontWeight: 'bold',
      opacity: shouldBlink ? (visible ? 1 : 0.5) : 1
    }}>
      {text}
    </span>
  );
};

export default BlinkingText; 
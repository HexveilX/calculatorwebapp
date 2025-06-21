import React, { useState, useEffect, useCallback } from 'react';
import { Delete, RotateCcw } from 'lucide-react';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

function App() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const inputNumber = useCallback((num: string) => {
    setState((prevState) => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: num,
          waitingForOperand: false,
        };
      }
      
      if (prevState.display === '0') {
        return {
          ...prevState,
          display: num,
        };
      }
      
      return {
        ...prevState,
        display: prevState.display + num,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prevState) => {
      if (prevState.waitingForOperand) {
        return {
          ...prevState,
          display: '0.',
          waitingForOperand: false,
        };
      }
      
      if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.',
        };
      }
      
      return prevState;
    });
  }, []);

  const clear = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
  }, []);

  const backspace = useCallback(() => {
    setState((prevState) => {
      if (prevState.display.length > 1) {
        return {
          ...prevState,
          display: prevState.display.slice(0, -1),
        };
      }
      
      return {
        ...prevState,
        display: '0',
      };
    });
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    setState((prevState) => {
      const inputValue = parseFloat(prevState.display);
      
      if (prevState.previousValue === null) {
        return {
          ...prevState,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForOperand: true,
        };
      }
      
      if (prevState.operation && prevState.waitingForOperand) {
        return {
          ...prevState,
          operation: nextOperation,
        };
      }
      
      const currentValue = prevState.previousValue || 0;
      let result: number;
      
      switch (prevState.operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            return {
              ...prevState,
              display: 'Error',
              previousValue: null,
              operation: null,
              waitingForOperand: true,
            };
          }
          result = currentValue / inputValue;
          break;
        default:
          return prevState;
      }
      
      // Format the result to avoid floating point precision issues
      const formattedResult = parseFloat(result.toPrecision(12));
      
      return {
        display: String(formattedResult),
        previousValue: formattedResult,
        operation: nextOperation,
        waitingForOperand: true,
      };
    });
  }, []);

  const calculate = useCallback(() => {
    performOperation('=');
  }, [performOperation]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*') {
        performOperation('×');
      } else if (key === '/') {
        event.preventDefault();
        performOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        calculate();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputDecimal, performOperation, calculate, clear, backspace]);

  const formatDisplay = (display: string) => {
    if (display === 'Error') return display;
    
    // Format large numbers with commas
    const num = parseFloat(display);
    if (!isNaN(num) && Math.abs(num) >= 1000 && display.indexOf('.') === -1) {
      return num.toLocaleString();
    }
    
    return display;
  };

  const Button = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'default' 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: 'default' | 'operator' | 'equals' | 'clear';
  }) => {
    const baseClasses = "h-16 rounded-2xl font-medium text-lg transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50";
    
    const variantClasses = {
      default: "bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl",
      operator: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl",
      equals: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl",
      clear: "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-xl"
    };
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-6 backdrop-blur-lg border border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Calculator</h1>
            <p className="text-gray-400 text-sm">Supports keyboard input</p>
          </div>
          
          {/* Display */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-inner">
            <div className="text-right">
              <div className="text-4xl font-light text-white min-h-[3rem] flex items-center justify-end overflow-hidden">
                {formatDisplay(state.display)}
              </div>
              {state.previousValue !== null && state.operation && state.operation !== '=' && (
                <div className="text-sm text-gray-400 mt-1">
                  {state.previousValue} {state.operation}
                </div>
              )}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button onClick={clear} variant="clear" className="col-span-2">
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Clear
            </Button>
            <Button onClick={backspace} variant="clear">
              <Delete className="w-5 h-5" />
            </Button>
            <Button onClick={() => performOperation('÷')} variant="operator">
              ÷
            </Button>
            
            {/* Row 2 */}
            <Button onClick={() => inputNumber('7')}>7</Button>
            <Button onClick={() => inputNumber('8')}>8</Button>
            <Button onClick={() => inputNumber('9')}>9</Button>
            <Button onClick={() => performOperation('×')} variant="operator">
              ×
            </Button>
            
            {/* Row 3 */}
            <Button onClick={() => inputNumber('4')}>4</Button>
            <Button onClick={() => inputNumber('5')}>5</Button>
            <Button onClick={() => inputNumber('6')}>6</Button>
            <Button onClick={() => performOperation('-')} variant="operator">
              −
            </Button>
            
            {/* Row 4 */}
            <Button onClick={() => inputNumber('1')}>1</Button>
            <Button onClick={() => inputNumber('2')}>2</Button>
            <Button onClick={() => inputNumber('3')}>3</Button>
            <Button onClick={() => performOperation('+')} variant="operator">
              +
            </Button>
            
            {/* Row 5 */}
            <Button onClick={() => inputNumber('0')} className="col-span-2">
              0
            </Button>
            <Button onClick={inputDecimal}>.</Button>
            <Button onClick={calculate} variant="equals">
              =
            </Button>
          </div>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Use keyboard for quick input • ESC to clear
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
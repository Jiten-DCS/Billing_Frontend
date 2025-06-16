import { useEffect, useState, forwardRef } from "react";

const PriceInput = forwardRef(
  (
    {
      value,
      onChange,
      itemId,
      className = "w-20 px-1.5 py-0.5 border border-input rounded-md text-right focus:outline-none focus:ring-1 focus:ring-ring dark:text-black text-xs",
      onKeyDown,
      inputRef,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value?.toString() || "0");

    useEffect(() => {
      setDisplayValue(value?.toString() || "0");
    }, [value]);

    const handleChange = (e) => {
      const input = e.target.value;
      // Allow numbers, decimal points, and empty string
      if (input === "" || /^[0-9]*\.?[0-9]*$/.test(input)) {
        setDisplayValue(input);
      }
    };

    const handleBlur = () => {
      let finalValue = displayValue?.toString() || "0";

      if (finalValue === "") {
        finalValue = "0";
      }

      if (finalValue.endsWith(".")) {
        finalValue += "0";
      }

      if (finalValue.startsWith(".")) {
        finalValue = "0" + finalValue;
      }

      finalValue = finalValue.replace(/^0+(?!\.|$)/, "");

      if (finalValue === "") {
        finalValue = "0";
      }

      setDisplayValue(finalValue);
      onChange(itemId, finalValue);
    };

    const handleKeyDown = (e) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
        ref={(el) => {
          if (ref) ref(el);
          if (inputRef) inputRef(el);
        }}
      />
    );
  }
);

PriceInput.displayName = "PriceInput";

export default PriceInput;

"use client";

import { useId, useState } from "react";

import {
  ETHIOPIAN_COUNTRY_CODE,
  ethiopianNationalDigits,
  formatEthiopianNationalPhone,
} from "@/lib/biloo/phone";

type EthiopianPhoneInputProps = {
  className?: string;
  defaultValue?: string;
  describedBy?: string;
  disabled?: boolean;
  id?: string;
  name: string;
  onValueChange?: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
};

export function EthiopianPhoneInput({
  className,
  defaultValue = "",
  describedBy,
  disabled = false,
  id,
  name,
  onValueChange,
  readOnly = false,
  required = false,
}: EthiopianPhoneInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [displayValue, setDisplayValue] = useState(() =>
    formatEthiopianNationalPhone(defaultValue),
  );

  const nationalDigits = ethiopianNationalDigits(displayValue);
  const submittedValue = nationalDigits
    ? `${ETHIOPIAN_COUNTRY_CODE}${nationalDigits}`
    : "";

  function handleChange(value: string) {
    const nextDisplayValue = formatEthiopianNationalPhone(value);
    const nextNationalDigits = ethiopianNationalDigits(nextDisplayValue);
    const nextSubmittedValue = nextNationalDigits
      ? `${ETHIOPIAN_COUNTRY_CODE}${nextNationalDigits}`
      : "";

    setDisplayValue(nextDisplayValue);
    onValueChange?.(nextSubmittedValue);
  }

  return (
    <div className="biloo-phone-input">
      <span aria-hidden="true" className="biloo-phone-prefix">
        {ETHIOPIAN_COUNTRY_CODE}
      </span>
      <input
        aria-describedby={describedBy}
        aria-label="Ethiopian mobile number after country code +251"
        autoComplete="tel-national"
        className={`${className ?? ""} biloo-phone-local-input`.trim()}
        data-ethiopian-phone-local="true"
        disabled={disabled}
        id={inputId}
        inputMode="numeric"
        maxLength={11}
        onChange={(event) => handleChange(event.target.value)}
        pattern="[79][0-9]{2} [0-9]{3} [0-9]{3}"
        placeholder="912 345 678"
        readOnly={readOnly}
        required={required}
        type="tel"
        value={displayValue}
      />
      <input disabled={disabled} name={name} type="hidden" value={submittedValue} />
    </div>
  );
}

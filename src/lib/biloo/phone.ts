export const ETHIOPIAN_COUNTRY_CODE = "+251";
export const ETHIOPIAN_NATIONAL_LENGTH = 9;

export function ethiopianNationalDigits(input: string) {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("251")) {
    digits = digits.slice(3);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, ETHIOPIAN_NATIONAL_LENGTH);
}

export function formatEthiopianNationalPhone(input: string) {
  const digits = ethiopianNationalDigits(input);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(" ");
}

export function normalizeEthiopianPhone(input: string) {
  const national = ethiopianNationalDigits(input);
  return /^[79]\d{8}$/.test(national)
    ? `${ETHIOPIAN_COUNTRY_CODE}${national}`
    : null;
}

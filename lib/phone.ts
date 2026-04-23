const INDIA_COUNTRY_CODE = "91";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function cleanIndianPhoneInput(value: string): string {
  let digits = digitsOnly(value);

  if (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }

  if (digits.startsWith(INDIA_COUNTRY_CODE) && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 10);
}

export function normalizeIndianPhone(value: string): string | null {
  const cleaned = cleanIndianPhoneInput(value);
  return cleaned.length === 10 ? cleaned : null;
}

export function formatIndianWhatsappNumber(value: string): string | null {
  const normalized = normalizeIndianPhone(value);
  return normalized ? `${INDIA_COUNTRY_CODE}${normalized}` : null;
}

export function buildWhatsappUrl(phone: string, message: string): string | null {
  const destination = formatIndianWhatsappNumber(phone);
  if (!destination) return null;

  return `https://wa.me/${destination}?text=${encodeURIComponent(message)}`;
}

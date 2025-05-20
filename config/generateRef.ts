export function generateReferenceNumber(prefix: string = "PAYMENT"): string {
  // Generate first hexadecimal part (8 characters)
  const firstHex = generateRandomHex(8);

  // Generate second hexadecimal part (4 characters)
  const secondHex = generateRandomHex(4);

  // Generate random number (3 digits)
  const number = Math.floor(Math.random() * 900) + 100; // Ensures 3 digits (100-999)

  // Combine all parts with the specified format
  return `${prefix}-${firstHex}-${secondHex}-${number}`;
}
function generateRandomHex(length: number): string {
  let result = "";
  const characters = "0123456789abcdef";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

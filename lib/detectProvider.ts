export function detectUgandanProvider(phoneNumber: string): string {
  // Extract the network prefix (the 2 digits after +256)
  // For example, in +256787584128, the prefix is "78"
  const prefix = phoneNumber.substring(4, 6);

  // Determine provider based on prefix
  switch (prefix) {
    case "77":
    case "78":
    case "76":
      return "MTN Uganda";

    case "70":
    case "75":
      return "Airtel Uganda";

    case "71":
      return "Uganda Telecom";

    case "79":
      return "Africell Uganda";

    case "74":
      return "Smile Uganda";

    default:
      return "Unknown Provider";
  }
}

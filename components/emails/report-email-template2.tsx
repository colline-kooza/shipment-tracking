import { Html, Head, Body, Container, Text, Section, Hr, Img } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { ReportFilters } from "@/actions/reports";

interface ReportEmailTemplateProps {
  reportType: string;
  generatedAt: Date;
  filters: ReportFilters;
}

export default function ReportEmailTemplate2({
  reportType,
  generatedAt,
  filters,
}: ReportEmailTemplateProps) {
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filterDetails = () => {
    if (filters.type === "DAILY_SHIPMENT_REPORT" && filters.dailyReportDate) {
      return `for ${formatDate(filters.dailyReportDate).split(',')[0]}`; // Just date part
    }
    if (filters.dateRange) {
      return `for the period from ${formatDate(filters.dateRange.from).split(',')[0]} to ${formatDate(filters.dateRange.to).split(',')[0]}`;
    }
    return "";
  };

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto p-6 bg-white rounded-lg shadow-md">
            <Section className="text-center mb-6">
              <Img
                src="/placeholder.svg?height=60&width=180"
                width="180"
                height="60"
                alt="Company Logo"
                className="mx-auto"
              />
            </Section>
            <Section className="text-center mb-6">
              <Text className="text-2xl font-bold text-gray-800">
                {reportType} Report
              </Text>
              <Text className="text-sm text-gray-600">
                Generated on {formatDate(generatedAt)} {filterDetails()}
              </Text>
            </Section>
            <Section className="mb-6">
              <Text className="text-base text-gray-700 leading-relaxed">
                Dear User,
              </Text>
              <Text className="text-base text-gray-700 leading-relaxed">
                Your requested report, "{reportType} Report", has been generated and is attached to this email.
                Please find the detailed report in the attached file.
              </Text>
              <Text className="text-base text-gray-700 leading-relaxed mt-4">
                If you have any questions or require further assistance, please do not hesitate to contact us.
              </Text>
            </Section>
            <Hr className="border-t border-gray-300 my-6" />
            <Section className="text-center text-xs text-gray-500">
              <Text>This is an automated email, please do not reply.</Text>
              <Text>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

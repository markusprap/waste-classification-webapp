import AboutPageContent from "@/components/features/about/about-page-content";

// Disable static optimization for this page because it might use auth context
export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return <AboutPageContent />;
}

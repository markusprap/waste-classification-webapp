import TeamPageContent from "@/components/features/team/team-page-content";

// Disable static optimization for this page because it might use auth context
export const dynamic = 'force-dynamic'

export default function TeamPage() {
  return <TeamPageContent />;
}

import ViewSuggestionPage from "@/page/dashboard/support/view";

export const metadata = {
    title: "View Suggestion - DragBizz Store",
    description: "View suggestion details and track progress",
};

export default async function ViewSuggestionPageRoute({ params }) {
    const { id } = await params;
    return <ViewSuggestionPage suggestionId={id} />;
}

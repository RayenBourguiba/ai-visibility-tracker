import CreateProjectForm from "@/components/projects/CreateProjectForm";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">AI Visibility Tracker</h1>
      <p className="mt-2 text-gray-600">
        Crée un projet, génère des prompts, puis lance des runs (ChatGPT/Gemini/Perplexity) pour mesurer la visibilité.
      </p>

      <div className="mt-8 rounded-xl border p-6">
        <h2 className="text-lg font-medium">Nouveau projet</h2>
        <div className="mt-4">
          <CreateProjectForm />
        </div>
      </div>
    </main>
  );
}
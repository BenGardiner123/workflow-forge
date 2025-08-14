# WorkflowForge

WorkflowForge is a web app that converts plain English into validated n8n workflow JSON. It includes guided prompting, a massive local template library for inspiration, basic linting, and one-click export/copy.

## Quick start

1) Install deps

```bash
npm install
```

2) Configure environment

Create a `.env` file in the project root with your Groq API key (or set it in your shell):

```bash
VITE_GROQ_API_KEY=your_groq_api_key
```

3) Run dev server

```bash
npm run dev
```

Open the app at the URL shown by Vite (usually `http://localhost:5173`).

## Usage

### Generate a workflow
- Enter a natural-language description in the prompt.
- Adjust model controls (Temperature, Max Tokens). Keep “Force JSON” on for the best validity.
- Click Generate (or press Ctrl/Cmd+Enter).

### Templates & Context (RAG-lite)
- Under the prompt, open “Templates & Context”.
- Search the local `workflows/` library and click “Add as Context” to attach a short template summary to your next generation.
- Selected context snippets appear as chips. Remove a chip or click Clear to reset.
- Context guides the model and does not copy template JSON.

### Preview & Export
- Preview the graph, JSON, and node list on the right.
- Download or Copy JSON.
- If the generated workflow has a `__testPayload`, click “Test Workflow” to run a simulated test.

## Safety & Validation
- Server-side validation: Zod schema validates the workflow structure.
- Self-repair: The server attempts to parse/repair JSON (JSON5) and normalize common shape issues.
- Lenient mode: If strict validation fails, the server coerces the structure and returns it with a note in `__notes`. Review in “Lints & Checks”.
- Redaction: Known secret patterns are redacted in logs and sanitized in output.

## Linting (in Metadata)
- Missing trigger
- Unreachable nodes
- Nodes with no outgoing edges (info)
- Weak naming (info)

## n8n Import (optional)
- The backend includes an `/api/import-to-n8n` endpoint that creates a workflow in your n8n instance.
- UI currently copies JSON; wiring the import form (URL/API key) is trivial and can be enabled as needed.

## Environment & Dev Notes
- Vite dev server is configured with a local API middleware for `/api/*` routes.
- HMR and WebSocket settings are pinned to `localhost:5173` for reliability.
- The template library is built from the local `workflows/` folder at dev time.
- Provider swap: The code currently pins Groq for simplicity, but it’s easy to switch to OpenAI or Claude. See `api/generate-workflow.ts`:
  - Replace `callGroq` with `_callOpenAI` or `_callClaude` (both are sketched).
  - Update the request body per provider.
  - Change the env var to the provider’s key (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
  - In the UI, add models to `PromptInput` or expose provider selection.

## Troubleshooting
- “GROQ API error: Bad Request”: The app retries without JSON mode and then falls back to a broadly available model. Verify `VITE_GROQ_API_KEY` is set.
- “Failed to generate workflow (422)”: The server returns `json_missing` or `json_invalid` with details. Enable Force JSON, reduce temperature, or add context.
- WebSocket/HMR errors: Ensure nothing else is bound to port 5173; the config pins host/port.

## Scripts
- `npm run dev` – Start Vite dev server
- `npm run build` – Build the app
- `npm run preview` – Preview the production build

## License
MIT


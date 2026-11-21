# Portfolio assistant

The assistant is available through the homepage terminal and a same-origin `POST /api/chat` Node.js route. It is disabled by default. There is no authentication, conversation database, embedding service, or model access to tools. Projects and articles are read from their current published PostgreSQL versions. Synthetic examples, drafts, and withdrawn or deleted entries are excluded. An explicit profile sync stores the reviewed public homepage sections for retrieval. If that snapshot differs from the homepage source, the assistant omits it until it is synced again.

## Run locally

Use your dedicated personalized development database so retrieved projects correspond to the live local pages. The review fixtures can be imported with the [personalization instructions](personalization.md). Point both `DATABASE_URL` and `DATABASE_MIGRATION_URL` at the intended local database before migrating, then run:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm db:migrate
corepack pnpm db:chat-profile --apply
corepack pnpm dev
```

The sync command writes only the homepage sections already approved through the public site source. Repeat it after changing approved homepage content. Test the UI without API calls by starting Next.js in development with `AI_CHAT_ENABLED=true AI_PROVIDER=fake` and opening it on loopback. The UI displays **Test mode**. The fake provider selects deterministic excerpts, and production refuses that mode.

For a hosted smoke test, set these values in your local server environment and restart Next.js. Use an authorized Groq Cloud test key. The model setting is optional and defaults to the value shown.

```dotenv
AI_PROVIDER=groq
GROQ_MODEL=openai/gpt-oss-20b
GROQ_API_KEY=
AI_CHAT_ENABLED=true
```

Ask “What did Samir do at FlyRank AI?” and verify the answer against its portfolio citation. Ask about an undocumented achievement and verify the fallback before enabling the public feature. Groq's [model list](https://console.groq.com/docs/models) and [structured-output documentation](https://console.groq.com/docs/structured-outputs) identify models that support strict JSON Schema. Check capability, quotas, and pricing before changing models.

## Environment and Rahti

| Variable                 | Purpose                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `AI_CHAT_ENABLED`        | Set to `true` to enable chat. Unset or set to `false` for the kill switch.                                                                 |
| `AI_PROVIDER`            | Set to `groq` for hosted inference. `fake` is development-only on loopback.                                                                |
| `GROQ_MODEL`             | Groq model ID with strict JSON Schema support. Default `openai/gpt-oss-20b`.                                                               |
| `GROQ_API_KEY`           | Groq Cloud API key. Set it in a server-only environment variable or Secret.                                                                |
| `SITE_ORIGIN`            | Set the exact external HTTPS origin for Rahti. Production requires it for the origin check. During loopback development it can be omitted. |
| `DATABASE_URL`           | Use the existing runtime PostgreSQL connection. All replicas must share the same database for rate limits and leases.                      |
| `DATABASE_MIGRATION_URL` | Optional direct PostgreSQL connection for the existing migration command.                                                                  |
| `AI_CHAT_PER_MINUTE`     | Shared admission limit per UTC minute. Default `8`.                                                                                        |
| `AI_CHAT_PER_DAY`        | Shared admission limit per UTC day. Default `50`.                                                                                          |
| `AI_CHAT_PER_MONTH`      | Shared admission limit per UTC calendar month. Default `500`.                                                                              |
| `AI_CHAT_CONCURRENT`     | Shared concurrent request limit. Default `2`.                                                                                              |
| `AI_CHAT_TIMEOUT_MS`     | Deadline for the retrieval and provider portion of a streamed response. Default `20000`.                                                   |

Apply the additive migrations and sync the reviewed homepage snapshot as an explicit release step. Configure the Rahti deployment with server-side Secrets and environment variables, and allow outbound access to `https://api.groq.com`. Use a Node.js runtime and configure the Rahti route and any other proxy to pass streaming responses, with an idle timeout greater than the assistant deadline. Verify streaming and cancellation through the actual ingress in staging. To disable the assistant, set the kill switch and roll out the environment change across replicas. This milestone does not provision or deploy Rahti resources.

## Grounding and operational limits

Keyword and phrase matching ranks approved titles, tags, aliases, and text. At most four sources and three excerpts per source enter the generation prompt. Groq Chat Completions returns a concise answer as structured claims with supporting excerpt IDs. The server checks each claim's shape, length, IDs, and numeric facts against the cited evidence. A separate Groq completion then checks whether each claim answers the question and is supported by its cited text. Failed checks yield the unsupported-answer fallback. The verifier uses the same model and cannot guarantee the accuracy of every paraphrase.

The server generates and deduplicates citation links from the allowlisted public routes. Groq strict structured outputs are buffered because the API does not support upstream streaming in that mode. The browser still receives the existing NDJSON events, with answer chunks and sources sent after verification. The Groq Chat Completions base URL is `https://api.groq.com/openai/v1`. The model's `openai/` prefix identifies a model hosted by Groq.

The route accepts at most 8 KiB and five visitor messages of up to 600 characters each. The generation call gets the current question and bounded excerpts. The verification call gets the same question, proposed claims, and only their cited excerpts. Earlier visitor messages can inform local follow-up retrieval. Each admission can use up to two Groq completions under a shared request deadline, with completion caps of 512 and 384 tokens respectively and SDK retries disabled. The browser keeps the conversation in memory and clears it on reload. The application stores aggregate UTC usage counters and expiring leases without questions, answers, or IP addresses. Expired rows are cleaned on admission. Review [Groq's data controls](https://console.groq.com/docs/your-data) for provider-side retention and usage metadata. Ingress or hosting logs may record client metadata independently.

A PostgreSQL transaction reserves all usage windows and a concurrent lease before doing retrieval or contacting the model. Limits count admitted requests conservatively, including unsupported questions, failed calls, and visitor cancellations. These are usage ceilings, and actual monetary cost depends on model pricing and input length. Use provider-side project budget controls and review billed usage separately. Without accounts, global limits can be exhausted by one caller. The same-origin check limits cross-site browser requests but does not authenticate callers or stop direct HTTP clients.

The assistant instruction policy treats visitor messages and retrieved text as data. Obvious requests for secrets or instruction overrides bypass the provider. Server-side validation restricts the evidence IDs and public links that can appear in a response. Model output never renders as HTML. Answers and citations may reflect content visible at the time retrieval began, and refreshing or asking again uses current published content.

Run the database integration suites sequentially against the isolated `TEST_DATABASE_URL`:

```sh
corepack pnpm build
corepack pnpm test:db
corepack pnpm test:chat
```

The deterministic chat suite uses the fake provider and a mocked Groq SDK transport. Neither makes live API calls.

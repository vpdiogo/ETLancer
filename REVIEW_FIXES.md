# Code Review Fixes — PR #2

## Críticos

- [x] **1. Path traversal no CSV connector** — validar/sanitizar `file_path` para evitar leitura de arquivos arbitrários
- [x] **2. Loader permite escrita em qualquer tabela** — restringir `target_table` e `schema` a valores seguros
- [x] **3. Flow acessa relationship fora da session** — carregar `source_connection` dentro da session com eager loading
- [x] **4. Schedules passam `run_id` vazio** — corrigir `schedules.py` para criar PipelineRun antes de chamar o flow

## Importantes

- [x] **5. Timing attack na API key** — usar `hmac.compare_digest()` em `security.py`
- [x] **6. SSRF no REST API connector** — bloquear IPs privados/internos no `base_url`
- [x] **7. `asyncio.create_task` sem referência** — guardar referência da task no `runner.py`
- [x] **8. Google Sheets connector bloqueia event loop** — rodar gspread em `run_in_executor`
- [x] **9. `except Exception: pass` no trigger** — logar erro e atualizar status do run para "failed"
- [x] **10. CI faltando env vars** — adicionar `ENCRYPTION_KEY` e `API_KEY` no `ci.yml`
- [x] **11. Produção sem migração** — adicionar `alembic upgrade head` no `docker-compose.prod.yml`

## Menores

- [x] **12. Chave Fernet hardcoded** — trocar por placeholder no `.env.example` e docker-compose
- [x] **13. `tryParseJson` duplicado** — extrair para `lib/utils.ts`
- [x] **14. Loader cria engine a cada chamada** — tornar singleton
- [x] **15. `str.contains` aceita regex** — adicionar `regex=False`
- [x] **16. `oauth2client` deprecated** — migrar para `google-auth`
- [x] **17. Sem cascade delete** — tratar IntegrityError ou adicionar `ondelete`
- [x] **18. Polling incondicional de runs** — parar polling quando não há runs ativos

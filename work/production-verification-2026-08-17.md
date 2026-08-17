# Production verification — 2026-08-17

## Deployment

- Production deployment: `dpl_HKrWeTmFJu5B2Qces27YcFudT6Zw`
- Commit: `b4fb1533fdee6dbe0190c8cb1dc0be70735900b7`
- State: `READY`
- Official aliases include `https://www.primedigitalhub.com.br`

## Browser verification

Opened `https://www.primedigitalhub.com.br/dashboard/admin` in the authenticated teacher browser.

Observed:

- Admin Panel rendered successfully.
- Authenticated user displayed as `alexandre@primedigitalhub.com.br`.
- Publication Boundary card rendered.
- `Review queue` link rendered and points to the new human-review interface.
- No server error or OAuth redirect error was observed on this page.

## Remaining runtime evidence

The page being reachable proves the deployment and admin session are operational. It does not, by itself, prove Firestore WIF runtime success or a completed transcript ingestion. Those require runtime logs and a real Drive/Flow submission.

No production Flow was changed during this verification.

## Environment-variable inspection

Opened the Vercel project environment-variable page at `https://vercel.com/prime-digital-hun-dasboard/prime-hub-portal/settings/environment-variables`.

The Production list visibly contained `GCP_SERVICE_ACCOUNT_EMAIL`, `GCP_WORKLOAD_IDENTITY_POOL_ID`, `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID`, and `GCP_AUDIENCE`, as well as the legacy Firebase variables. The runtime diagnostics simultaneously reported that the federation project number and all federation fields were absent. The missing `GCP_PROJECT_ID` and `GCP_PROJECT_NUMBER` variables are being added as non-secret Production configuration; no secret value was opened or copied.

The Vercel project details also reported the project Node.js setting as `20.x`, despite the repository package contract being set to Node 24. That Vercel project setting remains a separate production configuration item to change before the October 1, 2026 deadline.


## Redeploy com WIF — estado observado

- Deployment observado: `8wUNSu3o3ZNoaLus3ubjY2AdXpFx`.
- Branch: `main`.
- Commit: `b4fb153` — `feat: add gated transcript review and publication workflow`.
- Ambiente: `Production`.
- O redeploy foi iniciado após adicionar `GCP_PROJECT_ID` e `GCP_PROJECT_NUMBER` na Vercel. Nenhum valor secreto foi aberto ou registrado.
- Estado no último refresh: build ainda em andamento; as páginas estáticas foram geradas e a Vercel estava em `Creating build cache...`, ainda sem marcar `Ready`.
- Próxima verificação: confirmar `Ready`, abrir o domínio oficial e consultar logs de runtime para procurar `authMode: vercel-oidc-wif` e leitura Firestore bem-sucedida.

## Confirmação estruturada do redeploy

A consulta estruturada da Vercel confirmou que o deployment `dpl_8wUNSu3o3ZNoaLus3ubjY2AdXpFx` está em `READY`, com target `production`, a partir do commit `b4fb1533fdee6dbe0190c8cb1dc0be70735900b7`. O deployment recebeu os aliases `www.primedigitalhub.com.br`, `primedigitalhub.com.br` e os aliases internos da Vercel. O deployment foi criado como `redeploy` e não apresentou `aliasError`.

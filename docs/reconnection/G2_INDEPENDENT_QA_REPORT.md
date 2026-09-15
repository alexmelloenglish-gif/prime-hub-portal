# G2 — Independent QA Report

**Baseline reference:** `057dafc97c91e59e5ba7cfb99528cc25530a5175`

**Status:** **PASS condicionado — nenhum P0/P1 observado; um P2 não bloqueante.**

## Finding

**P2 — Desktop 1280px, mobile 390px e mobile 320px — área clicável de links textuais.** No build local correspondente ao baseline, os links do rodapé “Portal do aluno” e “Falar com a Prime” medem aproximadamente 20px de altura. A navegação textual desktop também mede aproximadamente 20px. Em contraste, os itens do menu mobile aberto medem 44px e os CTAs principais medem 48px ou mais. Recomendação: ampliar a área clicável vertical dos links do rodapé para pelo menos 44px, caso esse padrão seja obrigatório. Este P2 não bloqueia G3 e não justifica alterar a copy ou a arquitetura.

## PASSes observados

- Desktop: primeira dobra, H1, imagem hero e CTAs principais renderizam sem overflow horizontal.
- Mobile 390px e 320px: layout responsivo sem overflow horizontal; header, logo e Portal permanecem dentro da viewport.
- Menu mobile: disclosure nativo abre e fecha; itens têm 44px de altura.
- CTA primário de Calendar permanece plenamente acessível em 390px e 320px.
- Âncoras `#como-funciona`, `#exemplo`, `#professor` e `#duvidas` possuem alvos.
- Destinos observados: Calendar, WhatsApp e `/dashboard`.
- Quatro imagens carregaram, com `alt` não vazio e dimensões válidas.
- FAQ usa `details/summary` nativos; abertura, fechamento, foco visível e ativação por teclado foram verificados.
- Pares representativos de contraste ficaram acima de 4,5:1.
- CLS observado foi 0 e FCP local foi 396ms.

## Limitações

O deployment Vercel redirecionou o agente para login, portanto Portal autenticado, LCP e INP reais do deployment não foram confirmados. A inspeção suplementar foi feita no checkout local; os arquivos da landing, componentes e assets relevantes correspondiam ao baseline. Calendar, WhatsApp e Portal foram verificados por `href`, sem seguir ações externas.

## Recommendation

Não há correção P0/P1. Prosseguir para **G3 dry-run/controlado**, preservando `057dafc` como referência imutável. O P2 pode ser corrigido posteriormente ou explicitamente aceito como não bloqueante; não deve gerar nova rodada conceitual.

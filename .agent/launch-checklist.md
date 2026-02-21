# AI Prompt Builder — Launch & Monetization Checklist

> Last updated: 2026-02-19

## What's Already Done ✅

- [x] App funcional (v1.0.13, Electron + React + Tailwind)
- [x] Build Mac (DMG + ZIP) y Windows (NSIS)
- [x] CI/CD — GitHub Actions auto-build on tag push (`.github/workflows/release.yml`)
- [x] Auto-updates — `electron-updater` + GitHub Releases (private repo, token-based)
- [x] macOS notarization pipeline (`scripts/notarize.js`, Apple keys)
- [x] Code signing — Developer ID + Hardened Runtime
- [x] Analytics — PostHog via `@eb-packages/analytics`
- [x] Release scripts — `yarn release:patch/minor/major`
- [x] Gemini SDK integration + embedded browser wrapper mode

---

## What's Missing

### 1. Landing Page 🌐 (BLOCKER)

- [ ] Single-page: hero, features, demo GIF/video, CTA descarga, pricing
- [ ] Dominio propio (ej: `aipromptbuilder.com` o subdominio)
- [ ] SEO: meta tags, Open Graph
- [ ] Stack sugerido: Next.js o HTML+CSS estático

### 2. Monetización 💰 (BLOCKER)

**No hay nada de pagos implementado.** Opciones evaluadas:

| Opción          | Fee      | Esfuerzo | Notas                          |
| --------------- | -------- | -------- | ------------------------------ |
| Gumroad         | 10%      | 🟢 Bajo  | Zero-code, licencias incluidas |
| LemonSqueezy    | 5%+fee   | 🟢 Bajo  | Tax compliance automático      |
| Paddle          | Variable | 🟡 Medio | Aprobación lenta               |
| Stripe + custom | 2.9%     | 🔴 Alto  | Requiere license server propio |

**Pendiente implementar:**

- [ ] Decidir plataforma (Gumroad vs LemonSqueezy recomendado)
- [ ] Definir modelo: Free vs Freemium vs Pago con trial
- [ ] Sistema de license key (validación al iniciar app)
- [ ] Flujo de activación en Electron

### 3. Distribución Pública 📦

El repo es **privado** → releases de GitHub son invisibles al público.

- [ ] Decidir canal: Gumroad/LS hostea binarios, o landing con links directos
- [ ] Evaluar Mac App Store (30% fee, review lento) vs distribución directa
- [ ] Resolver auto-update feed: actualmente usa `private: true` con `GH_TOKEN`
- [ ] Si se distribuye público, decidir si repo se hace público o se cambia update feed

### 4. Branding 🎨

- [ ] Ícono profesional (actual: default `electron-vite.svg`)
- [ ] Generar `.icns` (macOS) y `.ico` (Windows)
- [ ] Screenshots de la app para landing
- [ ] Demo video/GIF del flujo principal

### 5. Contenido y Marketing 📝

- [ ] README público (actual es boilerplate de Vite)
- [ ] Product Hunt launch preparado
- [ ] Twitter/X thread de anuncio
- [ ] SEO keywords: "AI prompt builder", "Gemini prompt tester", etc.

### 6. Legal ⚖️

- [ ] Terms of Service (TOS)
- [ ] Privacy Policy (obligatorio por PostHog analytics)
- [ ] EULA para el installer
- [ ] Nota: usuarios usan su propia API key de Gemini (simplifica compliance)

### 7. Pulido Técnico 🔧

- [ ] Limpiar `.env.example` (todavía referencia `SENTRY_DSN` que ya se removió)
- [ ] Onboarding flow para nuevos usuarios (primer run)
- [ ] Mejorar error handling sin API key
- [ ] Telemetry opt-in/opt-out (GDPR)

---

## Sprint Plan Sugerido

### Sprint 1 — Foundation (1-2 días)

1. Decidir monetización (Gumroad vs LemonSqueezy)
2. Crear ícono profesional
3. Privacy Policy + TOS (templates)

### Sprint 2 — Vitrina (2-3 días)

4. Landing page
5. Screenshots + demo GIF
6. Integrar link de compra/descarga

### Sprint 3 — Activación (1-2 días)

7. License key validation en la app
8. Onboarding primer uso
9. Limpiar configs

### Sprint 4 — Launch 🚀 (1 día)

10. Product Hunt submission
11. Tweet de anuncio
12. Monitorear PostHog

---

## Decisiones Pendientes del Owner

1. ¿Modelo de monetización? (Free / Freemium / Pago con trial)
2. ¿Plataforma de pagos? (Gumroad / LemonSqueezy / otro)
3. ¿Mac App Store o distribución directa?
4. ¿Dominio?
5. ¿Precio? (benchmark: $9-29 one-time para tools similares)

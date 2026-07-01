# Come vedere Puki su TestFlight 📲

TestFlight è l'app di Apple per provare le app prima che vadano sull'App Store.
Il collegamento con GitHub avviene **tramite Expo (EAS)**: Expo si collega al repo,
compila l'app iOS nel cloud e la carica su TestFlight.

## Cosa ti serve (una sola volta)

1. **Account Expo** (gratis) → <https://expo.dev/signup>
2. **Apple Developer Program** (99 $/anno, obbligatorio per TestFlight — è di Apple,
   non si può aggirare) → <https://developer.apple.com/programs/enroll/>

## Percorso A — tutto dal sito, collegando GitHub (consigliato, zero terminale)

1. Vai su <https://expo.dev> → **Create a project** → chiamalo `puki`.
2. Nella pagina del progetto: **GitHub** → *Connect repository* → autorizza e scegli
   `sakajenia/Puki`.
3. Sempre dal sito: **Builds → Build from GitHub** → branch
   `claude/cleaning-monitoring-app-o0dt6v` → piattaforma **iOS** → profilo
   **production**. Alla prima build Expo ti chiede il login Apple e crea da solo
   certificati e provisioning profile.
4. Quando la build è verde: **Submit to App Store** (sempre dal sito). Expo la carica
   su App Store Connect.
5. Dopo qualche minuto apri **TestFlight** sull'iPhone (scaricalo dall'App Store),
   accedi con lo stesso Apple ID: trovi **Puki** pronta da installare. ✅

## Percorso B — dal terminale (se preferisci)

```bash
npm install -g eas-cli
eas login                      # account Expo
eas init                       # collega questo progetto al tuo account
eas build --platform ios --profile production   # ti chiede il login Apple
eas submit --platform ios --latest              # invia a TestFlight
```

## Note

- La configurazione build (`eas.json`) e il bundle ID (`com.puki.app` in `app.json`)
  sono già pronti in questo repo.
- Ogni push su GitHub può ricompilare l'app automaticamente (opzione *Autobuild*
  nella pagina GitHub del progetto Expo).
- Prima di buildare, ricordati di configurare Supabase (vedi `README.md`) e di
  mettere le variabili in `.env` — oppure su expo.dev in **Environment variables**
  (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- Senza account Apple Developer puoi comunque provare l'app subito con **Expo Go**
  (gratis): `npx expo start --tunnel` sul tuo computer e scansiona il QR.

# 🎓 Oui-Si Quest : Escape Game PWA (LEA Valence)

> Application Web Progressive (PWA) d'escape game pédagogique pour les étudiants L1 LEA en dispositif Oui-Si à l'Université Grenoble Alpes (Valence).
> Conçue pour réactiver les notions clés en 10-15 minutes en fin de cours, dédramatiser l'anglais, développer un **Growth Mindset** et entraîner l'oreille et la voix au **Word Stress**.

---

## 🎯 Épisode 1 : Le Mystère du "YET" et l'Accent Tonique (Slides 1 à 17)

Basé sur le diaporama de cours :
- **Épreuve 1 (Le Bouclier Mental) :** Transformer les pensées défaitistes avec le mot magique **"YET"** (Carol Dweck, Khan Academy). Défi voix au micro ou saisie.
- **Épreuve 2 (L'Arsenal du Détective) :** Les 3 étapes d'or du Word Stress (Découper -> Repérer l'accent -> Observer le Schwa `/ə/`) et les outils clés (*YouGlish*, *Merriam-Webster*, *LDOCE*).
- **Épreuve 3 (Le Radar Rythmique & Rubber Band) :** Écoute audio haute définition, mécanique de l'élastique pour étirer la voyelle accentuée, piège du suffixe *-EE* (*employee* vs *employer*, *government*, *tomorrow*, *vegetable*).
- **Épreuve 4 (L'Épreuve du Micro) :** Reconnaissance vocale temps réel avec visualiseur d'ondes sonores pour s'entraîner à parler à voix haute sans peur de l'erreur (mode salle silencieuse disponible).
- **Épreuve 5 (Le Coffre & Bilan de Mission) :** Déverrouillage à 4 chiffres (code 7394), explosion de confettis, badge personnalisé *"Master of YET"* et fiche récapitulative détachable.

---

## 🚀 Déploiement sur Vercel (En 2 minutes)

### Méthode 1 : Via la ligne de commande (Directe & Rapide)
Ouvre ton terminal dans le dossier du projet :
```bash
cd /home/brewal/escape-game-ouisi
npx vercel
```
1. Suis le lien de connexion qui s'affiche pour t'identifier sur ton compte Vercel (via GitHub ou Email).
2. Réponds aux questions interactives (appuie simplement sur Entrée pour accepter les valeurs par défaut détectées automatiquement pour Vite).
3. Pour déployer en production :
```bash
npx vercel --prod
```
Tu obtiendras immédiatement une URL en **https://...vercel.app** que tu pourras projeter aux étudiants sous forme de QR code !

---

### Méthode 2 : Via GitHub + Dashboard Vercel (Recommandée pour le long terme)
1. Crée un nouveau dépôt privé ou public sur ton GitHub : `escape-game-ouisi`
2. Pousse le code existant :
   ```bash
   git remote add origin https://github.com/TON_PSEUDO/escape-game-ouisi.git
   git push -u origin main
   ```
3. Rends-toi sur [vercel.com/new](https://vercel.com/new) et clique sur **Import** en face de `escape-game-ouisi`.
4. Clique sur **Deploy**. Chaque modification future sur `main` sera automatiquement mise à jour en direct !

---

## 📱 Utilisation en Classe (PWA)

- **Sur smartphone (iPhone / Android) :**
  - Les étudiants ouvrent le lien dans Safari ou Chrome.
  - La bannière PWA leur propose d'ajouter l'application à leur écran d'accueil en 1 clic.
  - L'application se lance alors en plein écran, sans barre d'adresse, comme une application native.
  - Fonctionne même hors ligne grâce au Service Worker.

## 🛠️ Comment ajouter une nouvelle mission pour la séance suivante ?

Le système est pensé pour être modulaire. Ouvre [`src/data/courses.ts`](file:///home/brewal/escape-game-ouisi/src/data/courses.ts) et ajoute une entrée dans le tableau `COURSES` :
```typescript
{
  id: 'ouisi-session-2',
  number: 2,
  title: 'Mission 02 : Connected Speech & Weak Forms',
  ...
}
```
L'application mettra à jour automatiquement le sélecteur de séances !

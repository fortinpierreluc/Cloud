# Calculateur de Coûts d'Hébergement Cloud

Application web pour calculer le coût d'hébergement cloud selon le nombre d'usagers. Cet outil permet aux revendeurs de solution d'hébergement cloud de générer facilement des soumissions pour leurs clients.

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
npm install
```

### Lancer le serveur de développement
```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5174**

### Autres commandes

- `npm run build` - Construire l'application pour la production
- `npm run preview` - Prévisualiser la build de production
- `npm run lint` - Vérifier le code avec ESLint

## 📁 Structure du projet

```
Cloud/
├── src/
│   ├── components/
│   │   ├── PricingCalculator.tsx    # Composant principal du calculateur
│   │   └── PricingCalculator.css    # Styles du calculateur
│   ├── config/
│   │   └── pricingConfig.ts         # Configuration de la grille de coûts
│   ├── utils/
│   │   └── pricingCalculator.ts     # Logique de calcul
│   ├── types.ts                     # Types TypeScript
│   ├── App.tsx                      # Composant racine
│   ├── App.css                      # Styles globaux de l'app
│   ├── main.tsx                     # Point d'entrée
│   └── index.css                    # Styles globaux
├── index.html                       # Template HTML
├── vite.config.ts                   # Configuration Vite (port 5174)
└── package.json                     # Dépendances et scripts
```

## ⚙️ Configuration de la grille de coûts

Pour intégrer votre vraie grille de coûts, modifiez le fichier **`src/config/pricingConfig.ts`**.

### Structure de la configuration

```typescript
export const defaultPricingConfig: CloudPricingConfig = {
  currency: 'CAD',                    // Devise (CAD, USD, EUR, etc.)
  billingPeriod: 'monthly',           // 'monthly' ou 'annual'
  
  tiers: [
    {
      minUsers: 1,                    // Nombre minimum d'usagers
      maxUsers: 10,                    // Nombre maximum (optionnel)
      pricePerUser: 25.00,            // Prix par usager
      basePrice: 0,                    // Prix de base (optionnel)
      description: 'Description du palier',
    },
    // Ajoutez d'autres paliers...
  ],

  prerequisites: {
    minUsers: 1,                       // Nombre minimum d'usagers requis
    maxUsers: 1000,                    // Nombre maximum d'usagers
    requiredFeatures: [],              // Fonctionnalités requises (optionnel)
  },

  additionalFees: {
    setup: 500.00,                     // Frais d'installation (optionnel)
    support: 0,                        // Support mensuel (optionnel)
    storage: 0.10,                     // Coût par GB de stockage (optionnel)
  },
};
```

### Exemple de configuration

```typescript
tiers: [
  {
    minUsers: 1,
    maxUsers: 10,
    pricePerUser: 30.00,
    description: 'Petite entreprise (1-10 usagers)',
  },
  {
    minUsers: 11,
    maxUsers: 50,
    pricePerUser: 25.00,
    description: 'Moyenne entreprise (11-50 usagers)',
  },
  {
    minUsers: 51,
    pricePerUser: 20.00,
    description: 'Grande entreprise (51+ usagers)',
  },
],
```

## 🎯 Fonctionnalités

- ✅ Calcul automatique du coût selon le nombre d'usagers
- ✅ Sélection automatique du bon palier de prix
- ✅ Affichage détaillé du calcul (coût par usager, frais additionnels, total)
- ✅ Export de la soumission en fichier texte
- ✅ Impression de la soumission
- ✅ Interface responsive (mobile et desktop)
- ✅ Validation des prérequis (min/max usagers)

## 🛠️ Technologies utilisées

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et serveur de développement
- **ESLint** - Linter pour la qualité du code

## 📝 Notes

- La configuration actuelle contient des exemples de données
- Remplacez `defaultPricingConfig` dans `src/config/pricingConfig.ts` par votre vraie grille de coûts
- Les prérequis du fournisseur peuvent être configurés dans la section `prerequisites`
- Les frais additionnels (installation, support, stockage) sont optionnels

Prêt à intégrer votre grille de coûts ! 🎉


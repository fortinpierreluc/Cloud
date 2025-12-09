// Types pour la grille de coûts d'hébergement cloud MIR-RT

/**
 * Configuration des ressources serveur
 */
export interface ServerResources {
  // Serveur principal (MIR-RT + Base de données)
  mainServer: {
    os: string; // Windows Server 2019
    ram: number; // RAM en Go (pour MIR-RT + passerelles)
    disk: number; // Espace disque en Go
    databaseRam?: number; // RAM pour la base de données (HFSQL: 1.5 Go)
  };
  
  // Serveur Terminal Server (par tranche de 10 utilisateurs)
  terminalServer: {
    os: string; // Windows Server 2019
    ramPerUser: number; // RAM par usager (100 Mo)
    ramPerGateway: number; // RAM par passerelle (100 Mo)
    disk: number; // Espace disque en Go
  };
}

/**
 * Coûts des ressources BZ Cloud (basés sur Couts.pdf)
 */
export interface ResourceCosts {
  // Coûts unitaires BZ Cloud
  vmBaseCost: number; // Coût de base par VM (6,05 $)
  cpuCost: number; // Coût par processeur (32,10 $)
  ramCostPerGB: number; // Coût par Go de RAM (6,80 $)
  diskCostPerGB: number; // Coût par Go de disque (0,16 $)
  
  // Licences SPLA
  terminalServerCALCost: number; // Coût par CAL Terminal Serveur (11,36 $)
  
  // Spécifications des VMs (nombre de processeurs par défaut)
  vmSpecs: {
    mainServer: {
      cpus: number; // Nombre de processeurs pour le serveur principal
      minRam: number; // RAM minimum en Go (pour la base de données)
    };
    terminalServer: {
      cpus: number; // Nombre de processeurs pour Terminal Server
      minRam?: number; // RAM minimum en Go (par défaut 12 Go)
    };
  };
  
  // Coût par utilisateur (licence/logiciel) - optionnel
  costPerUser?: number;
  
  // Coût de la base de données (si SQL externe) - optionnel
  databaseCost?: number;
  
  // Coût des passerelles (par passerelle) - optionnel
  gatewayCost?: number;
  
  // Frais additionnels
  additionalFees?: {
    setup?: number; // Frais d'installation unique
    support?: number; // Support mensuel
    storage?: number; // Par GB supplémentaire
  };
}

export interface CloudPricingConfig {
  currency: string;
  billingPeriod: 'monthly' | 'annual';
  
  // Configuration des ressources nécessaires
  serverResources: ServerResources;
  
  // Coûts des ressources
  costs: ResourceCosts;
  
  // Règle de calcul des VMs
  vmCalculation: {
    minUsersPerServer: number; // Minimum d'usagers par serveur (10)
    maxUsersPerServer: number; // Maximum d'usagers par serveur (13)
    maxUsersOnMainServer: number; // Max d'usagers sur le serveur principal (13)
  };
  
  // Prérequis
  prerequisites?: {
    minUsers?: number;
    maxUsers?: number;
    requiredFeatures?: string[];
  };
}

/**
 * Détail des VMs calculées
 */
export interface VMConfiguration {
  mainServerCount: number; // Toujours 1
  terminalServerCount: number; // Calculé selon le nombre d'usagers
  totalVMs: number;
  usersOnMainServer: number; // Nombre d'usagers sur le serveur principal (max 10)
  usersPerTerminalServer: number; // Répartition des usagers sur les Terminal Servers
}

/**
 * Résultat du calcul de coûts
 */
export interface CalculationResult {
  numberOfUsers: number;
  vmConfiguration: VMConfiguration;
  subtotal: number;
  additionalFees: {
    setup?: number;
    onboarding?: number; // Frais de prise en charge unique
    supportAccess?: number; // Frais d'accès mensuel au soutien technique
    support?: number;
    storage?: number;
  };
  total: number;
  currency: string;
  billingPeriod: string;
  breakdown: {
    mainServerCost: number; // Coût du serveur principal
    terminalServerCost: number; // Coût des Terminal Servers
    terminalServerCALCost: number; // Coût des CAL Terminal Serveur
    duoSecurityCost: number; // Coût de la licence Double authentification Duo Security
    userLicensesCost: number; // Coût des licences utilisateurs (si applicable)
    databaseCost: number; // Coût de la base de données
    gatewayCost: number; // Coût des passerelles (si applicable)
    additionalCosts: number; // Frais additionnels
    // Détail des ressources pour le serveur principal
    mainServerResources?: {
      vmBase: number;
      cpus: number;
      ram: number;
      disk: number;
      total: number;
    };
    // Détail des ressources pour les Terminal Servers
    terminalServerResources?: {
      vmBase: number;
      cpus: number;
      ram: number;
      disk: number;
      total: number;
      count: number;
    };
  };
}


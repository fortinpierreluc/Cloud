import { CloudPricingConfig } from '../types';

/**
 * Configuration de la grille de coûts d'hébergement cloud MIR-RT
 * 
 * Coûts basés sur le fichier Couts.pdf
 */
export const defaultPricingConfig: CloudPricingConfig = {
  currency: 'CAD',
  billingPeriod: 'monthly',
  
  // Configuration des ressources serveur (basée sur Configurations.pdf)
  serverResources: {
    mainServer: {
      os: 'Windows Server 2019',
      ram: 0, // N/A pour MIR-RT (partage de fichiers uniquement)
      disk: 5, // +/- 5 Go au départ
      databaseRam: 1.5, // RAM pour HFSQL (ajustable)
    },
    terminalServer: {
      os: 'Windows Server 2019',
      ramPerUser: 0.1, // 100 Mo par usager
      ramPerGateway: 0.1, // 100 Mo par passerelle
      disk: 5, // +/- 5 Go au départ
    },
  },
  
  // Coûts des ressources BZ Cloud (basés sur Couts.pdf)
  costs: {
    // Coûts unitaires BZ Cloud
    vmBaseCost: 6.05, // Coût de base par VM
    cpuCost: 32.10, // Coût par processeur
    ramCostPerGB: 6.80, // Coût par Go de RAM
    diskCostPerGB: 0.16, // Coût par Go de disque
    
    // Licences SPLA
    terminalServerCALCost: 11.36, // Coût par CAL Terminal Serveur
    
    // Licences supplémentaires
    duoSecurityCost: 10.00, // Coût par utilisateur pour Double authentification Duo Security
    
    // Spécifications des VMs
    vmSpecs: {
      mainServer: {
        cpus: 3, // Nombre de processeurs pour le serveur principal (2 + 1 supplémentaire)
        minRam: 12, // RAM minimum en Go
      },
      terminalServer: {
        cpus: 3, // Nombre de processeurs pour Terminal Server (2 + 1 supplémentaire)
        minRam: 12, // RAM minimum en Go
      },
    },
    
    // Coût par utilisateur (licence/logiciel) - optionnel
    costPerUser: undefined,
    
    // Coût de la base de données (si SQL externe) - optionnel
    databaseCost: undefined, // HFSQL est inclus, SQL serait en plus
    
    // Coût des passerelles (par passerelle) - optionnel
    gatewayCost: undefined,
    
    // Frais additionnels
    additionalFees: {
      setup: 0, // Frais d'installation unique - À définir si applicable
      support: 0, // Support mensuel (0 = inclus)
      storage: undefined, // Par GB supplémentaire - Utiliser diskCostPerGB si nécessaire
    },
  },
  
  // Règle de calcul des VMs
  vmCalculation: {
    minUsersPerServer: 10, // Minimum 10 utilisateurs par serveur
    maxUsersPerServer: 13, // Maximum 13 utilisateurs par serveur
    maxUsersOnMainServer: 13, // Maximum 13 utilisateurs sur le serveur principal (qui agit aussi comme Terminal Server)
  },
  
  // Prérequis
  prerequisites: {
    minUsers: 1,
    maxUsers: undefined, // Pas de limite maximale par défaut
    requiredFeatures: [],
  },
};

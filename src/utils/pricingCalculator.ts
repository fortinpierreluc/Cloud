import { CloudPricingConfig, CalculationResult } from '../types';
import { calculateVMConfiguration, calculateRequiredResources } from './vmCalculator';

/**
 * Calcule le coût d'une VM selon ses spécifications
 */
function calculateVMCost(
  vmBaseCost: number,
  cpuCost: number,
  ramCostPerGB: number,
  diskCostPerGB: number,
  cpus: number,
  ramGB: number,
  diskGB: number
): number {
  return vmBaseCost + (cpuCost * cpus) + (ramCostPerGB * ramGB) + (diskCostPerGB * diskGB);
}

/**
 * Calcule le coût total d'hébergement selon le nombre d'usagers
 * avec la logique de calcul des VMs et les coûts détaillés BZ Cloud
 */
export function calculateCost(
  numberOfUsers: number,
  config: CloudPricingConfig
): CalculationResult | null {
  // Vérifier les prérequis
  if (config.prerequisites?.minUsers && numberOfUsers < config.prerequisites.minUsers) {
    return null; // Nombre d'usagers insuffisant
  }
  if (config.prerequisites?.maxUsers && numberOfUsers > config.prerequisites.maxUsers) {
    return null; // Nombre d'usagers trop élevé
  }

  // Calculer la configuration des VMs
  const vmConfiguration = calculateVMConfiguration(numberOfUsers, config);
  
  // Calculer les ressources nécessaires
  const resources = calculateRequiredResources(vmConfiguration, config);
  
  // Calculer les coûts
  const costs = config.costs;
  const vmSpecs = costs.vmSpecs;
  
  // Calculer la RAM nécessaire pour le serveur principal
  // RAM de base pour la base de données
  let mainServerRam = config.serverResources.mainServer.databaseRam || 0;
  
  // Ajouter la RAM pour les utilisateurs sur le serveur principal
  // Le serveur principal peut avoir des usagers même s'il y a des Terminal Servers
  if (vmConfiguration.usersOnMainServer > 0) {
    // Ajouter la RAM nécessaire pour les utilisateurs sur le serveur principal (100 Mo par utilisateur)
    const usersRam = vmConfiguration.usersOnMainServer * config.serverResources.terminalServer.ramPerUser;
    mainServerRam += usersRam;
  }
  
  // Calculer la RAM nécessaire pour les Terminal Servers
  // Chaque Terminal Server peut accueillir entre 10 et 13 usagers (100 Mo par usager)
  const terminalServerRamPerVM = vmConfiguration.terminalServerCount > 0
    ? Math.max(
        vmConfiguration.usersPerTerminalServer * config.serverResources.terminalServer.ramPerUser,
        vmSpecs.terminalServer.minRam || 12
      )
    : 0;
  
  // Calculer le détail des ressources pour le serveur principal
  // Minimum 12 Go de RAM
  const mainServerRamFinal = Math.max(mainServerRam, vmSpecs.mainServer.minRam);
  const mainServerVMBase = costs.vmBaseCost;
  const mainServerCPUs = vmSpecs.mainServer.cpus;
  const mainServerCPUCost = costs.cpuCost * mainServerCPUs;
  const mainServerRAMCost = costs.ramCostPerGB * mainServerRamFinal;
  // 100 Go de base + espace disque configuré
  const mainServerDiskGB = 100 + config.serverResources.mainServer.disk;
  const mainServerDiskCost = costs.diskCostPerGB * mainServerDiskGB;
  
  // Coût du serveur principal
  const mainServerCost = mainServerVMBase + mainServerCPUCost + mainServerRAMCost + mainServerDiskCost;
  
  // Calculer le détail des ressources pour les Terminal Servers
  let terminalServerCost = 0;
  let terminalServerVMBase = 0;
  let terminalServerCPUCost = 0;
  let terminalServerRAMCost = 0;
  let terminalServerDiskCost = 0;
  
  if (vmConfiguration.terminalServerCount > 0) {
    // 100 Go de base + espace disque configuré
    const terminalServerDiskGB = 100 + config.serverResources.terminalServer.disk;
    const costPerTerminalServer = calculateVMCost(
      costs.vmBaseCost,
      costs.cpuCost,
      costs.ramCostPerGB,
      costs.diskCostPerGB,
      vmSpecs.terminalServer.cpus,
      terminalServerRamPerVM,
      terminalServerDiskGB
    );
    terminalServerCost = costPerTerminalServer * vmConfiguration.terminalServerCount;
    
    // Détail par Terminal Server
    terminalServerVMBase = costs.vmBaseCost;
    terminalServerCPUCost = costs.cpuCost * vmSpecs.terminalServer.cpus;
    terminalServerRAMCost = costs.ramCostPerGB * terminalServerRamPerVM;
    terminalServerDiskCost = costs.diskCostPerGB * terminalServerDiskGB;
  }
  
  // Coût des CAL Terminal Serveur
  // Un CAL par utilisateur (même pour ceux de moins de 10)
  const terminalServerCALCost = numberOfUsers * costs.terminalServerCALCost;
  
  // Coût de la licence Double authentification Duo Security
  // 10 $ par utilisateur par mois
  const duoSecurityCost = numberOfUsers * costs.duoSecurityCost;
  
  // Coût des licences utilisateurs (si applicable)
  const userLicensesCost = costs.costPerUser 
    ? numberOfUsers * costs.costPerUser 
    : 0;
  
  // Coût de la base de données (si applicable)
  const databaseCost = costs.databaseCost || 0;
  
  // Coût des passerelles (si applicable, à calculer selon le nombre de passerelles)
  const gatewayCost = costs.gatewayCost || 0;
  
  // Calculer le frais de prise en charge unique
  // 1 à 10 utilisateurs : 1000 $
  // À chaque utilisateur supplémentaire : +100 $
  let onboardingFee = 1000; // Base pour 1-10 utilisateurs
  if (numberOfUsers > 10) {
    const additionalUsers = numberOfUsers - 10;
    onboardingFee += additionalUsers * 100;
  }
  
  // Calculer le frais d'accès mensuel au soutien technique
  // 10 $ par utilisateur, avec un minimum de 100 $
  const supportAccessFee = Math.max(numberOfUsers * 10, 100);
  
  // Calculer les frais additionnels
  const additionalFees: CalculationResult['additionalFees'] = {};
  let additionalCosts = 0;

  if (costs.additionalFees?.setup) {
    additionalFees.setup = costs.additionalFees.setup;
    // Le setup n'est pas inclus dans le total mensuel, c'est un frais unique
  }

  // Ajouter le frais de prise en charge
  additionalFees.onboarding = onboardingFee;

  // Ajouter le frais d'accès au soutien technique
  additionalFees.supportAccess = supportAccessFee;
  additionalCosts += supportAccessFee;

  if (costs.additionalFees?.support) {
    additionalFees.support = costs.additionalFees.support;
    additionalCosts += costs.additionalFees.support;
  }

  if (costs.additionalFees?.storage) {
    // Le coût de stockage devrait être calculé avec le nombre de GB en paramètre
    // Pour l'instant, on ne l'inclut pas dans le calcul automatique
  }

  // Calculer le sous-total (sans les frais d'installation et de prise en charge qui sont uniques)
  const subtotal = mainServerCost + terminalServerCost + terminalServerCALCost + 
                   duoSecurityCost + userLicensesCost + databaseCost + gatewayCost;
  
  // Le total mensuel inclut tous les frais récurrents (y compris l'accès au soutien technique)
  const total = subtotal + additionalCosts;

  return {
    numberOfUsers,
    vmConfiguration,
    subtotal,
    additionalFees,
    total,
    currency: config.currency,
    billingPeriod: config.billingPeriod,
    breakdown: {
      mainServerCost,
      terminalServerCost,
      userLicensesCost,
      databaseCost,
      gatewayCost,
      additionalCosts,
      terminalServerCALCost,
      duoSecurityCost,
      mainServerResources: {
        vmBase: mainServerVMBase,
        cpus: mainServerCPUCost,
        ram: mainServerRAMCost,
        disk: mainServerDiskCost,
        total: mainServerCost,
      },
      terminalServerResources: vmConfiguration.terminalServerCount > 0 ? {
        vmBase: terminalServerVMBase,
        cpus: terminalServerCPUCost,
        ram: terminalServerRAMCost,
        disk: terminalServerDiskCost,
        total: terminalServerVMBase + terminalServerCPUCost + terminalServerRAMCost + terminalServerDiskCost,
        count: vmConfiguration.terminalServerCount,
      } : undefined,
    },
  };
}

/**
 * Formate un montant en devise
 */
export function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

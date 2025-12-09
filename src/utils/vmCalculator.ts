import { VMConfiguration, CloudPricingConfig } from '../types';

/**
 * Calcule la configuration des VMs nécessaires selon le nombre d'utilisateurs
 * 
 * Règles:
 * - 1-13 utilisateurs: Tout sur le serveur principal qui agit aussi comme Terminal Server
 * - 14+ utilisateurs: Répartition équilibrée entre tous les serveurs (y compris le serveur principal)
 *   Chaque serveur doit avoir entre 10 et 13 utilisateurs pour optimiser les coûts
 */
export function calculateVMConfiguration(
  numberOfUsers: number,
  config: CloudPricingConfig
): VMConfiguration {
  const { maxUsersOnMainServer, minUsersPerServer, maxUsersPerServer } = config.vmCalculation;
  
  // Si 13 utilisateurs ou moins, tout va sur le serveur principal
  if (numberOfUsers <= maxUsersOnMainServer) {
    return {
      mainServerCount: 1,
      terminalServerCount: 0,
      totalVMs: 1,
      usersOnMainServer: numberOfUsers,
      usersPerTerminalServer: 0,
    };
  }
  
  // Pour plus de 13 utilisateurs, équilibrer la répartition entre tous les serveurs
  // Le serveur principal compte comme un serveur Terminal Server pour la répartition
  // On veut entre 10 et 13 utilisateurs par serveur (y compris le serveur principal)
  
  // Calculer le nombre optimal de serveurs (incluant le serveur principal)
  // On essaie de maximiser à 13 usagers par serveur pour minimiser les coûts
  const totalServersNeeded = Math.ceil(numberOfUsers / maxUsersPerServer);
  
  // Calculer la répartition équilibrée
  const usersPerServer = numberOfUsers / totalServersNeeded;
  
  // Vérifier que la répartition respecte les contraintes (10-13 usagers par serveur)
  let finalServerCount = totalServersNeeded;
  let finalUsersPerServer = usersPerServer;
  
  if (usersPerServer < minUsersPerServer) {
    // Si la moyenne est < 10, on doit augmenter le nombre de serveurs
    finalServerCount = Math.ceil(numberOfUsers / minUsersPerServer);
    finalUsersPerServer = numberOfUsers / finalServerCount;
  } else if (usersPerServer > maxUsersPerServer) {
    // Si la moyenne est > 13, on doit augmenter le nombre de serveurs
    finalServerCount = Math.ceil(numberOfUsers / maxUsersPerServer);
    finalUsersPerServer = numberOfUsers / finalServerCount;
  }
  
  // Le serveur principal compte comme 1 serveur
  // Les Terminal Servers supplémentaires = total - 1 (serveur principal)
  const terminalServerCount = finalServerCount - 1;
  
  // Le serveur principal aura le même nombre d'usagers que les autres serveurs
  // (arrondi pour équilibrer)
  const usersOnMainServer = Math.round(finalUsersPerServer);
  const remainingUsers = numberOfUsers - usersOnMainServer;
  
  // Calculer la moyenne d'usagers par Terminal Server
  const usersPerTerminalServer = terminalServerCount > 0
    ? remainingUsers / terminalServerCount
    : 0;
  
  return {
    mainServerCount: 1, // Toujours 1 serveur principal
    terminalServerCount,
    totalVMs: finalServerCount,
    usersOnMainServer,
    usersPerTerminalServer,
  };
}

/**
 * Calcule les ressources nécessaires pour une configuration donnée
 */
export function calculateRequiredResources(
  vmConfig: VMConfiguration,
  config: CloudPricingConfig
) {
  const { mainServer, terminalServer } = config.serverResources;
  
  // RAM totale nécessaire
  const mainServerRam = mainServer.ram + (mainServer.databaseRam || 0);
  const terminalServerRam = vmConfig.terminalServerCount * (
    terminalServer.ramPerUser * vmConfig.usersPerTerminalServer +
    terminalServer.ramPerGateway * 0 // À ajuster si des passerelles sont nécessaires
  );
  
  // Espace disque total
  const mainServerDisk = mainServer.disk;
  const terminalServerDisk = vmConfig.terminalServerCount * terminalServer.disk;
  
  return {
    totalRam: mainServerRam + terminalServerRam,
    totalDisk: mainServerDisk + terminalServerDisk,
    mainServerRam,
    mainServerDisk,
    terminalServerRam,
    terminalServerDisk,
  };
}

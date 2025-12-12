import { useState } from 'react';
import { CloudPricingConfig, CalculationResult } from '../types';
import { calculateCost, formatCurrency } from '../utils/pricingCalculator';
import jsPDF from 'jspdf';
import datadisLogo from '../assets/Datadis.png';
import './PricingCalculator.css';

interface PricingCalculatorProps {
  config: CloudPricingConfig;
}

export default function PricingCalculator({ config }: PricingCalculatorProps) {
  const [numberOfUsers, setNumberOfUsers] = useState<number | ''>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const performCalculation = () => {
    // Si le champ est vide, ne pas calculer
    if (numberOfUsers === '') {
      setResult(null);
      setError(null);
      return;
    }

    // Convertir la valeur en nombre pour le calcul
    const numUsers = typeof numberOfUsers === 'number' ? numberOfUsers : (config.prerequisites?.minUsers || 1);
    const calculation = calculateCost(numUsers, config);
    if (calculation) {
      setResult(calculation);
      setError(null);
    } else {
      setResult(null);
      if (config.prerequisites?.minUsers && numUsers < config.prerequisites.minUsers) {
        setError(`Le nombre minimum d'usagers est de ${config.prerequisites.minUsers}`);
      } else if (config.prerequisites?.maxUsers && numUsers > config.prerequisites.maxUsers) {
        setError(`Le nombre maximum d'usagers est de ${config.prerequisites.maxUsers}`);
      } else {
        setError('Impossible de calculer le coût pour ce nombre d\'usagers');
      }
    }
  };

  const handleCalculate = () => {
    // Démarrer l'animation
    setIsCalculating(true);
    setResult(null);
    setError(null);

    // Attendre 2 secondes puis calculer
    setTimeout(() => {
      performCalculation();
      setIsCalculating(false);
    }, 2000);
  };

  const handleExport = () => {
    if (!result) return;

    const vmConfig = result.vmConfiguration;
    const now = new Date();
    const exportData = {
      date: now.toLocaleDateString('fr-CA'),
      dateTime: now.toLocaleString('fr-CA', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      nombreUsagers: result.numberOfUsers,
      vmServeurPrincipal: vmConfig.mainServerCount,
      vmTerminalServers: vmConfig.terminalServerCount,
      totalVMs: vmConfig.totalVMs,
      usagersSurServeurPrincipal: vmConfig.usersOnMainServer,
      coutServeurPrincipal: formatCurrency(result.breakdown.mainServerCost, result.currency),
      coutTerminalServers: formatCurrency(result.breakdown.terminalServerCost, result.currency),
      coutCALTerminalServer: result.breakdown.terminalServerCALCost > 0
        ? formatCurrency(result.breakdown.terminalServerCALCost, result.currency)
        : 'N/A',
      nombreCAL: result.numberOfUsers, // CAL pour tous les utilisateurs
      coutLicences: result.breakdown.userLicensesCost > 0 
        ? formatCurrency(result.breakdown.userLicensesCost, result.currency)
        : 'N/A',
      coutBaseDonnees: result.breakdown.databaseCost > 0
        ? formatCurrency(result.breakdown.databaseCost, result.currency)
        : 'Inclus',
      coutPasserelles: result.breakdown.gatewayCost > 0
        ? formatCurrency(result.breakdown.gatewayCost, result.currency)
        : 'N/A',
      fraisSupport: result.breakdown.additionalCosts > 0
        ? formatCurrency(result.breakdown.additionalCosts, result.currency)
        : 'Inclus',
      fraisSoutienTechnique: result.additionalFees.supportAccess
        ? formatCurrency(result.additionalFees.supportAccess, result.currency)
        : 'N/A',
      fraisInstallation: result.additionalFees.setup
        ? formatCurrency(result.additionalFees.setup, result.currency)
        : 'N/A',
      fraisPriseEnCharge: result.additionalFees.onboarding
        ? formatCurrency(result.additionalFees.onboarding, result.currency)
        : 'N/A',
      sousTotal: formatCurrency(result.subtotal, result.currency),
      total: formatCurrency(result.total, result.currency),
      periode: result.billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel',
    };

    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Fonction pour ajouter une nouvelle page si nécessaire
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SOUMISSION D\'HÉBERGEMENT CLOUD MIR-RT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date et heure d'exportation
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date et heure d'exportation: ${exportData.dateTime}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Section INFORMATIONS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre d'usagers: ${exportData.nombreUsagers}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`Période de facturation: ${exportData.periode}`, margin + 5, yPosition);
    yPosition += 12;

    // Section CONFIGURATION DES SERVEURS VIRTUELS
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIGURATION DES SERVEURS VIRTUELS', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Serveur principal (MIR-RT + Base de données): ${exportData.vmServeurPrincipal} VM`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`  - Usagers sur le serveur principal: ${exportData.usagersSurServeurPrincipal}`, margin + 5, yPosition);
    yPosition += 7;
    if (exportData.vmTerminalServers > 0) {
      doc.text(`Terminal Servers: ${exportData.vmTerminalServers} VM(s)`, margin + 5, yPosition);
      yPosition += 7;
    }
    doc.text(`Total de VMs: ${exportData.totalVMs}`, margin + 5, yPosition);
    yPosition += 12;

    // Section RESSOURCES INFONUAGIQUE (selon la grille Couts.pdf)
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESSOURCES INFONUAGIQUE', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Calculer les totaux de toutes les ressources
    const totalVMBase = (result.breakdown.mainServerResources?.vmBase || 0) + 
                        (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.vmBase * result.breakdown.terminalServerResources.count : 0);
    const totalCPUs = (result.breakdown.mainServerResources?.cpus || 0) + 
                      (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.cpus * result.breakdown.terminalServerResources.count : 0);
    const totalRAM = (result.breakdown.mainServerResources?.ram || 0) + 
                     (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.ram * result.breakdown.terminalServerResources.count : 0);
    const totalDisk = (result.breakdown.mainServerResources?.disk || 0) + 
                      (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.disk * result.breakdown.terminalServerResources.count : 0);
    const subtotalResources = totalVMBase + totalCPUs + totalRAM + totalDisk;

    // Calculer le nombre d'unités
    const nbVMs = result.vmConfiguration.totalVMs;
    const nbCPUs = config.costs.vmSpecs.mainServer.cpus + 
                  (result.breakdown.terminalServerResources ? config.costs.vmSpecs.terminalServer.cpus * result.breakdown.terminalServerResources.count : 0);
    const ramGB = Math.max(
      (config.serverResources.mainServer.databaseRam || 0) + 
      (result.vmConfiguration.terminalServerCount === 0 ? result.numberOfUsers * config.serverResources.terminalServer.ramPerUser : 0),
      config.costs.vmSpecs.mainServer.minRam
    ) + (result.breakdown.terminalServerResources ? 
      (result.vmConfiguration.usersPerTerminalServer * config.serverResources.terminalServer.ramPerUser) * result.breakdown.terminalServerResources.count : 0);
    // 100 Go de base par serveur
    const diskGB = (100 + config.serverResources.mainServer.disk) + 
                  (result.breakdown.terminalServerResources ? (100 + config.serverResources.terminalServer.disk) * result.breakdown.terminalServerResources.count : 0);

    doc.text(`Machines virtuelles (${nbVMs} VM × ${formatCurrency(config.costs.vmBaseCost, result.currency)}): ${formatCurrency(totalVMBase, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`Processeurs (${nbCPUs} × ${formatCurrency(config.costs.cpuCost, result.currency)}): ${formatCurrency(totalCPUs, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`RAM Provisionné (${ramGB.toFixed(1)} Go × ${formatCurrency(config.costs.ramCostPerGB, result.currency)}): ${formatCurrency(totalRAM, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`Espace disque Provisionné (${diskGB} Go × ${formatCurrency(config.costs.diskCostPerGB, result.currency)}): ${formatCurrency(totalDisk, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Sous-total - Ressources Infonuagique: ${formatCurrency(subtotalResources, result.currency)}`, margin + 5, yPosition);
    yPosition += 12;

    // Section LICENCES
    if (result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LICENCES', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Licences SPLA
      if (result.breakdown.terminalServerCALCost > 0) {
        doc.text(`CAL Terminal Serveur (${result.numberOfUsers} CAL × ${formatCurrency(config.costs.terminalServerCALCost, result.currency)}): ${formatCurrency(result.breakdown.terminalServerCALCost, result.currency)}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      // Double authentification Duo Security
      if (result.breakdown.duoSecurityCost > 0) {
        doc.text(`Double authentification Duo Security (${result.numberOfUsers} utilisateurs × ${formatCurrency(config.costs.duoSecurityCost, result.currency)}): ${formatCurrency(result.breakdown.duoSecurityCost, result.currency)}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      // Sous-total des licences
      if (result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) {
        const totalLicenses = (result.breakdown.terminalServerCALCost || 0) + (result.breakdown.duoSecurityCost || 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Sous-total - Licences: ${formatCurrency(totalLicenses, result.currency)}`, margin + 5, yPosition);
        yPosition += 12;
      }
    }

    // Section ACCÈS AU SOUTIEN TECHNIQUE
    if (result.additionalFees.supportAccess && result.additionalFees.supportAccess > 0) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ACCÈS AU SOUTIEN TECHNIQUE', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const supportDescription = result.numberOfUsers * 10 >= 100
        ? `Accès au soutien technique (${result.numberOfUsers} utilisateurs × 10 $):`
        : `Accès au soutien technique (minimum 100 $):`;
      doc.text(`${supportDescription} ${formatCurrency(result.additionalFees.supportAccess, result.currency)}`, margin + 5, yPosition);
      yPosition += 12;
    }

    // Section FRAIS UNIQUES (seulement pour frais d'installation)
    if (exportData.fraisInstallation !== 'N/A') {
      checkPageBreak(20);
      yPosition += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FRAIS UNIQUES', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Frais d'installation: ${exportData.fraisInstallation}`, margin + 5, yPosition);
      yPosition += 12;
    }

    // Total général
    checkPageBreak(15);
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL ${exportData.periode.toUpperCase()}: ${exportData.total}`, pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Remettre la couleur noire
    yPosition += 12;

    // Section FRAIS UNIQUES
    if (exportData.fraisInstallation !== 'N/A' || exportData.fraisPriseEnCharge !== 'N/A') {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FRAIS UNIQUES', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (exportData.fraisInstallation !== 'N/A') {
        doc.text(`Frais d'installation: ${exportData.fraisInstallation}`, margin + 5, yPosition);
        yPosition += 7;
      }
      if (exportData.fraisPriseEnCharge !== 'N/A') {
        doc.text(`Frais de prise en charge: ${exportData.fraisPriseEnCharge}`, margin + 5, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    // TOTAL
    checkPageBreak(15);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 108, 255); // Couleur bleue pour le total
    doc.text(`TOTAL ${exportData.periode.toUpperCase()}: ${exportData.total}`, pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Remettre la couleur noire

    // Sauvegarder le PDF
    const fileName = `soumission-mirrt-${exportData.nombreUsagers}-usagers-${exportData.date.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Si le champ est vide, permettre l'affichage du placeholder
    if (inputValue === '') {
      setNumberOfUsers('');
      return;
    }
    
    // Retirer tous les zéros non significatifs au début (ex: "005" devient "5", "0" reste "0")
    // Mais on garde "0" si c'est la seule valeur
    if (inputValue.length > 1) {
      inputValue = inputValue.replace(/^0+/, '');
      // Si après nettoyage il ne reste rien, remettre "0"
      if (inputValue === '') {
        inputValue = '0';
      }
    }
    
    // Convertir en nombre
    const numValue = parseInt(inputValue, 10);
    
    // Si ce n'est pas un nombre valide, ne rien faire
    if (isNaN(numValue)) {
      return;
    }
    
    // Appliquer les limites min/max
    const minUsers = config.prerequisites?.minUsers || 1;
    const maxUsers = config.prerequisites?.maxUsers;
    
    if (numValue < minUsers) {
      setNumberOfUsers(minUsers);
    } else if (maxUsers && numValue > maxUsers) {
      setNumberOfUsers(maxUsers);
    } else {
      setNumberOfUsers(numValue);
    }
  };
  
  const handleBlur = () => {
    // Ne rien faire - on laisse l'utilisateur décider quand calculer
    // Le bouton "Calculer" sera désactivé si le champ est vide
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si la touche Entrée est pressée et qu'il y a un nombre d'utilisateurs valide
    if (e.key === 'Enter' && numberOfUsers !== '' && !isCalculating) {
      handleCalculate();
    }
  };

  return (
    <div className="pricing-calculator">
      <div className="calculator-header">
        <h1>Datacloudis</h1>
        <p className="subtitle">Estimez le coût de votre solution !</p>
        <img src={datadisLogo} alt="Datadis" className="header-logo" />
      </div>

      <div className="calculator-content">
        <div className="input-section">
          <label htmlFor="numberOfUsers">
            Nombre d'usagers
            {config.prerequisites?.minUsers && (
              <span className="hint">
                (Minimum: {config.prerequisites.minUsers}
                {config.prerequisites?.maxUsers && `, Maximum: ${config.prerequisites.maxUsers}`})
              </span>
            )}
          </label>
          <input
            id="numberOfUsers"
            type="number"
            min={config.prerequisites?.minUsers || 1}
            max={config.prerequisites?.maxUsers || undefined}
            value={numberOfUsers}
            onChange={handleUserInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Entrer ici"
            className="user-input"
          />
          <button
            onClick={handleCalculate}
            disabled={isCalculating || numberOfUsers === ''}
            className="calculate-button"
          >
            {isCalculating ? (
              <span className="spinner">⏳</span>
            ) : (
              <>Calculer 💰</>
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {result && (
          <div className="result-section">
            <div className="export-date-time print-only">
              Date et heure d'exportation: {new Date().toLocaleString('fr-CA', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="result-card">
              <div className="result-header">
                <h2>Résultat du calcul</h2>
                <div className="result-badge">
                  {result.numberOfUsers} {result.numberOfUsers === 1 ? 'usager' : 'usagers'}
                </div>
              </div>

              {/* Configuration des VMs */}
              <div className="vm-configuration">
                <h3>Configuration des serveurs virtuels</h3>
                <div className="vm-details">
                  {result.vmConfiguration.terminalServerCount === 0 ? (
                    <div className="vm-item">
                      <span className="vm-label">Serveur principal (MIR-RT + Base de données + Terminal Server):</span>
                      <span className="vm-value">{result.vmConfiguration.mainServerCount} VM</span>
                      <span className="vm-users">({result.vmConfiguration.usersOnMainServer} usagers)</span>
                    </div>
                  ) : (
                    <>
                      <div className="vm-item">
                        <span className="vm-label">Serveur principal (MIR-RT + Base de données + Terminal Server):</span>
                        <span className="vm-value">{result.vmConfiguration.mainServerCount} VM</span>
                        <span className="vm-users">({result.vmConfiguration.usersOnMainServer} usagers)</span>
                      </div>
                      <div className="vm-item">
                        <span className="vm-label">Terminal Servers supplémentaires:</span>
                        <span className="vm-value">{result.vmConfiguration.terminalServerCount} VM(s)</span>
                        <span className="vm-users">
                          {result.vmConfiguration.terminalServerCount === 1 
                            ? `(${Math.round(result.vmConfiguration.usersPerTerminalServer)} usagers)`
                            : `(~${Math.round(result.vmConfiguration.usersPerTerminalServer)} usagers/VM)`
                          }
                        </span>
                      </div>
                    </>
                  )}
                  <div className="vm-item total-vms">
                    <span className="vm-label">Total de VMs:</span>
                    <span className="vm-value">{result.vmConfiguration.totalVMs}</span>
                  </div>
                </div>
              </div>

              <div className="result-details">
                <h3>Détail des coûts ({result.billingPeriod === 'monthly' ? 'mensuel' : 'annuel'})</h3>

                {result.breakdown.userLicensesCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Licences utilisateurs:</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.userLicensesCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.breakdown.databaseCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Base de données:</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.databaseCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.breakdown.gatewayCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Passerelles:</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.gatewayCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.additionalFees.supportAccess && result.additionalFees.supportAccess > 0 && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="resources-detail">
                      <h4>ACCÈS AU SOUTIEN TECHNIQUE</h4>
                      <div className="resource-item">
                        <span>Accès au soutien technique:</span>
                        <span>{formatCurrency(result.additionalFees.supportAccess, result.currency)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* RESSOURCES INFONUAGIQUE (selon la grille Couts.pdf) */}
                <div className="detail-divider"></div>
                <div className="resources-detail">
                  <h4>RESSOURCES INFONUAGIQUE</h4>
                  
                  {(() => {
                    const totalVMBase = (result.breakdown.mainServerResources?.vmBase || 0) + 
                                        (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.vmBase * result.breakdown.terminalServerResources.count : 0);
                    const totalCPUs = (result.breakdown.mainServerResources?.cpus || 0) + 
                                     (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.cpus * result.breakdown.terminalServerResources.count : 0);
                    const totalRAM = (result.breakdown.mainServerResources?.ram || 0) + 
                                     (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.ram * result.breakdown.terminalServerResources.count : 0);
                    const totalDisk = (result.breakdown.mainServerResources?.disk || 0) + 
                                      (result.breakdown.terminalServerResources ? result.breakdown.terminalServerResources.disk * result.breakdown.terminalServerResources.count : 0);
                    const subtotalResources = totalVMBase + totalCPUs + totalRAM + totalDisk;

                    // Calculer le nombre d'unités
                    const nbVMs = result.vmConfiguration.totalVMs;
                    const nbCPUs = config.costs.vmSpecs.mainServer.cpus + 
                                  (result.breakdown.terminalServerResources ? config.costs.vmSpecs.terminalServer.cpus * result.breakdown.terminalServerResources.count : 0);
                    // RAM pour le serveur principal (minimum 12 Go)
                    const mainServerRam = Math.max(
                      (config.serverResources.mainServer.databaseRam || 0) + 
                      (result.vmConfiguration.terminalServerCount === 0 ? result.numberOfUsers * config.serverResources.terminalServer.ramPerUser : 0),
                      config.costs.vmSpecs.mainServer.minRam
                    );
                    // RAM pour les Terminal Servers (minimum 12 Go par serveur)
                    const terminalServerRam = result.breakdown.terminalServerResources ? 
                      Math.max(
                        result.vmConfiguration.usersPerTerminalServer * config.serverResources.terminalServer.ramPerUser,
                        config.costs.vmSpecs.terminalServer.minRam || 12
                      ) * result.breakdown.terminalServerResources.count : 0;
                    const ramGB = mainServerRam + terminalServerRam;
                    // 100 Go de base par serveur
                    const diskGB = (100 + config.serverResources.mainServer.disk) + 
                                  (result.breakdown.terminalServerResources ? (100 + config.serverResources.terminalServer.disk) * result.breakdown.terminalServerResources.count : 0);

                    return (
                      <>
                        <div className="resource-item">
                          <span>Machines virtuelles ({nbVMs} VM × {formatCurrency(config.costs.vmBaseCost, result.currency)}):</span>
                          <span>{formatCurrency(totalVMBase, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>Processeurs ({nbCPUs} × {formatCurrency(config.costs.cpuCost, result.currency)}):</span>
                          <span>{formatCurrency(totalCPUs, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>RAM Provisionné ({ramGB.toFixed(1)} Go × {formatCurrency(config.costs.ramCostPerGB, result.currency)}):</span>
                          <span>{formatCurrency(totalRAM, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>Espace disque Provisionné ({diskGB} Go × {formatCurrency(config.costs.diskCostPerGB, result.currency)}):</span>
                          <span>{formatCurrency(totalDisk, result.currency)}</span>
                        </div>
                        <div className="resource-item resource-total">
                          <span>Sous-total - Ressources Infonuagique:</span>
                          <span>{formatCurrency(subtotalResources, result.currency)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* LICENCES */}
                {(result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="resources-detail">
                      <h4>LICENCES</h4>
                      
                      {/* Licences SPLA */}
                      {result.breakdown.terminalServerCALCost > 0 && (
                        <div className="resource-item">
                          <span>CAL Terminal Serveur ({result.numberOfUsers} CAL × {formatCurrency(config.costs.terminalServerCALCost, result.currency)}):</span>
                          <span>{formatCurrency(result.breakdown.terminalServerCALCost, result.currency)}</span>
                        </div>
                      )}
                      
                      {/* Double authentification Duo Security */}
                      {result.breakdown.duoSecurityCost > 0 && (
                        <div className="resource-item">
                          <span>Double authentification Duo Security ({result.numberOfUsers} utilisateurs × {formatCurrency(config.costs.duoSecurityCost, result.currency)}):</span>
                          <span>{formatCurrency(result.breakdown.duoSecurityCost, result.currency)}</span>
                        </div>
                      )}
                      
                      {/* Sous-total des licences */}
                      {(result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) && (
                        <div className="resource-item resource-total">
                          <span>Sous-total - Licences:</span>
                          <span>{formatCurrency((result.breakdown.terminalServerCALCost || 0) + (result.breakdown.duoSecurityCost || 0), result.currency)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="detail-divider"></div>
                <div className="detail-row total">
                  <span className="detail-label">Total {result.billingPeriod === 'monthly' ? 'mensuel' : 'annuel'}:</span>
                  <span className="detail-value">
                    {formatCurrency(result.total, result.currency)}
                  </span>
                </div>

                {result.additionalFees.onboarding && result.additionalFees.onboarding > 0 && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="detail-row onboarding-fee">
                      <span className="detail-label">Frais de prise en charge:</span>
                      <span className="detail-value">
                        {formatCurrency(result.additionalFees.onboarding, result.currency)}
                      </span>
                    </div>
                  </>
                )}

                {result.additionalFees.setup && result.additionalFees.setup > 0 && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="detail-row setup-fee">
                      <span className="detail-label">Frais d'installation (unique):</span>
                      <span className="detail-value">
                        {formatCurrency(result.additionalFees.setup, result.currency)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="result-actions">
                <button onClick={handleExport} className="btn btn-export">
                  📥 Exporter la soumission
                </button>
                <button onClick={handlePrint} className="btn btn-print">
                  🖨️ Imprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

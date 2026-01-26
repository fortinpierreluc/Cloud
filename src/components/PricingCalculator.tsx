import { useState } from 'react';
import { CloudPricingConfig, CalculationResult } from '../types';
import { calculateCost, formatCurrency } from '../utils/pricingCalculator';
import jsPDF from 'jspdf';
import datadisLogo from '../assets/Datadis.png';
import bzLogo from '../../Public/Logobz-gros.png';
import './PricingCalculator.css';

interface PricingCalculatorProps {
  config: CloudPricingConfig;
}

type Language = 'en' | 'fr';

interface Translations {
  header: {
    title: string;
    subtitle: string;
    whyBzButton: string;
  };
  modal: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroContent: string;
    qualityTitle: string;
    qualityIntro: string;
    qualityFeatures: string[];
    serviceTitle: string;
    serviceIntro: string;
    serviceFeatures: string[];
    priceTitle: string;
    priceIntro: string;
    datacenterBzTitle: string;
    datacenterBzContent: string;
    datacenterOricomTitle: string;
    datacenterOricomContent: string;
    closeButton: string;
  };
  input: {
    label: string;
    placeholder: string;
    minimum: string;
    maximum: string;
    calculateButton: string;
  };
  errors: {
    minUsers: string;
    maxUsers: string;
    cannotCalculate: string;
  };
  results: {
    title: string;
    users: string;
    user: string;
    vmConfigTitle: string;
    mainServer: string;
    mainServerFull: string;
    terminalServers: string;
    totalVMs: string;
    costDetailsTitle: string;
    monthly: string;
    annual: string;
    userLicenses: string;
    database: string;
    gateways: string;
    supportAccess: string;
    supportAccessTitle: string;
    cloudResources: string;
    virtualMachines: string;
    processors: string;
    ramProvisioned: string;
    diskSpace: string;
    subtotalResources: string;
    licenses: string;
    calTerminalServer: string;
    duoSecurity: string;
    subtotalLicenses: string;
    total: string;
    onboardingFee: string;
    setupFee: string;
    setupFeeUnique: string;
    disclaimer: string;
    exportButton: string;
    printButton: string;
    exportDate: string;
  };
  pdf: {
    title: string;
    exportDate: string;
    infoSection: string;
    numberOfUsers: string;
    billingPeriod: string;
    vmConfigSection: string;
    mainServer: string;
    usersOnMainServer: string;
    terminalServers: string;
    totalVMs: string;
    cloudResourcesSection: string;
    virtualMachines: string;
    processors: string;
    ramProvisioned: string;
    diskSpace: string;
    subtotalResources: string;
    licensesSection: string;
    calTerminalServer: string;
    duoSecurity: string;
    subtotalLicenses: string;
    supportAccessSection: string;
    supportAccessMin: string;
    setupFeesSection: string;
    setupFee: string;
    onboardingFee: string;
    totalMonthly: string;
    totalAnnual: string;
    monthly: string;
    annual: string;
    disclaimer: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    header: {
      title: 'Datacloudis',
      subtitle: 'Estimate the cost of your solution!',
      whyBzButton: 'Why BZ Cloud?',
    },
    modal: {
      title: 'BZ Private Cloud',
      subtitle: 'Excellence in cloud infrastructure - Unbeatable quality/price ratio',
      heroTitle: 'Our Private Cloud: Our Pride',
      heroContent: 'BZ inc.\'s private cloud offers an excellent quality/price ratio with very high quality standards and a human service that makes cloud computing accessible and highly appreciated by various types of businesses and organizations.',
      qualityTitle: 'High Quality Standards',
      qualityIntro: 'Our standards are very high and meet our clients\' needs with excellence.',
      qualityFeatures: [
        'Robust and redundant infrastructure',
        'Two geographically separated data centers',
        'Multiple batteries and controlled air conditioning',
        'Proactive monitoring and maintenance',
      ],
      serviceTitle: 'Exceptional Human Service',
      serviceIntro: 'It\'s our human service that makes all the difference. Responsive, personalized, and dedicated support. This is what makes our private cloud highly appreciated by clients in Quebec and Canada.',
      serviceFeatures: [
        'Responsive and personalized support',
        'Dedicated accompaniment',
        'Long-term trust relationship',
      ],
      priceTitle: 'Unbeatable Quality/Price Ratio',
      priceIntro: 'Our private cloud offers an excellent quality/price ratio. We offer two formulas adapted to needs: Dedicated Environment for total control, and Shared Environment for an economical solution. In all cases, you benefit from our quality standards and exceptional human service.',
      datacenterBzTitle: 'BZ Data Center',
      datacenterBzContent: 'Our data center at BZ inc. premises offers complete infrastructure with all our quality and redundancy standards.',
      datacenterOricomTitle: 'Oricom Data Center (Serco)',
      datacenterOricomContent: 'Our second data center at Oricom, Serco room, offers geographic redundancy and high availability with the same quality standards.',
      closeButton: 'Close',
    },
    input: {
      label: 'Number of users',
      placeholder: 'Enter here',
      minimum: 'Minimum',
      maximum: 'Maximum',
      calculateButton: 'Calculate 💰',
    },
    errors: {
      minUsers: 'The minimum number of users is',
      maxUsers: 'The maximum number of users is',
      cannotCalculate: 'Unable to calculate the cost for this number of users',
    },
    results: {
      title: 'Calculation Result',
      users: 'users',
      user: 'user',
      vmConfigTitle: 'Virtual Server Configuration',
      mainServer: 'Main server (MIR-RT + Database):',
      mainServerFull: 'Main server (MIR-RT + Database + Terminal Server):',
      terminalServers: 'Additional Terminal Servers:',
      totalVMs: 'Total VMs:',
      costDetailsTitle: 'Cost Details',
      monthly: 'monthly',
      annual: 'annual',
      userLicenses: 'User licenses:',
      database: 'Database:',
      gateways: 'Gateways:',
      supportAccess: 'Technical support access:',
      supportAccessTitle: 'TECHNICAL SUPPORT ACCESS',
      cloudResources: 'CLOUD RESOURCES',
      virtualMachines: 'Virtual machines',
      processors: 'Processors',
      ramProvisioned: 'Provisioned RAM',
      diskSpace: 'Provisioned Disk Space',
      subtotalResources: 'Subtotal - Cloud Resources:',
      licenses: 'LICENSES',
      calTerminalServer: 'Terminal Server CAL',
      duoSecurity: 'Duo Security Two-Factor Authentication',
      subtotalLicenses: 'Subtotal - Licenses:',
      total: 'Total',
      onboardingFee: 'Onboarding fee:',
      setupFee: 'Setup fee:',
      setupFeeUnique: 'Setup fee (one-time):',
      disclaimer: 'These prices are an estimate. An evaluation by a BZ cloud expert will be necessary to confirm the resources needed for the proper functioning of your application.',
      exportButton: '📥 Export Quote',
      printButton: '🖨️ Print',
      exportDate: 'Export date and time:',
    },
    pdf: {
      title: 'MIR-RT CLOUD HOSTING QUOTE',
      exportDate: 'Export date and time:',
      infoSection: 'INFORMATION',
      numberOfUsers: 'Number of users:',
      billingPeriod: 'Billing period:',
      vmConfigSection: 'VIRTUAL SERVER CONFIGURATION',
      mainServer: 'Main server (MIR-RT + Database):',
      usersOnMainServer: '  - Users on main server:',
      terminalServers: 'Terminal Servers:',
      totalVMs: 'Total VMs:',
      cloudResourcesSection: 'CLOUD RESOURCES',
      virtualMachines: 'Virtual machines',
      processors: 'Processors',
      ramProvisioned: 'Provisioned RAM',
      diskSpace: 'Provisioned Disk Space',
      subtotalResources: 'Subtotal - Cloud Resources:',
      licensesSection: 'LICENSES',
      calTerminalServer: 'Terminal Server CAL',
      duoSecurity: 'Duo Security Two-Factor Authentication',
      subtotalLicenses: 'Subtotal - Licenses:',
      supportAccessSection: 'TECHNICAL SUPPORT ACCESS',
      supportAccessMin: 'Technical support access (minimum $100):',
      setupFeesSection: 'ONE-TIME FEES',
      setupFee: 'Setup fee:',
      onboardingFee: 'Onboarding fee:',
      totalMonthly: 'MONTHLY TOTAL:',
      totalAnnual: 'ANNUAL TOTAL:',
      monthly: 'Monthly',
      annual: 'Annual',
      disclaimer: 'These prices are an estimate. An evaluation by a BZ cloud expert will be necessary to confirm the resources needed for the proper functioning of your application.',
    },
  },
  fr: {
    header: {
      title: 'Datacloudis',
      subtitle: 'Estimez le coût de votre solution !',
      whyBzButton: 'Pourquoi le Cloud de BZ ?',
    },
    modal: {
      title: 'Cloud Privé BZ',
      subtitle: 'Excellence en infrastructure cloud - Rapport qualité/prix incomparable',
      heroTitle: 'Notre Cloud Privé : Notre Fierté',
      heroContent: 'Le cloud privé de BZ inc. offre un excellent rapport qualité/prix avec des standards de qualité très élevés et un service humain qui rend l\'infonuagique accessible et très appréciée de plusieurs types d\'entreprises et d\'organisations.',
      qualityTitle: 'Standards de Qualité Élevés',
      qualityIntro: 'Nos standards sont très élevés et répondent aux besoins de nos clients avec excellence.',
      qualityFeatures: [
        'Infrastructure robuste et redondante',
        'Deux centres de données géographiquement séparés',
        'Batteries multiples et climatisation contrôlée',
        'Monitoring et maintenance proactive',
      ],
      serviceTitle: 'Service Humain Exceptionnel',
      serviceIntro: 'C\'est notre service humain qui fait toute la différence. Support réactif, personnalisé, et dédié. C\'est ce qui rend notre cloud privé très apprécié des clients du Québec et du Canada.',
      serviceFeatures: [
        'Support réactif et personnalisé',
        'Accompagnement dédié',
        'Relation de confiance à long terme',
      ],
      priceTitle: 'Rapport Qualité/Prix Incomparable',
      priceIntro: 'Notre cloud privé offre un excellent rapport qualité/prix. Nous offrons deux formules adaptées aux besoins : Environnement dédié pour le contrôle total, et Environnement Partagé pour une solution économique. Dans tous les cas, vous bénéficiez de nos standards de qualité et de notre service humain exceptionnel.',
      datacenterBzTitle: 'Centre de Données BZ',
      datacenterBzContent: 'Notre centre de données dans les locaux de BZ inc. offre une infrastructure complète avec tous nos standards de qualité et redondance.',
      datacenterOricomTitle: 'Centre de Données Oricom (Serco)',
      datacenterOricomContent: 'Notre deuxième centre de données chez Oricom, salle Serco, offre redondance géographique et haute disponibilité avec les mêmes standards de qualité.',
      closeButton: 'Fermer',
    },
    input: {
      label: 'Nombre d\'usagers',
      placeholder: 'Entrer ici',
      minimum: 'Minimum',
      maximum: 'Maximum',
      calculateButton: 'Calculer 💰',
    },
    errors: {
      minUsers: 'Le nombre minimum d\'usagers est de',
      maxUsers: 'Le nombre maximum d\'usagers est de',
      cannotCalculate: 'Impossible de calculer le coût pour ce nombre d\'usagers',
    },
    results: {
      title: 'Résultat du calcul',
      users: 'usagers',
      user: 'usager',
      vmConfigTitle: 'Configuration des serveurs virtuels',
      mainServer: 'Serveur principal (MIR-RT + Base de données):',
      mainServerFull: 'Serveur principal (MIR-RT + Base de données + Terminal Server):',
      terminalServers: 'Terminal Servers supplémentaires:',
      totalVMs: 'Total de VMs:',
      costDetailsTitle: 'Détail des coûts',
      monthly: 'mensuel',
      annual: 'annuel',
      userLicenses: 'Licences utilisateurs:',
      database: 'Base de données:',
      gateways: 'Passerelles:',
      supportAccess: 'Accès au soutien technique:',
      supportAccessTitle: 'ACCÈS AU SOUTIEN TECHNIQUE',
      cloudResources: 'RESSOURCES INFONUAGIQUE',
      virtualMachines: 'Machines virtuelles',
      processors: 'Processeurs',
      ramProvisioned: 'RAM Provisionné',
      diskSpace: 'Espace disque Provisionné',
      subtotalResources: 'Sous-total - Ressources Infonuagique:',
      licenses: 'LICENCES',
      calTerminalServer: 'CAL Terminal Serveur',
      duoSecurity: 'Double authentification Duo Security',
      subtotalLicenses: 'Sous-total - Licences:',
      total: 'Total',
      onboardingFee: 'Frais de prise en charge:',
      setupFee: 'Frais d\'installation:',
      setupFeeUnique: 'Frais d\'installation (unique):',
      disclaimer: 'Ces prix se veulent une estimation. Une évaluation d\'un expert en infonuagique de BZ sera nécessaire pour confirmer les ressources nécessaires au bon fonctionnement de votre application.',
      exportButton: '📥 Exporter la soumission',
      printButton: '🖨️ Imprimer',
      exportDate: 'Date et heure d\'exportation:',
    },
    pdf: {
      title: 'SOUMISSION D\'HÉBERGEMENT CLOUD MIR-RT',
      exportDate: 'Date et heure d\'exportation:',
      infoSection: 'INFORMATIONS',
      numberOfUsers: 'Nombre d\'usagers:',
      billingPeriod: 'Période de facturation:',
      vmConfigSection: 'CONFIGURATION DES SERVEURS VIRTUELS',
      mainServer: 'Serveur principal (MIR-RT + Base de données):',
      usersOnMainServer: '  - Usagers sur le serveur principal:',
      terminalServers: 'Terminal Servers:',
      totalVMs: 'Total de VMs:',
      cloudResourcesSection: 'RESSOURCES INFONUAGIQUE',
      virtualMachines: 'Machines virtuelles',
      processors: 'Processeurs',
      ramProvisioned: 'RAM Provisionné',
      diskSpace: 'Espace disque Provisionné',
      subtotalResources: 'Sous-total - Ressources Infonuagique:',
      licensesSection: 'LICENCES',
      calTerminalServer: 'CAL Terminal Serveur',
      duoSecurity: 'Double authentification Duo Security',
      subtotalLicenses: 'Sous-total - Licences:',
      supportAccessSection: 'ACCÈS AU SOUTIEN TECHNIQUE',
      supportAccessMin: 'Accès au soutien technique (minimum 100 $):',
      setupFeesSection: 'FRAIS UNIQUES',
      setupFee: 'Frais d\'installation:',
      onboardingFee: 'Frais de prise en charge:',
      totalMonthly: 'TOTAL MENSUEL:',
      totalAnnual: 'TOTAL ANNUEL:',
      monthly: 'Mensuel',
      annual: 'Annuel',
      disclaimer: 'Ces prix se veulent une estimation. Une évaluation d\'un expert en infonuagique de BZ sera nécessaire pour confirmer les ressources nécessaires au bon fonctionnement de votre application.',
    },
  },
};

export default function PricingCalculator({ config }: PricingCalculatorProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [numberOfUsers, setNumberOfUsers] = useState<number | ''>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const t = translations[language];

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
        setError(`${t.errors.minUsers} ${config.prerequisites.minUsers}`);
      } else if (config.prerequisites?.maxUsers && numUsers > config.prerequisites.maxUsers) {
        setError(`${t.errors.maxUsers} ${config.prerequisites.maxUsers}`);
      } else {
        setError(t.errors.cannotCalculate);
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
    const locale = language === 'fr' ? 'fr-CA' : 'en-CA';
    const exportData = {
      date: now.toLocaleDateString(locale),
      dateTime: now.toLocaleString(locale, { 
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
        : language === 'fr' ? 'Inclus' : 'Included',
      coutPasserelles: result.breakdown.gatewayCost > 0
        ? formatCurrency(result.breakdown.gatewayCost, result.currency)
        : 'N/A',
      fraisSupport: result.breakdown.additionalCosts > 0
        ? formatCurrency(result.breakdown.additionalCosts, result.currency)
        : language === 'fr' ? 'Inclus' : 'Included',
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
      periode: result.billingPeriod === 'monthly' ? t.pdf.monthly : t.pdf.annual,
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
    doc.text(t.pdf.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date et heure d'exportation
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.pdf.exportDate} ${exportData.dateTime}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Section INFORMATIONS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.infoSection, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.pdf.numberOfUsers} ${exportData.nombreUsagers}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`${t.pdf.billingPeriod} ${exportData.periode}`, margin + 5, yPosition);
    yPosition += 12;

    // Section CONFIGURATION DES SERVEURS VIRTUELS
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.vmConfigSection, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.pdf.mainServer} ${exportData.vmServeurPrincipal} VM`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`${t.pdf.usersOnMainServer} ${exportData.usagersSurServeurPrincipal}`, margin + 5, yPosition);
    yPosition += 7;
    if (exportData.vmTerminalServers > 0) {
      doc.text(`${t.pdf.terminalServers} ${exportData.vmTerminalServers} VM(s)`, margin + 5, yPosition);
      yPosition += 7;
    }
    doc.text(`${t.pdf.totalVMs} ${exportData.totalVMs}`, margin + 5, yPosition);
    yPosition += 12;

    // Section RESSOURCES INFONUAGIQUE (selon la grille Couts.pdf)
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdf.cloudResourcesSection, margin, yPosition);
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

    doc.text(`${t.pdf.virtualMachines} (${nbVMs} VM × ${formatCurrency(config.costs.vmBaseCost, result.currency)}): ${formatCurrency(totalVMBase, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`${t.pdf.processors} (${nbCPUs} × ${formatCurrency(config.costs.cpuCost, result.currency)}): ${formatCurrency(totalCPUs, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`${t.pdf.ramProvisioned} (${ramGB.toFixed(1)} Go × ${formatCurrency(config.costs.ramCostPerGB, result.currency)}): ${formatCurrency(totalRAM, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.text(`${t.pdf.diskSpace} (${diskGB} Go × ${formatCurrency(config.costs.diskCostPerGB, result.currency)}): ${formatCurrency(totalDisk, result.currency)}`, margin + 5, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.pdf.subtotalResources} ${formatCurrency(subtotalResources, result.currency)}`, margin + 5, yPosition);
    yPosition += 12;

    // Section LICENCES
    if (result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.pdf.licensesSection, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Licences SPLA
      if (result.breakdown.terminalServerCALCost > 0) {
        doc.text(`${t.pdf.calTerminalServer} (${result.numberOfUsers} CAL × ${formatCurrency(config.costs.terminalServerCALCost, result.currency)}): ${formatCurrency(result.breakdown.terminalServerCALCost, result.currency)}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      // Double authentification Duo Security
      if (result.breakdown.duoSecurityCost > 0) {
        doc.text(`${t.pdf.duoSecurity} (${result.numberOfUsers} ${language === 'fr' ? 'utilisateurs' : 'users'} × ${formatCurrency(config.costs.duoSecurityCost, result.currency)}): ${formatCurrency(result.breakdown.duoSecurityCost, result.currency)}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      // Sous-total des licences
      if (result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) {
        const totalLicenses = (result.breakdown.terminalServerCALCost || 0) + (result.breakdown.duoSecurityCost || 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.pdf.subtotalLicenses} ${formatCurrency(totalLicenses, result.currency)}`, margin + 5, yPosition);
        yPosition += 12;
      }
    }

    // Section ACCÈS AU SOUTIEN TECHNIQUE
    if (result.additionalFees.supportAccess && result.additionalFees.supportAccess > 0) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.pdf.supportAccessSection, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const supportDescription = result.numberOfUsers * 10 >= 100
        ? `${t.results.supportAccess} (${result.numberOfUsers} ${language === 'fr' ? 'utilisateurs' : 'users'} × 10 $):`
        : t.pdf.supportAccessMin;
      doc.text(`${supportDescription} ${formatCurrency(result.additionalFees.supportAccess, result.currency)}`, margin + 5, yPosition);
      yPosition += 12;
    }

    // Section FRAIS UNIQUES (seulement pour frais d'installation)
    if (exportData.fraisInstallation !== 'N/A') {
      checkPageBreak(20);
      yPosition += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.pdf.setupFeesSection, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.pdf.setupFee} ${exportData.fraisInstallation}`, margin + 5, yPosition);
      yPosition += 12;
    }

    // Total général
    checkPageBreak(15);
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const totalLabel = result.billingPeriod === 'monthly' ? t.pdf.totalMonthly : t.pdf.totalAnnual;
    doc.text(`${totalLabel} ${exportData.total}`, pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Remettre la couleur noire
    yPosition += 12;

    // Section FRAIS UNIQUES
    if (exportData.fraisInstallation !== 'N/A' || exportData.fraisPriseEnCharge !== 'N/A') {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.pdf.setupFeesSection, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (exportData.fraisInstallation !== 'N/A') {
        doc.text(`${t.pdf.setupFee} ${exportData.fraisInstallation}`, margin + 5, yPosition);
        yPosition += 7;
      }
      if (exportData.fraisPriseEnCharge !== 'N/A') {
        doc.text(`${t.pdf.onboardingFee} ${exportData.fraisPriseEnCharge}`, margin + 5, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    // Disclaimer
    checkPageBreak(25);
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100); // Gris
    const disclaimerText = t.pdf.disclaimer;
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
    doc.text(splitDisclaimer, margin, yPosition);
    doc.setTextColor(0, 0, 0); // Remettre la couleur noire

    // Sauvegarder le PDF
    const filePrefix = language === 'fr' ? 'soumission-mirrt' : 'quote-mirrt';
    const userLabel = language === 'fr' ? 'usagers' : 'users';
    const fileName = `${filePrefix}-${exportData.nombreUsagers}-${userLabel}-${exportData.date.replace(/\//g, '-')}.pdf`;
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
        <div className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}>
          <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>
            EN
          </span>
          <span className={`lang-option ${language === 'fr' ? 'active' : ''}`}>
            FR
          </span>
          <div className={`toggle-slider ${language === 'fr' ? 'fr' : 'en'}`}></div>
        </div>
        <h1>{t.header.title}</h1>
        <p className="subtitle">{t.header.subtitle}</p>
        <img src={datadisLogo} alt="Datadis" className="header-logo" />
        <button 
          className="info-button"
          onClick={() => setShowInfo(true)}
        >
          {t.header.whyBzButton}
        </button>
        
        {showInfo && (
          <>
            <div className="modal-overlay" onClick={() => setShowInfo(false)}></div>
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-icon">
                  <img src={bzLogo} alt="Logo BZ" className="modal-logo" />
                </div>
                <div className="modal-title-section">
                  <div>
                    <h2 className="modal-title">{t.modal.title}</h2>
                    <p className="modal-subtitle">{t.modal.subtitle}</p>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setShowInfo(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="hero-section">
                  <h3>{t.modal.heroTitle}</h3>
                  <p dangerouslySetInnerHTML={{ __html: t.modal.heroContent }} />
                </div>

                <div className="features-grid-top">
                  <div className="feature-card">
                    <div className="feature-header">
                      <span className="feature-icon">🏆</span>
                      <h4>{t.modal.qualityTitle}</h4>
                    </div>
                    <p className="feature-intro" dangerouslySetInnerHTML={{ __html: t.modal.qualityIntro }} />
                    <ul className="feature-list">
                      {t.modal.qualityFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feature-card">
                    <div className="feature-header">
                      <span className="feature-icon">👥</span>
                      <h4>{t.modal.serviceTitle}</h4>
                    </div>
                    <p className="feature-intro" dangerouslySetInnerHTML={{ __html: t.modal.serviceIntro }} />
                    <ul className="feature-list">
                      {t.modal.serviceFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="feature-card feature-card-full">
                  <div className="feature-header">
                    <span className="feature-icon">💰</span>
                    <h4>{t.modal.priceTitle}</h4>
                  </div>
                  <p className="feature-intro" dangerouslySetInnerHTML={{ __html: t.modal.priceIntro }} />
                </div>

                <div className="datacenters-section">
                  <div className="datacenter-card">
                    <div className="feature-header">
                      <span className="feature-icon">🏢</span>
                      <h4>{t.modal.datacenterBzTitle}</h4>
                    </div>
                    <p>{t.modal.datacenterBzContent}</p>
                  </div>

                  <div className="datacenter-card">
                    <div className="feature-header">
                      <span className="feature-icon">🌐</span>
                      <h4>{t.modal.datacenterOricomTitle}</h4>
                    </div>
                    <p>{t.modal.datacenterOricomContent}</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-close-button" onClick={() => setShowInfo(false)}>
                  {t.modal.closeButton}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="calculator-content">
        <div className="input-section">
          <label htmlFor="numberOfUsers">
            {t.input.label}
            {config.prerequisites?.minUsers && (
              <span className="hint">
                ({t.input.minimum}: {config.prerequisites.minUsers}
                {config.prerequisites?.maxUsers && `, ${t.input.maximum}: ${config.prerequisites.maxUsers}`})
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
            placeholder={t.input.placeholder}
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
              <>{t.input.calculateButton}</>
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
              {t.results.exportDate} {new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="result-card">
              <div className="result-header">
                <h2>{t.results.title}</h2>
                <div className="result-badge">
                  {result.numberOfUsers} {result.numberOfUsers === 1 ? t.results.user : t.results.users}
                </div>
              </div>

              {/* Configuration des VMs */}
              <div className="vm-configuration">
                <h3>{t.results.vmConfigTitle}</h3>
                <div className="vm-details">
                  {result.vmConfiguration.terminalServerCount === 0 ? (
                    <div className="vm-item">
                      <span className="vm-label">{t.results.mainServerFull}</span>
                      <span className="vm-value">{result.vmConfiguration.mainServerCount} VM</span>
                      <span className="vm-users">({result.vmConfiguration.usersOnMainServer} {result.vmConfiguration.usersOnMainServer === 1 ? t.results.user : t.results.users})</span>
                    </div>
                  ) : (
                    <>
                      <div className="vm-item">
                        <span className="vm-label">{t.results.mainServerFull}</span>
                        <span className="vm-value">{result.vmConfiguration.mainServerCount} VM</span>
                        <span className="vm-users">({result.vmConfiguration.usersOnMainServer} {result.vmConfiguration.usersOnMainServer === 1 ? t.results.user : t.results.users})</span>
                      </div>
                      <div className="vm-item">
                        <span className="vm-label">{t.results.terminalServers}</span>
                        <span className="vm-value">{result.vmConfiguration.terminalServerCount} VM(s)</span>
                        <span className="vm-users">
                          {result.vmConfiguration.terminalServerCount === 1 
                            ? `(${Math.round(result.vmConfiguration.usersPerTerminalServer)} ${Math.round(result.vmConfiguration.usersPerTerminalServer) === 1 ? t.results.user : t.results.users})`
                            : `(~${Math.round(result.vmConfiguration.usersPerTerminalServer)} ${t.results.users}/VM)`
                          }
                        </span>
                      </div>
                    </>
                  )}
                  <div className="vm-item total-vms">
                    <span className="vm-label">{t.results.totalVMs}</span>
                    <span className="vm-value">{result.vmConfiguration.totalVMs}</span>
                  </div>
                </div>
              </div>

              <div className="result-details">
                <h3>{t.results.costDetailsTitle} ({result.billingPeriod === 'monthly' ? t.results.monthly : t.results.annual})</h3>

                {result.breakdown.userLicensesCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">{t.results.userLicenses}</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.userLicensesCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.breakdown.databaseCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">{t.results.database}</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.databaseCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.breakdown.gatewayCost > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">{t.results.gateways}</span>
                    <span className="detail-value">
                      {formatCurrency(result.breakdown.gatewayCost, result.currency)}
                    </span>
                  </div>
                )}

                {result.additionalFees.supportAccess && result.additionalFees.supportAccess > 0 && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="resources-detail">
                      <h4>{t.results.supportAccessTitle}</h4>
                      <div className="resource-item">
                        <span>{t.results.supportAccess}</span>
                        <span>{formatCurrency(result.additionalFees.supportAccess, result.currency)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* RESSOURCES INFONUAGIQUE (selon la grille Couts.pdf) */}
                <div className="detail-divider"></div>
                <div className="resources-detail">
                  <h4>{t.results.cloudResources}</h4>
                  
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
                          <span>{t.results.virtualMachines} ({nbVMs} VM × {formatCurrency(config.costs.vmBaseCost, result.currency)}):</span>
                          <span>{formatCurrency(totalVMBase, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>{t.results.processors} ({nbCPUs} × {formatCurrency(config.costs.cpuCost, result.currency)}):</span>
                          <span>{formatCurrency(totalCPUs, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>{t.results.ramProvisioned} ({ramGB.toFixed(1)} Go × {formatCurrency(config.costs.ramCostPerGB, result.currency)}):</span>
                          <span>{formatCurrency(totalRAM, result.currency)}</span>
                        </div>
                        <div className="resource-item">
                          <span>{t.results.diskSpace} ({diskGB} Go × {formatCurrency(config.costs.diskCostPerGB, result.currency)}):</span>
                          <span>{formatCurrency(totalDisk, result.currency)}</span>
                        </div>
                        <div className="resource-item resource-total">
                          <span>{t.results.subtotalResources}</span>
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
                      <h4>{t.results.licenses}</h4>
                      
                      {/* Licences SPLA */}
                      {result.breakdown.terminalServerCALCost > 0 && (
                        <div className="resource-item">
                          <span>{t.results.calTerminalServer} ({result.numberOfUsers} CAL × {formatCurrency(config.costs.terminalServerCALCost, result.currency)}):</span>
                          <span>{formatCurrency(result.breakdown.terminalServerCALCost, result.currency)}</span>
                        </div>
                      )}
                      
                      {/* Double authentification Duo Security */}
                      {result.breakdown.duoSecurityCost > 0 && (
                        <div className="resource-item">
                          <span>{t.results.duoSecurity} ({result.numberOfUsers} {result.numberOfUsers === 1 ? t.results.user : t.results.users} × {formatCurrency(config.costs.duoSecurityCost, result.currency)}):</span>
                          <span>{formatCurrency(result.breakdown.duoSecurityCost, result.currency)}</span>
                        </div>
                      )}
                      
                      {/* Sous-total des licences */}
                      {(result.breakdown.terminalServerCALCost > 0 || result.breakdown.duoSecurityCost > 0) && (
                        <div className="resource-item resource-total">
                          <span>{t.results.subtotalLicenses}</span>
                          <span>{formatCurrency((result.breakdown.terminalServerCALCost || 0) + (result.breakdown.duoSecurityCost || 0), result.currency)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="detail-divider"></div>
                <div className="detail-row total">
                  <span className="detail-label">{t.results.total} {result.billingPeriod === 'monthly' ? t.results.monthly : t.results.annual}:</span>
                  <span className="detail-value">
                    {formatCurrency(result.total, result.currency)}
                  </span>
                </div>

                {result.additionalFees.onboarding && result.additionalFees.onboarding > 0 && (
                  <>
                    <div className="detail-divider"></div>
                    <div className="detail-row onboarding-fee">
                      <span className="detail-label">{t.results.onboardingFee}</span>
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
                      <span className="detail-label">{t.results.setupFeeUnique}</span>
                      <span className="detail-value">
                        {formatCurrency(result.additionalFees.setup, result.currency)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Disclaimer */}
              <div className="disclaimer-box">
                <p className="disclaimer-text">
                  {t.results.disclaimer}
                </p>
              </div>

              <div className="result-actions">
                <button onClick={handleExport} className="btn btn-export">
                  {t.results.exportButton}
                </button>
                <button onClick={handlePrint} className="btn btn-print">
                  {t.results.printButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

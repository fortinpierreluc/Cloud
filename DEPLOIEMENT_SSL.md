# Guide de résolution du problème de certificat SSL pour datacloudis.bzhosting.ca

## Problème rencontré
Erreur de certificat SSL lors de l'accès à `datacloudis.bzhosting.ca`

## Solutions à appliquer

### 1. Vérification et configuration DNS ✅

**Actions à effectuer dans votre panneau de contrôle bzhosting.ca:**

1. **Vérifier l'enregistrement A:**
   - Assurez-vous que `datacloudis.bzhosting.ca` pointe vers l'adresse IP correcte de votre serveur
   - Type: A
   - Nom: datacloudis
   - Valeur: [Adresse IP du serveur bzhosting]

2. **Vérifier l'enregistrement CNAME (si applicable):**
   - Si vous utilisez un CNAME au lieu d'un A record:
   - Type: CNAME
   - Nom: datacloudis
   - Valeur: [serveur-principal].bzhosting.ca

### 2. Installation/Vérification du certificat SSL ✅

**Dans votre panneau de contrôle bzhosting (cPanel ou équivalent):**

1. Accédez à la section **SSL/TLS** ou **Let's Encrypt SSL**
2. Recherchez `datacloudis.bzhosting.ca` dans la liste des domaines
3. Si le certificat n'existe pas:
   - Cliquez sur **"Installer un certificat SSL gratuit"** ou **"Let's Encrypt"**
   - Sélectionnez `datacloudis.bzhosting.ca`
   - Cliquez sur **"Installer"** ou **"Activer"**

4. Si le certificat existe mais est invalide:
   - Supprimez l'ancien certificat
   - Réinstallez un nouveau certificat Let's Encrypt

### 3. Configuration du serveur web ✅

**Vérifiez que le domaine est bien configuré:**

1. Dans votre hébergement, assurez-vous que:
   - Le domaine `datacloudis.bzhosting.ca` est ajouté comme **domaine principal** ou **sous-domaine**
   - Le **Document Root** pointe vers le bon dossier (probablement `/public_html` ou `/www`)

2. Vérifiez les paramètres suivants:
   - ✅ HTTPS activé
   - ✅ Redirection HTTP vers HTTPS activée
   - ✅ Force SSL activé

### 4. Déploiement de l'application ✅

**Étapes pour déployer correctement:**

1. **Rebuild de l'application:**
   ```bash
   npm run build
   ```

2. **Upload des fichiers:**
   - Uploadez TOUT le contenu du dossier `dist/` (pas le dossier dist lui-même)
   - Les fichiers doivent être à la racine du document root:
     ```
     public_html/
     ├── .htaccess        ← Important!
     ├── index.html
     ├── assets/
     │   ├── *.js
     │   ├── *.css
     │   └── *.png
     └── Datadis.png
     ```

3. **Vérification des permissions:**
   - Fichiers: 644
   - Dossiers: 755
   - .htaccess: 644

### 5. Vérifications à effectuer ✅

**Après avoir appliqué les changements:**

1. **Attendez la propagation DNS (5-30 minutes)**

2. **Testez avec ces outils:**
   - Vérification SSL: https://www.ssllabs.com/ssltest/analyze.html?d=datacloudis.bzhosting.ca
   - Vérification DNS: https://dnschecker.org/#A/datacloudis.bzhosting.ca
   - Test du certificat: https://www.digicert.com/help/

3. **Testez l'accès:**
   - `http://datacloudis.bzhosting.ca` (devrait rediriger vers HTTPS)
   - `https://datacloudis.bzhosting.ca` (devrait fonctionner sans erreur)

### 6. Problèmes courants et solutions 🔧

#### Erreur: "NET::ERR_CERT_COMMON_NAME_INVALID"
**Cause:** Le certificat SSL n'est pas émis pour le bon domaine
**Solution:** Réinstaller le certificat SSL spécifiquement pour `datacloudis.bzhosting.ca`

#### Erreur: "NET::ERR_CERT_AUTHORITY_INVALID"
**Cause:** Le certificat est auto-signé ou non reconnu
**Solution:** Installer un certificat Let's Encrypt via le panneau de contrôle

#### Erreur: "SSL_ERROR_NO_CYPHER_OVERLAP"
**Cause:** Configuration SSL obsolète sur le serveur
**Solution:** Contacter le support bzhosting pour mise à jour de la configuration SSL/TLS

#### Le site ne charge pas (404 ou page blanche)
**Cause:** Fichiers mal placés ou .htaccess manquant
**Solution:** 
- Vérifier que tous les fichiers sont bien uploadés
- Vérifier que le fichier `.htaccess` est présent à la racine

### 7. Contact Support BZ Hosting 📞

Si le problème persiste après avoir appliqué ces solutions, contactez le support bzhosting avec ces informations:

```
Sujet: Problème certificat SSL pour datacloudis.bzhosting.ca

Bonjour,

Je rencontre un problème de certificat SSL pour mon sous-domaine datacloudis.bzhosting.ca.

Erreur rencontrée: [Décrire l'erreur exacte]

Actions déjà effectuées:
- Vérification de la configuration DNS
- Tentative d'installation du certificat Let's Encrypt
- Upload des fichiers de l'application React

Pourriez-vous:
1. Vérifier que le DNS est correctement configuré
2. Installer/renouveler le certificat SSL pour datacloudis.bzhosting.ca
3. Activer la redirection HTTPS automatique

Merci!
```

## Fichiers créés pour vous aider

- ✅ `.htaccess` - Configuration Apache avec redirections HTTPS
- ✅ `dist/.htaccess` - Même configuration dans le dossier de build
- ✅ `vite.config.ts` - Configuration optimisée pour la production

## Prochaines étapes

1. Appliquer les changements DNS et SSL dans votre panneau bzhosting
2. Attendre la propagation (5-30 minutes)
3. Rebuilder l'application: `npm run build`
4. Uploader le contenu de `dist/` sur le serveur
5. Tester l'accès à https://datacloudis.bzhosting.ca

---

**Note importante:** Le problème de certificat SSL se règle principalement côté hébergeur dans le panneau de contrôle. Les fichiers de configuration que j'ai créés vont aider avec les redirections et la sécurité, mais le certificat SSL doit être installé via votre interface bzhosting.






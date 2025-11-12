# Déploiement sur Vercel avec Neon DB - Guide Complet

## 📋 Variables d'environnement à configurer sur Vercel

### 1. **DATABASE_URL** (Neon DB - PostgreSQL)
Copie ton URL Neon DB depuis ton dashboard Neon :
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require&pgbouncer=true
```

⚠️ **Important** : Utilise la version **pooled** (avec `-pooler`) pour Vercel

### 2. **NEXTAUTH_URL**
```
https://ton-domaine.vercel.app
```
⚠️ Remplace par ton URL de production Vercel

### 3. **NEXTAUTH_SECRET**
Génère une clé secrète forte (minimum 32 caractères) :
```bash
openssl rand -base64 32
```
Ou utilise : https://generate-secret.vercel.app/32

Exemple :
```
your-generated-secret-key-here-minimum-32-characters
```

### 4. **RAPIDAPI_KEY**
1. Va sur https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
2. Inscris-toi et copie ta clé API
3. Format : `1234567890abcdef1234567890abcdef`

### 5. **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**
1. Va sur https://cloudinary.com
2. Inscris-toi gratuitement
3. Dashboard → Account Details → Cloud Name
4. Exemple : `dxxxxxxxxx`

### 6. **NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET**
1. Settings → Upload → Add upload preset
2. Mode : **Unsigned** (important !)
3. Nom du preset : `emploirapide` (ou autre)

---

## 🚀 Étapes de déploiement

### Étape 1 : Vérifier ta base de données Neon DB
✅ Si tu utilises déjà Neon DB, récupère ton URL depuis le dashboard Neon.

⚠️ **Important** : Assure-toi d'utiliser la version **pooled** de ton URL Neon (avec `-pooler`) pour éviter les problèmes de connexions sur Vercel.

Format de l'URL pooled :
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require&pgbouncer=true
```

### Étape 2 : Configurer les variables d'environnement
1. Projet Vercel → **Settings** → **Environment Variables**
2. Ajoute chaque variable une par une :
   - `DATABASE_URL` → Ton URL Neon DB (pooled)
   - `NEXTAUTH_URL` → URL de production
   - `NEXTAUTH_SECRET` → Clé générée
   - `RAPIDAPI_KEY` → Ta clé JSearch
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → Ton cloud name
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` → Ton upload preset

3. **Important** : Pour chaque variable, sélectionne :
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Étape 3 : Vérifier package.json
Assure-toi que ton `package.json` contient :
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

### Étape 4 : Déployer
1. Push ton code sur GitHub
2. Vercel détectera automatiquement le push
3. Le build se lancera avec :
   - Installation des dépendances
   - Génération du client Prisma
   - Build de Next.js
4. Après le build, lance les migrations :
   ```bash
   # Via Vercel CLI ou directement dans les logs
   npx prisma migrate deploy
   ```

### Étape 5 : Initialiser la base de données
Après le premier déploiement, exécute les migrations :
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Ou directement depuis Vercel CLI :
```bash
vercel --prod
```

---

## ✅ Checklist finale

- [x] Base de données Neon DB déjà configurée
- [ ] Toutes les variables d'environnement ajoutées sur Vercel
- [ ] Variables sélectionnées pour Production, Preview, Development
- [x] `package.json` contient `postinstall: prisma generate`
- [x] Code pushé sur GitHub
- [ ] Déploiement réussi sur Vercel
- [ ] Migrations Prisma exécutées sur Neon DB
- [ ] Test de l'authentification (signup/signin)
- [ ] Test d'upload d'images (Cloudinary)
- [ ] Test de recherche d'emplois (JSearch API)

---

## 🐛 Résolution de problèmes courants

### Erreur : "PrismaClient is not configured"
**Solution** : Ajoute `postinstall` dans `package.json` :
```json
"postinstall": "prisma generate"
```

### Erreur : "Invalid `prisma.user.findUnique()`"
**Solution** : Exécute les migrations sur Neon DB :
```bash
npx prisma migrate deploy
```

### Erreur : "Can't reach database server"
**Solution** : Vérifie que tu utilises la version **pooled** de l'URL Neon (avec `-pooler`). Vercel a besoin de connection pooling pour gérer les connexions serverless.

### Erreur : "NEXTAUTH_URL not defined"
**Solution** : Vérifie que `NEXTAUTH_URL` est bien configuré avec ton URL de production

### Erreur : "Failed to fetch jobs"
**Solution** : Vérifie que `RAPIDAPI_KEY` est correcte et que tu as des crédits disponibles

### Erreur : "Cloudinary upload failed"
**Solution** :
1. Vérifie que l'upload preset est en mode **Unsigned**
2. Vérifie que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est correct

---

## 📞 Support

Si tu rencontres des problèmes :
1. Vérifie les logs Vercel : Deployments → ... → View Function Logs
2. Vérifie que toutes les variables d'environnement sont correctes
3. Teste en local d'abord avec `.env` avant de déployer

---

## 🎉 Après le déploiement

Ton app sera disponible sur :
- URL principale : `https://ton-app.vercel.app`
- URLs de preview : `https://ton-app-git-branch.vercel.app`

N'oublie pas de mettre à jour `NEXTAUTH_URL` si tu utilises un domaine personnalisé !

# 📦 Nom du projet

Plateforme SaaS de gestion et de partage de documents, pensée pour faciliter la collaboration entre équipes internes et clients, avec une architecture moderne, sécurisée et évolutive.

## 🎯 Objectif du projet

Ce projet vise à fournir une application web permettant :

- La gestion centralisée de documents (principalement des PDF)
- Le partage structuré de fichiers entre équipes et clients
- Une authentification sécurisée des utilisateurs
- Une organisation claire des accès et des contenus
- Une intégration transparente avec Google Drive pour le stockage des documents

L’objectif est de proposer une solution simple à utiliser, robuste techniquement, et facile à maintenir sur le long terme.

## 🧱 Architecture générale

L’application repose sur une stack moderne orientée SaaS :

- **Frontend** : Next.js (React)
- **Backend** : Next.js (API Routes / Server Actions)
- **Authentification** : Supabase Auth
- **Base de données** : Supabase (PostgreSQL)
- **Stockage des fichiers** : Google Drive
- **Gestion des accès** : Rôles et permissions définis côté application
- **Paiements** : Non inclus (hors scope volontairement)

Cette architecture permet une forte cohérence entre le front et le back, tout en limitant la complexité opérationnelle.

## 🔐 Authentification & utilisateurs

L’authentification est entièrement gérée par **Supabase** :

- Inscription et connexion sécurisées
- Gestion des sessions
- Rôles utilisateurs (ex. admin, membre équipe, client)
- Séparation claire des droits d’accès selon le rôle

## 📁 Gestion des documents

Les documents sont stockés sur **Google Drive**, dans une arborescence organisée automatiquement :

- Dossiers par client
- Sous-dossiers par projet ou catégorie
- Accès partagé aux équipes internes et aux clients concernés

L’application agit comme une interface de gestion et de visualisation, sans dupliquer inutilement les fichiers.

## 🗂️ Base de données

La base de données Supabase permet de stocker :

- Les utilisateurs et leurs rôles
- Les métadonnées des documents
- Les relations entre clients, projets et fichiers
- Les permissions d’accès

Les fichiers eux-mêmes ne sont pas stockés en base, uniquement leurs références.

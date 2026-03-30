import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-indigo-600 text-white">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
              <p className="text-indigo-100">Dernière mise à jour : 30 Mars 2026</p>
            </div>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <Lock className="text-indigo-600" size={24} />
              1. Cadre Légal Gabonais
            </h2>
            <p className="text-slate-600 leading-relaxed">
              DevGabon s'engage à protéger la vie privée de ses utilisateurs conformément à la législation gabonaise en vigueur, notamment :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Loi n°001/2011</strong> relative à la protection des données à caractère personnel.</li>
              <li><strong>Loi n°019/2016</strong> relative à la communication audiovisuelle et numérique au Gabon.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <Database className="text-indigo-600" size={24} />
              2. Collecte des Données
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nous collectons les informations suivantes pour assurer le bon fonctionnement du réseau :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Informations de Profil</h4>
                <p className="text-sm text-slate-600">Nom, prénom, email, photo de profil, biographie et liens sociaux.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Données Techniques</h4>
                <p className="text-sm text-slate-600">Adresse IP, type de navigateur et logs d'activité pour la sécurité.</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <Eye className="text-indigo-600" size={24} />
              3. Utilisation des Données
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Personnaliser votre expérience sur la plateforme.</li>
              <li>Faciliter la mise en relation entre professionnels (développeurs, écrivains, recruteurs).</li>
              <li>Assurer la sécurité et la modération des contenus.</li>
              <li>Améliorer nos services via des analyses statistiques anonymisées.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <UserCheck className="text-indigo-600" size={24} />
              4. Vos Droits
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Conformément à la Loi n°001/2011, vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données.
            </p>
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <p className="text-indigo-900 font-medium mb-2">Comment exercer vos droits ?</p>
              <p className="text-indigo-700 text-sm">
                Vous pouvez modifier vos informations directement dans vos paramètres de profil ou nous contacter à l'adresse : <strong>ludo.consulting3@gmail.com</strong>.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Sécurité des Données</h2>
            <p className="text-slate-600 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles rigoureuses pour protéger vos données contre tout accès non autorisé, altération ou destruction.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 DevGabon - Protection des données certifiée conforme aux lois gabonaises.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

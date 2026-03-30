import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, BookOpen, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
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
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Conditions Générales d'Utilisation</h1>
              <p className="text-indigo-100">Dernière mise à jour : 30 Mars 2026</p>
            </div>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <ShieldCheck className="text-indigo-600" size={24} />
              1. Acceptation des Conditions
            </h2>
            <p className="text-slate-600 leading-relaxed">
              En accédant à DevGabon, vous acceptez sans réserve les présentes conditions générales d'utilisation. Ces conditions sont régies par les lois de la République Gabonaise.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <BookOpen className="text-indigo-600" size={24} />
              2. Propriété Intellectuelle et Droits d'Auteur
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              DevGabon accorde une importance capitale au respect de la création intellectuelle, conformément à la <strong>Loi n°1/87</strong> sur la protection du droit d'auteur au Gabon.
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Contenu Utilisateur</h4>
                <p className="text-sm text-slate-600">
                  Vous restez propriétaire de vos publications (articles, code, livres). En publiant sur DevGabon, vous nous accordez une licence non-exclusive pour diffuser votre contenu sur la plateforme.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Protection de la Littérature</h4>
                <p className="text-sm text-slate-600">
                  Toute reproduction non autorisée d'ouvrages littéraires ou de code source protégé est strictement interdite et peut faire l'objet de poursuites judiciaires.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <UserPlus className="text-indigo-600" size={24} />
              3. Inscription et Responsabilité
            </h2>
            <p className="text-slate-600 leading-relaxed">
              L'utilisateur s'engage à fournir des informations exactes lors de son inscription. Vous êtes seul responsable de la confidentialité de votre compte et de toutes les activités qui y sont liées.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4">
              <AlertCircle className="text-indigo-600" size={24} />
              4. Comportement de l'Utilisateur
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Il est strictement interdit de publier des contenus :
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Contraires à l'ordre public et aux bonnes mœurs au Gabon.</li>
              <li>Diffamatoires, injurieux ou incitant à la haine.</li>
              <li>Portant atteinte aux droits de propriété intellectuelle de tiers.</li>
              <li>Contenant des virus ou des logiciels malveillants.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation de Responsabilité</h2>
            <p className="text-slate-600 leading-relaxed">
              DevGabon s'efforce de maintenir la plateforme accessible 24h/24, mais ne saurait être tenue responsable des interruptions de service dues à la maintenance ou à des cas de force majeure.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Litiges et Juridiction</h2>
            <p className="text-slate-600 leading-relaxed">
              Tout litige relatif à l'utilisation de DevGabon sera soumis à la compétence exclusive des tribunaux de Libreville, Gabon.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              © 2026 DevGabon - Conditions conformes aux lois gabonaises sur le numérique et la littérature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

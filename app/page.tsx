import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-light">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              Streaming de qualité
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Votre plateforme de streaming <span className="text-primary">préférée</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              Découvrez, regardez et demandez les films et séries que vous aimez, le tout en un clic, où que vous soyez
              !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/login"
                className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
              >
                Se connecter
              </Link>
              <Link
                href="/login?tab=signup"
                className="px-8 py-3 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                Créer un compte
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 mix-blend-overlay z-10"></div>
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Jekle Entertainment"
                width={800}
                height={600}
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Fonctionnalités exceptionnelles</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Profitez d'une expérience de streaming inégalée avec nos fonctionnalités exclusives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Catalogue riche",
                description: "Accédez à une vaste bibliothèque de films et séries constamment mise à jour",
                icon: "📚",
              },
              {
                title: "Demandes personnalisées",
                description: "Demandez vos films et séries préférés et nous les ajouterons pour vous",
                icon: "🎬",
              },
              {
                title: "Streaming HD",
                description: "Profitez d'une qualité de streaming exceptionnelle sur tous vos appareils",
                icon: "✨",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-background-card p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Prêt à commencer ?</h2>
              <p className="text-text-secondary max-w-xl">
                Rejoignez des milliers d'utilisateurs qui profitent déjà de notre plateforme de streaming
              </p>
            </div>
            <Link
              href="/login?tab=signup"
              className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Créer un compte gratuitement
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background-light border-t border-white/10 py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">J</span>
              </div>
              <span className="text-white font-bold text-xl">Jekle</span>
            </div>
            <div className="text-text-secondary text-sm">
              © {new Date().getFullYear()} Jekle Entertainment. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

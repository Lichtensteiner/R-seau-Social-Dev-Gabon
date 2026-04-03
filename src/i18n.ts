import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "nav": {
        "mission": "Mission",
        "features": "Fonctionnalités",
        "context": "Contexte",
        "creator": "L'Auteur",
        "presentation": "Présentation",
        "login": "Connexion",
        "join": "Rejoindre",
        "access": "Accéder au réseau"
      },
      "hero": {
        "badge": "Le premier réseau social tech du Gabon",
        "title": "Propulsez votre carrière",
        "subtitle": "Tech & Littéraire",
        "description": "Une plateforme unique conçue pour connecter les développeurs, les écrivains et les recruteurs du Gabon. Partagez votre code, publiez vos articles et faites rayonner le talent gabonais.",
        "cta_start": "Commencer l'aventure",
        "cta_learn": "En savoir plus",
        "members": "+500 membres actifs",
        "join_community": "Rejoignez la communauté",
        "recruitment": {
          "title": "Recrutement",
          "subtitle": "Trouvez les meilleurs talents IT du Gabon",
          "description": "Les entreprises peuvent poster des offres et trouver les meilleurs profils IT du Gabon. Un espace dédié pour propulser l'emploi local.",
          "contact_label": "Responsable Recrutement",
          "contact_name": "M. Mve Zogo Ludovic Martinien"
        },
        "network": {
          "title": "Réseau des Talents",
          "subtitle": "Connectez-vous avec les experts IT du Gabon",
          "description": "Accédez à un annuaire complet des développeurs, ingénieurs et créateurs. Échangez, collaborez et bâtissez votre réseau professionnel local.",
          "cta": "Accéder au réseau"
        }
      },
      "footer": {
        "description": "La plateforme sociale qui connecte l'intelligence technologique et la créativité littéraire du Gabon.",
        "quick_links": "Liens Rapides",
        "contact": "Contact",
        "legal": "Légal",
        "privacy": "Confidentialité",
        "terms": "Conditions",
        "developed_by": "Fièrement développé par M. Mve Zogo Ludovic Martinien.",
        "clock": "Heure locale"
      },
      "sidebar": {
        "feed": "Fil d'actualité",
        "network": "Annuaire",
        "jobs": "Opportunités",
        "messages": "Messages",
        "github": "GitHub Explorer",
        "articles": "Articles",
        "library": "Bibliothèque",
        "notifications": "Notifications",
        "profile": "Mon Profil",
        "settings": "Paramètres",
        "presentation": "Présentation",
        "admin": "Administration",
        "install": "Install App",
        "logout": "Déconnexion"
      },
      "feed": {
        "placeholder": "Partagez quelque chose avec la communauté...",
        "publish": "Publier",
        "no_posts": "Aucune publication pour le moment. Soyez le premier !",
        "translate": "Traduire",
        "translating": "Traduction...",
        "write_comment": "Écrire un commentaire...",
        "delete_post_confirm": "Voulez-vous vraiment supprimer ce post ?",
        "delete_comment_confirm": "Voulez-vous vraiment supprimer ce commentaire ?",
        "error_publish": "Erreur lors de la publication."
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "mission": "Mission",
        "features": "Features",
        "context": "Context",
        "creator": "Author",
        "presentation": "Presentation",
        "login": "Login",
        "join": "Join",
        "access": "Access Network"
      },
      "hero": {
        "badge": "Gabon's first tech social network",
        "title": "Boost your career",
        "subtitle": "Tech & Literary",
        "description": "A unique platform designed to connect developers, writers, and recruiters in Gabon. Share your code, publish your articles, and showcase Gabonese talent.",
        "cta_start": "Start the adventure",
        "cta_learn": "Learn more",
        "members": "+500 active members",
        "join_community": "Join the community",
        "recruitment": {
          "title": "Recruitment",
          "subtitle": "Find the best IT talents in Gabon",
          "description": "Companies can post offers and find the best IT profiles in Gabon. A dedicated space to boost local employment.",
          "contact_label": "Recruitment Manager",
          "contact_name": "Mr. Mve Zogo Ludovic Martinien"
        },
        "network": {
          "title": "Talent Network",
          "subtitle": "Connect with Gabon's IT experts",
          "description": "Access a complete directory of developers, engineers, and creators. Exchange, collaborate, and build your local professional network.",
          "cta": "Access Network"
        }
      },
      "footer": {
        "description": "The social platform connecting technological intelligence and literary creativity in Gabon.",
        "quick_links": "Quick Links",
        "contact": "Contact",
        "legal": "Legal",
        "privacy": "Privacy",
        "terms": "Terms",
        "developed_by": "Proudly developed by Mr. Mve Zogo Ludovic Martinien.",
        "clock": "Local time"
      },
      "sidebar": {
        "feed": "News Feed",
        "network": "Directory",
        "jobs": "Opportunities",
        "messages": "Messages",
        "github": "GitHub Explorer",
        "articles": "Articles",
        "library": "Library",
        "notifications": "Notifications",
        "profile": "My Profile",
        "settings": "Settings",
        "presentation": "Presentation",
        "admin": "Administration",
        "install": "Install App",
        "logout": "Logout"
      },
      "feed": {
        "placeholder": "Share something with the community...",
        "publish": "Publish",
        "no_posts": "No posts yet. Be the first!",
        "translate": "Translate",
        "translating": "Translating...",
        "write_comment": "Write a comment...",
        "delete_post_confirm": "Do you really want to delete this post?",
        "delete_comment_confirm": "Do you really want to delete this comment?",
        "error_publish": "Error during publication."
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "mission": "Misión",
        "features": "Funcionalidades",
        "context": "Contexto",
        "creator": "Autor",
        "presentation": "Presentación",
        "login": "Conexión",
        "join": "Unirse",
        "access": "Acceder a la red"
      },
      "hero": {
        "badge": "La primera red social tecnológica de Gabón",
        "title": "Impulsa tu carrera",
        "subtitle": "Tecnológica y Literaria",
        "description": "Una plataforma única diseñada para conectar a desarrolladores, escritores y reclutadores de Gabón. Comparte tu código, publica tus artículos y haz brillar el talento gabonés.",
        "cta_start": "Comenzar la aventura",
        "cta_learn": "Saber más",
        "members": "+500 miembros activos",
        "join_community": "Únete a la comunidad",
        "recruitment": {
          "title": "Reclutamiento",
          "subtitle": "Encuentra los mejores talentos IT de Gabón",
          "description": "Las empresas pueden publicar ofertas y encontrar los mejores perfiles IT de Gabón. Un espacio dedicado para impulsar el empleo local.",
          "contact_label": "Responsable de Reclutamiento",
          "contact_name": "Sr. Mve Zogo Ludovic Martinien"
        },
        "network": {
          "title": "Red de Talentos",
          "subtitle": "Conéctate con los expertos IT de Gabón",
          "description": "Accede a un directorio completo de desarrolladores, ingenieros y creadores. Intercambia, colabora y construye tu red profesional local.",
          "cta": "Acceder a la red"
        }
      },
      "footer": {
        "description": "La plataforma social que conecta la inteligencia tecnológica y la creatividad literaria de Gabón.",
        "quick_links": "Enlaces rápidos",
        "contact": "Contacto",
        "legal": "Legal",
        "privacy": "Privacidad",
        "terms": "Condiciones",
        "developed_by": "Orgullosamente desarrollado por el Sr. Mve Zogo Ludovic Martinien.",
        "clock": "Hora local"
      },
      "sidebar": {
        "feed": "Noticias",
        "network": "Directorio",
        "jobs": "Oportunidades",
        "messages": "Mensajes",
        "github": "Explorador de GitHub",
        "articles": "Artículos",
        "library": "Biblioteca",
        "notifications": "Notificaciones",
        "profile": "Mi perfil",
        "settings": "Ajustes",
        "presentation": "Presentación",
        "admin": "Administración",
        "install": "Instalar aplicación",
        "logout": "Cerrar sesión"
      },
      "feed": {
        "placeholder": "Comparte algo con la comunidad...",
        "publish": "Publicar",
        "no_posts": "No hay publicaciones aún. ¡Sé el primero!",
        "translate": "Traducir",
        "translating": "Traduciendo...",
        "write_comment": "Escribir un comentario...",
        "delete_post_confirm": "¿Realmente quieres eliminar esta publicación?",
        "delete_comment_confirm": "¿Realmente quieres eliminar este comentario?",
        "error_publish": "Error al publicar."
      }
    }
  },
  de: {
    translation: {
      "nav": {
        "mission": "Mission",
        "features": "Funktionen",
        "context": "Kontext",
        "creator": "Autor",
        "presentation": "Präsentation",
        "login": "Anmelden",
        "join": "Beitreten",
        "access": "Zum Netzwerk"
      },
      "hero": {
        "badge": "Gabuns erstes Tech-Social-Network",
        "title": "Beschleunigen Sie Ihre Karriere",
        "subtitle": "Tech & Literatur",
        "description": "Eine einzigartige Plattform, die Entwickler, Autoren und Personalvermittler in Gabun verbindet. Teilen Sie Ihren Code, veröffentlichen Sie Ihre Artikel und lassen Sie das gabunische Talent erstrahlen.",
        "cta_start": "Abenteuer starten",
        "cta_learn": "Mehr erfahren",
        "members": "+500 aktive Mitglieder",
        "join_community": "Treten Sie der Community bei",
        "recruitment": {
          "title": "Recruiting",
          "subtitle": "Finden Sie die besten IT-Talente in Gabun",
          "description": "Unternehmen können Angebote veröffentlichen und die besten IT-Profile in Gabun finden. Ein spezieller Bereich zur Förderung der lokalen Beschäftigung.",
          "contact_label": "Recruiting-Leiter",
          "contact_name": "Hr. Mve Zogo Ludovic Martinien"
        },
        "network": {
          "title": "Talent-Netzwerk",
          "subtitle": "Vernetzen Sie sich mit Gabuns IT-Experten",
          "description": "Greifen Sie auf ein vollständiges Verzeichnis von Entwicklern, Ingenieuren und Kreativen zu. Tauschen Sie sich aus, arbeiten Sie zusammen und bauen Sie Ihr lokales berufliches Netzwerk auf.",
          "cta": "Zum Netzwerk"
        }
      },
      "footer": {
        "description": "Die soziale Plattform, die technologische Intelligenz und literarische Kreativität in Gabun verbindet.",
        "quick_links": "Schnelllinks",
        "contact": "Kontakt",
        "legal": "Rechtliches",
        "privacy": "Datenschutz",
        "terms": "Bedingungen",
        "developed_by": "Stolz entwickelt von Herrn Mve Zogo Ludovic Martinien.",
        "clock": "Ortszeit"
      },
      "sidebar": {
        "feed": "Newsfeed",
        "network": "Verzeichnis",
        "jobs": "Möglichkeiten",
        "messages": "Nachrichten",
        "github": "GitHub Explorer",
        "articles": "Artikel",
        "library": "Bibliothek",
        "notifications": "Benachrichtigungen",
        "profile": "Mein Profil",
        "settings": "Einstellungen",
        "presentation": "Präsentation",
        "admin": "Administration",
        "install": "App installieren",
        "logout": "Abmelden"
      },
      "feed": {
        "placeholder": "Teilen Sie etwas mit der Community...",
        "publish": "Veröffentlichen",
        "no_posts": "Noch keine Beiträge. Sei der Erste!",
        "translate": "Übersetzen",
        "translating": "Übersetzung...",
        "write_comment": "Einen Kommentar schreiben...",
        "delete_post_confirm": "Möchten Sie diesen Beitrag wirklich löschen?",
        "delete_comment_confirm": "Möchten Sie diesen Kommentar wirklich löschen?",
        "error_publish": "Fehler beim Veröffentlichen."
      }
    }
  },
  zh: {
    translation: {
      "nav": {
        "mission": "使命",
        "features": "功能",
        "context": "背景",
        "creator": "作者",
        "presentation": "介绍",
        "login": "登录",
        "join": "加入",
        "access": "进入网络"
      },
      "hero": {
        "badge": "加蓬首个科技社交网络",
        "title": "助推您的职业生涯",
        "subtitle": "科技与文学",
        "description": "一个旨在连接加蓬开发者、作家和招聘者的独特平台。分享您的代码，发表您的文章，展示加蓬的人才。",
        "cta_start": "开始冒险",
        "cta_learn": "了解更多",
        "members": "+500 名活跃成员",
        "join_community": "加入社区",
        "recruitment": {
          "title": "招聘",
          "subtitle": "寻找加蓬最优秀的 IT 人才",
          "description": "企业可以发布职位并寻找加蓬最优秀的 IT 个人资料。一个致力于促进当地就业的专用空间。",
          "contact_label": "招聘经理",
          "contact_name": "Mve Zogo Ludovic Martinien 先生"
        },
        "network": {
          "title": "人才网络",
          "subtitle": "与加蓬的 IT 专家建立联系",
          "description": "访问开发人员、工程师和创作者的完整目录。交流、协作并建立您当地的专业网络。",
          "cta": "进入网络"
        }
      },
      "footer": {
        "description": "连接加蓬技术智慧与文学创造力的社交平台。",
        "quick_links": "快速链接",
        "contact": "联系方式",
        "legal": "法律",
        "privacy": "隐私政策",
        "terms": "服务条款",
        "developed_by": "由 Mve Zogo Ludovic Martinien 先生自豪开发。",
        "clock": "当地时间"
      },
      "sidebar": {
        "feed": "动态",
        "network": "目录",
        "jobs": "机会",
        "messages": "消息",
        "github": "GitHub 浏览器",
        "articles": "文章",
        "library": "图书馆",
        "notifications": "通知",
        "profile": "我的个人资料",
        "settings": "设置",
        "presentation": "介绍",
        "admin": "管理",
        "install": "安装应用",
        "logout": "注销"
      },
      "feed": {
        "placeholder": "与社区分享一些东西...",
        "publish": "发布",
        "no_posts": "暂无发布。成为第一个！",
        "translate": "翻译",
        "translating": "翻译中...",
        "write_comment": "写评论...",
        "delete_post_confirm": "您确定要删除此帖子吗？",
        "delete_comment_confirm": "您确定要删除此评论吗？",
        "error_publish": "发布时出错。"
      }
    }
  },
  ja: {
    translation: {
      "nav": {
        "mission": "ミッション",
        "features": "機能",
        "context": "コンテキスト",
        "creator": "著者",
        "presentation": "プレゼンテーション",
        "login": "ログイン",
        "join": "参加する",
        "access": "ネットワークにアクセス"
      },
      "hero": {
        "badge": "ガボン初のテックソーシャルネットワーク",
        "title": "キャリアを加速させる",
        "subtitle": "テック＆文学",
        "description": "ガボンの開発者、ライター、リクルーターを繋ぐために設計されたユニークなプラットフォーム。コードを共有し、記事を公開し、ガボンの才能を輝かせましょう。",
        "cta_start": "冒険を始める",
        "cta_learn": "詳細を見る",
        "members": "+500人のアクティブメンバー",
        "join_community": "コミュニティに参加",
        "recruitment": {
          "title": "採用",
          "subtitle": "ガボンの最高のITタレントを見つける",
          "description": "企業は求人を投稿し、ガボンの最高のITプロフィールを見つけることができます。地元の雇用を促進するための専用スペース。",
          "contact_label": "採用担当マネージャー",
          "contact_name": "Mve Zogo Ludovic Martinien 氏"
        },
        "network": {
          "title": "タレントネットワーク",
          "subtitle": "ガボンのITエキスパートと繋がる",
          "description": "開発者、エンジニア、クリエイターの完全なディレクトリにアクセス。交流、コラボレーションし、地元のプロフェッショナルネットワークを構築しましょう。",
          "cta": "ネットワークにアクセス"
        }
      },
      "footer": {
        "description": "ガボンの技術的知性と文学的創造性を繋ぐソーシャルプラットフォーム。",
        "quick_links": "クイックリンク",
        "contact": "お問い合わせ",
        "legal": "法的情報",
        "privacy": "プライバシーポリシー",
        "terms": "利用規約",
        "developed_by": "Mve Zogo Ludovic Martinien 氏によって誇りを持って開発されました。",
        "clock": "現地時間"
      },
      "sidebar": {
        "feed": "ニュースフィード",
        "network": "ディレクトリ",
        "jobs": "求人",
        "messages": "メッセージ",
        "github": "GitHub エクスプローラー",
        "articles": "記事",
        "library": "図書館",
        "notifications": "通知",
        "profile": "プロフィール",
        "settings": "設定",
        "presentation": "プレゼンテーション",
        "admin": "管理",
        "install": "アプリをインストール",
        "logout": "ログアウト"
      },
      "feed": {
        "placeholder": "コミュニティと何かを共有しましょう...",
        "publish": "投稿する",
        "no_posts": "まだ投稿はありません。最初の投稿者になりましょう！",
        "translate": "翻訳",
        "translating": "翻訳中...",
        "write_comment": "コメントを書く...",
        "delete_post_confirm": "この投稿を本当に削除しますか？",
        "delete_comment_confirm": "このコメントを本当に削除しますか？",
        "error_publish": "投稿中にエラーが発生しました。"
      }
    }
  },
  ko: {
    translation: {
      "nav": {
        "mission": "미션",
        "features": "기능",
        "context": "배경",
        "creator": "저자",
        "presentation": "소개",
        "login": "로그인",
        "join": "가입하기",
        "access": "네트워크 접속"
      },
      "hero": {
        "badge": "가봉 최초의 테크 소셜 네트워크",
        "title": "당신의 커리어를 추진하세요",
        "subtitle": "테크 및 문학",
        "description": "가봉의 개발자, 작가, 채용 담당자를 연결하기 위해 설계된 독특한 플랫폼입니다. 코드를 공유하고, 기사를 게시하며, 가봉의 인재를 빛내세요.",
        "cta_start": "모험 시작하기",
        "cta_learn": "더 알아보기",
        "members": "+500명 이상의 활성 회원",
        "join_community": "커뮤니티 가입",
        "recruitment": {
          "title": "채용",
          "subtitle": "가봉 최고의 IT 인재 찾기",
          "description": "기업은 채용 공고를 게시하고 가봉 최고의 IT 프로필을 찾을 수 있습니다. 지역 고용을 촉진하기 위한 전용 공간입니다.",
          "contact_label": "채용 관리자",
          "contact_name": "Mve Zogo Ludovic Martinien 씨"
        },
        "network": {
          "title": "인재 네트워크",
          "subtitle": "가봉의 IT 전문가와 연결",
          "description": "개발자, 엔지니어 및 크리에이터의 전체 디렉토리에 액세스하십시오. 교류하고 협력하며 지역 전문 네트워크를 구축하십시오.",
          "cta": "네트워크 접속"
        }
      },
      "footer": {
        "description": "가봉의 기술적 지능과 문학적 창의성을 연결하는 소셜 플랫폼입니다.",
        "quick_links": "빠른 링크",
        "contact": "연락처",
        "legal": "법적 고지",
        "privacy": "개인정보 처리방침",
        "terms": "이용약관",
        "developed_by": "Mve Zogo Ludovic Martinien 씨가 자랑스럽게 개발했습니다.",
        "clock": "현지 시간"
      },
      "sidebar": {
        "feed": "뉴스 피드",
        "network": "디렉토리",
        "jobs": "기회",
        "messages": "메시지",
        "github": "GitHub 탐색기",
        "articles": "기사",
        "library": "도서관",
        "notifications": "알림",
        "profile": "내 프로필",
        "settings": "설정",
        "presentation": "소개",
        "admin": "관리",
        "install": "앱 설치",
        "logout": "로그아웃"
      },
      "feed": {
        "placeholder": "커뮤니티와 무언가를 공유하세요...",
        "publish": "게시",
        "no_posts": "아직 게시물이 없습니다. 첫 번째 게시자가 되어보세요!",
        "translate": "번역",
        "translating": "번역 중...",
        "write_comment": "댓글 쓰기...",
        "delete_post_confirm": "이 게시물을 정말 삭제하시겠습니까?",
        "delete_comment_confirm": "이 댓글을 정말 삭제하시겠습니까?",
        "error_publish": "게시 중 오류가 발생했습니다."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

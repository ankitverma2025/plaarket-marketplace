import { useRouter } from 'next/router';

// Translation data for different languages
const translations = {
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      rfq: 'RFQ',
      sellers: 'Sellers',
      login: 'Login',
      register: 'Register',
    },
    home: {
      title: 'Plaarket - Organic Products Marketplace',
      hero: {
        title: 'Your Trusted Organic Products Marketplace',
        subtitle: 'Connect directly with verified organic farmers and suppliers for both B2B and B2C transactions',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
      },
      features: {
        verified: {
          title: 'Verified Organic Products',
          description: 'All products are verified for organic certification and quality standards.',
        },
        rfq: {
          title: 'B2B RFQ System',
          description: 'Request quotes for bulk orders and connect directly with suppliers.',
        },
        shopping: {
          title: 'Easy B2C Shopping',
          description: 'Simple and secure shopping experience for individual consumers.',
        },
        farmers: {
          title: 'Direct from Farmers',
          description: 'Connect directly with organic farmers and verified suppliers.',
        },
        sustainable: {
          title: 'Sustainable Practices',
          description: 'Supporting environmentally friendly and sustainable farming practices.',
        },
        quality: {
          title: 'Quality Assured',
          description: 'Rigorous quality checks and certification verification process.',
        },
      },
      featuredProducts: 'Featured Products',
      viewAll: 'View All Products',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      products: 'उत्पाद',
      rfq: 'मूल्य-उद्धरण',
      sellers: 'विक्रेता',
      login: 'लॉगिन',
      register: 'रजिस्टर',
    },
    home: {
      title: 'प्लार्केट - जैविक उत्पाद बाजार',
      hero: {
        title: 'आपका विश्वसनीय जैविक उत्पाद बाजार',
        subtitle: 'B2B और B2C लेन-देन के लिए सत्यापित जैविक किसानों और आपूर्तिकर्ताओं से सीधे जुड़ें',
        getStarted: 'शुरू करें',
        learnMore: 'और जानें',
      },
      features: {
        verified: {
          title: 'सत्यापित जैविक उत्पाद',
          description: 'सभी उत्पाद जैविक प्रमाणन और गुणवत्ता मानकों के लिए सत्यापित हैं।',
        },
        rfq: {
          title: 'B2B RFQ सिस्टम',
          description: 'बल्क ऑर्डर के लिए मूल्य-उद्धरण मांगें और आपूर्तिकर्ताओं से सीधे जुड़ें।',
        },
        shopping: {
          title: 'आसान B2C शॉपिंग',
          description: 'व्यक्तिगत उपभोक्ताओं के लिए सरल और सुरक्षित शॉपिंग अनुभव।',
        },
        farmers: {
          title: 'किसानों से सीधे',
          description: 'जैविक किसानों और सत्यापित आपूर्तिकर्ताओं से सीधे जुड़ें।',
        },
        sustainable: {
          title: 'टिकाऊ प्रथाएं',
          description: 'पर्यावरण के अनुकूल और टिकाऊ कृषि प्रथाओं का समर्थन।',
        },
        quality: {
          title: 'गुणवत्ता की गारंटी',
          description: 'कठोर गुणवत्ता जांच और प्रमाणन सत्यापन प्रक्रिया।',
        },
      },
      featuredProducts: 'विशेष उत्पाद',
      viewAll: 'सभी उत्पाद देखें',
    },
  },
  bn: {
    nav: {
      home: 'হোম',
      products: 'পণ্য',
      rfq: 'দরদাম',
      sellers: 'বিক্রেতা',
      login: 'লগইন',
      register: 'নিবন্ধন',
    },
    home: {
      title: 'প্লার্কেট - জৈব পণ্যের বাজার',
      hero: {
        title: 'আপনার বিশ্বস্ত জৈব পণ্যের বাজার',
        subtitle: 'B2B এবং B2C লেনদেনের জন্য যাচাইকৃত জৈব কৃষক এবং সরবরাহকারীদের সাথে সরাসরি সংযুক্ত হন',
        getStarted: 'শুরু করুন',
        learnMore: 'আরও জানুন',
      },
      features: {
        verified: {
          title: 'যাচাইকৃত জৈব পণ্য',
          description: 'সব পণ্য জৈব সার্টিফিকেশন এবং মানের মানদণ্ডের জন্য যাচাইকৃত।',
        },
        rfq: {
          title: 'B2B RFQ সিস্টেম',
          description: 'বাল্ক অর্ডারের জন্য দরদাম চাইুন এবং সরবরাহকারীদের সাথে সরাসরি সংযুক্ত হন।',
        },
        shopping: {
          title: 'সহজ B2C কেনাকাটা',
          description: 'ব্যক্তিগত ভোক্তাদের জন্য সহজ এবং নিরাপদ কেনাকাটার অভিজ্ঞতা।',
        },
        farmers: {
          title: 'কৃষকদের কাছ থেকে সরাসরি',
          description: 'জৈব কৃষক এবং যাচাইকৃত সরবরাহকারীদের সাথে সরাসরি সংযুক্ত হন।',
        },
        sustainable: {
          title: 'টেকসই অনুশীলন',
          description: 'পরিবেশবান্ধব এবং টেকসই কৃষি অনুশীলনের সমর্থন।',
        },
        quality: {
          title: 'মানের নিশ্চয়তা',
          description: 'কঠোর মানের পরীক্ষা এবং সার্টিফিকেশন যাচাইকরণ প্রক্রিয়া।',
        },
      },
      featuredProducts: 'বৈশিষ্ট্যযুক্ত পণ্য',
      viewAll: 'সব পণ্য দেখুন',
    },
  },
  ta: {
    nav: {
      home: 'முகப்பு',
      products: 'பொருட்கள்',
      rfq: 'விலை கோரிக்கை',
      sellers: 'விற்பனையாளர்கள்',
      login: 'உள்நுழைவு',
      register: 'பதிவு',
    },
    home: {
      title: 'பிளார்கெட் - கரிம பொருட்கள் சந்தை',
      hero: {
        title: 'உங்கள் நம்பகமான கரிம பொருட்கள் சந்தை',
        subtitle: 'B2B மற்றும் B2C பரிவர்த்தனைகளுக்கு சரிபார்க்கப்பட்ட கரிம விவசாயிகள் மற்றும் சப்ளையர்களுடன் நேரடியாக இணைக்கவும்',
        getStarted: 'தொடங்கவும்',
        learnMore: 'மேலும் அறியவும்',
      },
      features: {
        verified: {
          title: 'சரிபார்க்கப்பட்ட கரிம பொருட்கள்',
          description: 'அனைத்து பொருட்களும் கரிம சான்றிதழ் மற்றும் தர மதிப்பீடுகளுக்காக சரிபார்க்கப்பட்டுள்ளன.',
        },
        rfq: {
          title: 'B2B RFQ அமைப்பு',
          description: 'மொத்த ஆர்டர்களுக்கான விலை கோரிக்கைகளை கேள்வி மேற்கொண்டு சப்ளையர்களுடன் நேரடியாக இணைக்கவும்.',
        },
        shopping: {
          title: 'எளிதான B2C ஷாப்பிங்',
          description: 'தனிப்பட்ட நுகர்வோருக்கான எளிமையான மற்றும் பாதுகாப்பான ஷாப்பிங் அனுபவம்.',
        },
        farmers: {
          title: 'விவசாயிகளிடமிருந்து நேரடியாக',
          description: 'கரிம விவசாயிகள் மற்றும் சரிபார்க்கப்பட்ட சப்ளையர்களுடன் நேரடியாக இணைக்கவும்.',
        },
        sustainable: {
          title: 'நிலைத்த நடைமுறைகள்',
          description: 'சுற்றுச்சூழல் நட்பு மற்றும் நிலைத்த விவசாய நடைமுறைகளை ஆதரித்தல்.',
        },
        quality: {
          title: 'தரத்திற்கு உத்தரவாதம்',
          description: 'கடுமையான தர சோதனைகள் மற்றும் சான்றிதழ் சரிபார்ப்பு செயல்முறை.',
        },
      },
      featuredProducts: 'சிறப்பு பொருட்கள்',
      viewAll: 'அனைத்து பொருட்களையும் காண்க',
    },
  },
  te: {
    nav: {
      home: 'హోమ్',
      products: 'ఉత్పత్తులు',
      rfq: 'ధర కోరిక',
      sellers: 'విక్రేతలు',
      login: 'లాగిన్',
      register: 'నమోదు',
    },
    home: {
      title: 'ప్లార్కెట్ - సేంద్రీయ ఉత్పత్తుల మార్కెట్‌ప్లేస్',
      hero: {
        title: 'మీ విశ్వసనీయ సేంద్రీయ ఉత్పత్తుల మార్కెట్‌ప్లేస్',
        subtitle: 'B2B మరియు B2C లావాదేవీల కోసం ధృవీకరించబడిన సేంద్రీయ రైతులు మరియు సరఫరాదారులతో నేరుగా కనెక్ట్ అవ్వండి',
        getStarted: 'ప్రారంభించండి',
        learnMore: 'మరింత తెలుసుకోండి',
      },
      features: {
        verified: {
          title: 'ధృవీకరించబడిన సేంద్రీయ ఉత్పత్తులు',
          description: 'అన్ని ఉత్పత్తులు సేంద్రీయ ధృవీకరణ మరియు నాణ్యత ప్రమాణాల కోసం ధృవీకరించబడ్డాయి.',
        },
        rfq: {
          title: 'B2B RFQ సిస్టమ్',
          description: 'బల్క్ ఆర్డర్ల కోసం ధరలను అడగండి మరియు సరఫరాదారులతో నేరుగా కనెక్ట్ అవ్వండి.',
        },
        shopping: {
          title: 'సులభమైన B2C షాపింగ్',
          description: 'వ్యక్తిగత వినియోగదారుల కోసం సరళమైన మరియు సురక్షితమైన షాపింగ్ అనుభవం.',
        },
        farmers: {
          title: 'రైతుల నుండి నేరుగా',
          description: 'సేంద్రీయ రైతులు మరియు ధృవీకరించబడిన సరఫరాదారులతో నేరుగా కనెక్ట్ అవ్వండి.',
        },
        sustainable: {
          title: 'స్థిరమైన పద్ధతులు',
          description: 'పర్యావరణ స్నేహపూర్వక మరియు స్థిరమైన వ్యవసాయ పద్ధతులకు మద్దతు.',
        },
        quality: {
          title: 'నాణ్యతకు హామీ',
          description: 'కఠినమైన నాణ్యత చెక్స్ మరియు ధృవీకరణ ధృవీకరణ ప్రక్రియ.',
        },
      },
      featuredProducts: 'విశేష ఉత్పత్తులు',
      viewAll: 'అన్ని ఉత్పత్తులను చూడండి',
    },
  },
};

export function useTranslation() {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations] || translations.en;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  return {
    t,
    locale,
    locales: ['en', 'hi', 'bn', 'ta', 'te'],
    changeLanguage: (newLocale: string) => {
      router.push(router.pathname, router.asPath, { locale: newLocale });
    },
  };
}

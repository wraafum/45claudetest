// News Content - Daily Character Moments
// Pure atmospheric fluff - zero mechanical rewards

// Daily character moments - highest volume content
window.newsContentDaily = [
    
    // SZAFRAN - Eden's Gardener (innocent garden girl)
    {
        id: 'szafran_daily_001',
        text: "Szafran zanosi jabłka do każdego pokoju w dworze. Jej uśmiech jest zaraźliwy.",
        requires: {
            characters: { szafran: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000, // 15 minutes
        category: 'daily'
    },
    {
        id: 'szafran_daily_002', 
        text: "Widziałeś Szafran próbującą złapać motyla. Jej radość była dziecinna i czysta.",
        requires: {
            characters: { szafran: { unlocked: true } },
            timeOfDay: ['morning', 'afternoon']
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'szafran_daily_003',
        text: "Szafran zasnęła w ogrodzie pod jabłonią. Wyglądała spokojnie i bezpiecznie.",
        requires: {
            characters: { szafran: { unlocked: true } },
            timeOfDay: ['afternoon', 'evening']
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'szafran_daily_004',
        text: "Szafran tańczy wśród kwiatów w ogrodzie, nucąc melodię tylko jej znaną.",
        requires: {
            characters: { szafran: { unlocked: true } },
            buildings: { garden: { level: [1, null] } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'szafran_daily_005',
        text: "Szafran śpiewa do roślin w ogrodzie. Wydają się jej słuchać z uwagą.",
        requires: {
            characters: { szafran: { unlocked: true, bondPoints: [50, null] } }
        },
        weight: 0.8,
        cooldown: 1200000, // 20 minutes - slightly more rare
        category: 'daily'
    },
    
    // LUCJA - Combat Instructor (tsundere koziołkini)
    {
        id: 'lucja_daily_001',
        text: "Lucja ćwiczy sama na dziedzińcu. Jej ruchy są precyzyjne i hipnotyzujące.",
        requires: {
            characters: { lucja: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'lucja_daily_002',
        text: "Słyszysz stukot kopyt z sali treningowej. Lucja znów doskonali swoje techniki.",
        requires: {
            characters: { lucja: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'lucja_daily_003',
        text: "Lucja ostro krytykuje błędy wyimaginowanego przeciwnika podczas treningu.",
        requires: {
            characters: { lucja: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'lucja_daily_004',
        text: "Lucja praktykuje kopnięcia na worku treningowym. Jej koncentracja jest absolutna.",
        requires: {
            characters: { lucja: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'lucja_daily_005',
        text: "Lucja poluje na boki i wyciąga kręgosłup po długiej sesji treningowej.",
        requires: {
            characters: { lucja: { unlocked: true } },
            timeOfDay: ['evening', 'night']
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    
    // FURIA - Tsundere Dragon (Levie)
    {
        id: 'furia_daily_001',
        text: "Furia podgrzewa herbatę własnym oddechem, a potem czerwieni się z zawstydzenia.",
        requires: {
            characters: { furia: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'furia_daily_002',
        text: "Z pokoju Furii dobiegają dźwięki jakby ktoś walczył z poduszkami.",
        requires: {
            characters: { furia: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'furia_daily_003',
        text: "Widziałeś jak Furia potajemnie układa twoje rzeczy, mruczając pod nosem.",
        requires: {
            characters: { furia: { unlocked: true, bondPoints: [100, null] } }
        },
        weight: 0.8,
        cooldown: 1200000,
        category: 'daily'
    },
    {
        id: 'furia_daily_004',
        text: "Furia próbuje ukryć rumieniec za swoimi zielonymi włosami. To jej nie wychodzi.",
        requires: {
            characters: { furia: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'furia_daily_005',
        text: "Z pokoju Furii dobiega szum wody. Czy ona ma tam fontannę?",
        requires: {
            characters: { furia: { unlocked: true } }
        },
        weight: 0.7,
        cooldown: 1800000, // 30 minutes - subtle mythos hint
        category: 'daily'
    },
    
    // MOMO - Arena Warrior
    {
        id: 'momo_daily_001',
        text: "Ekran przy kapsule Momo pokazuje jej zwycięstwo nad kolejnym przeciwnikiem.",
        requires: {
            characters: { momo: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'momo_daily_002',
        text: "Momo porusza się niespokojnie we śnie. Prawdopodobnie walczy w arenie.",
        requires: {
            characters: { momo: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'momo_daily_003',
        text: "Wskaźniki kapsuli Momo pokazują zwiększoną aktywność mózgową. Intensywna walka.",
        requires: {
            characters: { momo: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'momo_daily_004',
        text: "Momo ćwiczy w arenie, walcząc z cieniami przeszłości i przyszłości.",
        requires: {
            characters: { momo: { unlocked: true } },
            buildings: { basement: { level: [2, null] } }
        },
        weight: 0.8,
        cooldown: 1200000,
        category: 'daily'
    },
    
    // PROMILIA/MARIA MAGDALENA - Reformed Party Girl  
    {
        id: 'promilia_daily_001',
        text: "Promilia czesze włosy przed lustrem, nucąc spokojną melodię.",
        requires: {
            characters: { promilia: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'promilia_daily_002',
        text: "Promilia czyta starą książkę w fotelu. Wydaje się być w niej pochłonięta.",
        requires: {
            characters: { promilia: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'promilia_daily_003',
        text: "Promilia przygotowuje herbatę dla innych mieszkańców dworu. Jej ruchy są graceful.",
        requires: {
            characters: { promilia: { unlocked: true } },
            buildings: { kitchen: { level: [1, null] } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    
    // BASTET - Divine Cat
    {
        id: 'bastet_daily_001',
        text: "Bastet wygrzewa się na słońcu w najcieplejszym miejscu dworu.",
        requires: {
            characters: { bastet: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'bastet_daily_002',
        text: "Bastet obserwuje wszystko z wysokości, jakby była królową tego miejsca.",
        requires: {
            characters: { bastet: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'bastet_daily_003',
        text: "Bastet dba o swoją sierść z niezwykłą precyzją i dumą.",
        requires: {
            characters: { bastet: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    
    // DUO KRÓLICZKI - Rabbit Family
    {
        id: 'duo_daily_001',
        text: "Puodna dodaje sól do wszystkiego co gotuje. Dziurka protestuje głośno.",
        requires: {
            characters: { duo_kroliczki: { unlocked: true } },
            buildings: { kitchen: { level: [1, null] } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'duo_daily_002',
        text: "Słyszysz śmiech i przekomarzania z pokoju króliczek. Znów się sprzeczają.",
        requires: {
            characters: { duo_kroliczki: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'duo_daily_003',
        text: "Dziurka uczy Puodnę nowoczesnych rzeczy. Puodna wzdycha i kręci głową.",
        requires: {
            characters: { duo_kroliczki: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    
    // MINA - Mystery Character
    {
        id: 'mina_daily_001',
        text: "Mina czyta w ciszy, całkowicie pochłonięta swoją lekturą.",
        requires: {
            characters: { mina: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'mina_daily_002',
        text: "Mina spaceruje po korytarzach dworu, jakby badała każdy szczegół.",
        requires: {
            characters: { mina: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    
    // MARA - Dream Character
    {
        id: 'mara_daily_001',
        text: "Mara śpi większość dnia, ale jej sen wydaje się być bardzo aktywny.",
        requires: {
            characters: { mara: { unlocked: true } }
        },
        weight: 1.0,
        cooldown: 900000,
        category: 'daily'
    },
    {
        id: 'mara_daily_002',
        text: "Mara mruczy we śnie. Czy śni o tobie?",
        requires: {
            characters: { mara: { unlocked: true } }
        },
        weight: 0.8,
        cooldown: 1200000,
        category: 'daily'
    },
    
    // GENERIC MANOR LIFE
    {
        id: 'manor_daily_001',
        text: "W dworze panuje spokojna, ciepła atmosfera.",
        requires: {},
        weight: 0.5,
        cooldown: 1800000,
        category: 'daily'
    },
    {
        id: 'manor_daily_002',
        text: "Słońce świeci przez witraże, tworząc kolorowe wzory na podłodze.",
        requires: {
            timeOfDay: ['morning', 'afternoon']
        },
        weight: 0.5,
        cooldown: 1800000,
        category: 'daily'
    },
    {
        id: 'manor_daily_003',
        text: "Cisza dworu jest przerywana tylko odgłosami codziennego życia.",
        requires: {
            timeOfDay: ['evening', 'night']
        },
        weight: 0.5,
        cooldown: 1800000,
        category: 'daily'
    },
    {
        id: 'manor_daily_004',
        text: "Dwór wydaje się żyć własnym życiem, pełnym tajemnic i spokoju.",
        requires: {},
        weight: 1.0,
        cooldown: 600000, // 10 minutes
        category: 'daily'
    },
    {
        id: 'manor_daily_005',
        text: "Zapach świeżych kwiatów unosi się korytarzami dworu.",
        requires: {},
        weight: 1.0,
        cooldown: 600000,
        category: 'daily'
    },
    {
        id: 'manor_daily_006',
        text: "Gdzieś w oddali słychać delikatne kroki po kamiennych posadzkach.",
        requires: {},
        weight: 1.0,
        cooldown: 600000,
        category: 'daily'
    }
];

// Add seasonal variants (can be expanded later)
window.newsContentDaily.push(
    // Spring variants
    {
        id: 'szafran_spring_001',
        text: "Szafran cieszy się pierwszymi kwiatami wiosny w ogrodzie.",
        requires: {
            characters: { szafran: { unlocked: true } },
            buildings: { garden: { level: [1, null] } }
        },
        weight: 0.8,
        cooldown: 1800000,
        category: 'daily'
    },
    
    // Evening variants
    {
        id: 'furia_evening_001',
        text: "Furia obserwuje zachód słońca z okna, jej oczy błyszczą w ciepłym świetle.",
        requires: {
            characters: { furia: { unlocked: true } },
            timeOfDay: ['evening']
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'daily'
    }
);

console.log('📰 Daily news content loaded:', window.newsContentDaily.length, 'entries');
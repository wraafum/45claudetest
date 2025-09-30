// News Content - Subtle Mythos Hints
// Very subtle biblical/mythological references for atmosphere

// Mystery and mythos content - low volume, high requirements
window.newsContentMysteries = [
    
    // ENVIRONMENTAL MYSTERIES - EARLY HINTS
    {
        id: 'mystery_manor_001',
        text: "Stare witraże w bibliotece mienią się dziwnym światłem o zmierzchu.",
        requires: {
            timeOfDay: ['evening']
        },
        weight: 0.3,
        cooldown: 3600000, // 60 minutes
        category: 'mystery'
    },
    {
        id: 'mystery_manor_002',
        text: "Słyszysz echo łacińskich szeptów z piwnicy, ale nikt tam nie mieszka.",
        requires: {
            buildings: { basement: { level: [1, null] } },
            timeOfDay: ['night']
        },
        weight: 0.2,
        cooldown: 4200000, // 70 minutes
        category: 'mystery'
    },
    {
        id: 'mystery_manor_003',
        text: "Siedmioramienny świecznik w jadalni zapalił się sam podczas kolacji.",
        requires: {
            sanctuary: { level: [2, null] }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'mystery_manor_004',
        text: "Lustro w korytarzu odbija twoje imię dziwnie. Litery wyglądają... odwrócone.",
        requires: {
            sanctuary: { level: [4, null] } // Mid-game revelation hint
        },
        weight: 0.15,
        cooldown: 5400000, // 90 minutes
        category: 'mystery'
    },
    
    // GARDEN OF EDEN ECHOES
    {
        id: 'garden_mystery_001',
        text: "Owoce w ogrodzie Szafran dojrzewają poza sezonem. To naprawdę dziwne.",
        requires: {
            characters: { szafran: { unlocked: true, bondPoints: [200, null] } },
            buildings: { garden: { level: [2, null] } }
        },
        weight: 0.25,
        cooldown: 3600000,
        category: 'mystery'
    },
    {
        id: 'garden_mystery_002',
        text: "Wąż w ogrodzie wydaje się obserwować odwiedzających. Ale w przyjazny sposób.",
        requires: {
            characters: { 
                szafran: { unlocked: true, bondPoints: [300, null] }
                // Subtle reference to helpful serpent (Ewa)
            },
            buildings: { garden: { level: [2, null] } }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'garden_mystery_003',
        text: "Szafran znalazła nowy gatunek jabłoni. Jej owoce są niezwykle słodkie i... oświecające.",
        requires: {
            characters: { szafran: { unlocked: true, bondPoints: [500, null] } },
            buildings: { garden: { level: [3, null] } }
        },
        weight: 0.15,
        cooldown: 5400000,
        category: 'mystery'
    },
    
    // CHARACTER MYTHOS HINTS
    {
        id: 'szafran_mystery_001',
        text: "Rośliny w obecności Szafran rosną szybciej. Ona sama tego nie zauważa.",
        requires: {
            characters: { szafran: { unlocked: true, bondPoints: [400, null] } }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'lucja_mystery_001',
        text: "Lucja dotyka swoich rogów w zamyśleniu. Wydaje się być w nich jakaś pradawna moc.",
        requires: {
            characters: { lucja: { unlocked: true, bondPoints: [300, null] } }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'furia_mystery_001',
        text: "Słyszysz odgłosy burzy, ale niebo jest czyste. To chyba z pokoju Furii.",
        requires: {
            characters: { furia: { unlocked: true, bondPoints: [400, null] } }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'bastet_mystery_001',
        text: "Bastet czasami mówi o 'dawnych czasach' jakby była tam osobiście. Ale to niemożliwe... prawda?",
        requires: {
            characters: { bastet: { unlocked: true, bondPoints: [500, null] } }
        },
        weight: 0.15,
        cooldown: 5400000,
        category: 'mystery'
    },
    {
        id: 'promilia_mystery_001',
        text: "Promilia wspomina siedem... czego? Przerywa w połowie zdania i czerwieni się.",
        requires: {
            characters: { promilia: { unlocked: true, bondPoints: [400, null] } }
        },
        weight: 0.2,
        cooldown: 4200000,
        category: 'mystery'
    },
    {
        id: 'momo_mystery_001',
        text: "Momo czyta starą księgę. Na okładce widzisz cyfry '2' i '23'. Co to może oznaczać?",
        requires: {
            characters: { momo: { unlocked: true, bondPoints: [300, null] } }
        },
        weight: 0.15,
        cooldown: 5400000, // 2 Kings 2:23 reference
        category: 'mystery'
    },
    
    // KAIN'S LEGACY - LATE GAME HINTS
    {
        id: 'kain_legacy_001',
        text: "Znalazłeś starą kartę z napisem 'Lista Pożądanych'. Większość imion jest skreślona.",
        requires: {
            sanctuary: { level: [5, null] }
        },
        weight: 0.1,
        cooldown: 7200000, // 120 minutes
        category: 'mystery'
    },
    {
        id: 'kain_legacy_002',
        text: "W bibliotece leży rozerwany dziennik: 'Kot egipski rośnie w siłę. Święte i profane tańczą razem...'",
        requires: {
            characters: { bastet: { unlocked: true, bondPoints: [600, null] } },
            sanctuary: { level: [5, null] }
        },
        weight: 0.08,
        cooldown: 7200000,
        category: 'mystery'
    },
    {
        id: 'kain_legacy_003',
        text: "Na stronie dziennika: 'Siedem demonów opuściło Marię, ale siedem pragnień pozostało. Postęp!'",
        requires: {
            characters: { promilia: { unlocked: true, bondPoints: [700, null] } },
            sanctuary: { level: [6, null] }
        },
        weight: 0.08,
        cooldown: 7200000,
        category: 'mystery'
    },
    {
        id: 'kain_legacy_004',
        text: "Na ścianie piwnicy widać zarys napisu: 'Asmodia śmieje się z mojej kolekcji. Zobaczymy kto będzie się śmiał ostatni.'",
        requires: {
            buildings: { basement: { level: [3, null] } },
            sanctuary: { level: [7, null] }
        },
        weight: 0.05,
        cooldown: 8400000, // 140 minutes - very rare
        category: 'mystery'
    },
    
    // SOLOMON IDENTITY HINTS
    {
        id: 'solomon_hint_001',
        text: "Dziewczyny czasami mówią do ciebie 'królu', jakby to było naturalne. Skąd to się bierze?",
        requires: {
            sanctuary: { level: [4, null] }
        },
        weight: 0.12,
        cooldown: 6000000, // 100 minutes
        category: 'mystery'
    },
    {
        id: 'solomon_hint_002',
        text: "Bastet ukłoniła się gdy przechodziłeś. 'Rozpoznaję królewską krew gdy ją widzę,' mruknęła.",
        requires: {
            characters: { bastet: { unlocked: true, bondPoints: [500, null] } },
            sanctuary: { level: [5, null] }
        },
        weight: 0.1,
        cooldown: 6600000,
        category: 'mystery'
    },
    {
        id: 'solomon_hint_003',
        text: "Znalazłeś pismo adresowane na 'Pan Nomolos'. Listonosz pomylił się, ale nazwa brzmi znajomo...",
        requires: {
            sanctuary: { level: [6, null] }
        },
        weight: 0.08,
        cooldown: 7800000, // Very rare - major revelation hint
        category: 'mystery'
    },
    
    // SUPERNATURAL MANIFESTATIONS
    {
        id: 'supernatural_001',
        text: "Witraże pokazują sceny, które wyglądają podejrzanie podobnie do twoich codziennych spotkań z dziewczynami.",
        requires: {
            sanctuary: { level: [3, null] }
        },
        weight: 0.15,
        cooldown: 5400000,
        category: 'mystery'
    },
    {
        id: 'supernatural_002',
        text: "Czasami słyszysz hymny lub psalm łacińskie podczas intymnych chwil. Skąd się to bierze?",
        requires: {
            sanctuary: { level: [4, null] }
        },
        weight: 0.1,
        cooldown: 6600000,
        category: 'mystery'
    },
    {
        id: 'supernatural_003',
        text: "Starożytne symbole powoli pojawiają się na ścianach dworu. Są piękne, ale co oznaczają?",
        requires: {
            sanctuary: { level: [5, null] }
        },
        weight: 0.12,
        cooldown: 6000000,
        category: 'mystery'
    },
    
    // WEATHER AND TIME ANOMALIES
    {
        id: 'anomaly_001',
        text: "Pogoda wokół dworu wydaje się... reagować na nastroje mieszkańców. To może być przypadek.",
        requires: {
            // Multiple characters with high bond
        },
        weight: 0.15,
        cooldown: 5400000,
        category: 'mystery'
    },
    {
        id: 'anomaly_002',
        text: "Zegary w dworze czasami zatrzymują się podczas ważnych momentów. Czas wydaje się być... elastyczny.",
        requires: {
            sanctuary: { level: [3, null] }
        },
        weight: 0.12,
        cooldown: 6000000,
        category: 'mystery'
    },
    
    // RABBIT FAMILY MYTHOS HINTS
    {
        id: 'rabbits_mystery_001',
        text: "Puodna jest obsesyjnie zakochana w soli. Dzirka żartuje: 'Mama, nie możesz wszystkiego solić!'",
        requires: {
            characters: { duo_kroliczki: { unlocked: true, bondPoints: [200, null] } }
        },
        weight: 0.2,
        cooldown: 4200000, // Lot's wife reference
        category: 'mystery'
    },
    {
        id: 'rabbits_mystery_002',
        text: "Dziurka wspomina: 'Tata nazywał się Lott, jak ten facet z Biblii. Mama jest słona jak jego żona.'",
        requires: {
            characters: { duo_kroliczki: { unlocked: true, bondPoints: [400, null] } }
        },
        weight: 0.15,
        cooldown: 5400000,
        category: 'mystery'
    },
    
    // DREAMS AND VISIONS
    {
        id: 'dreams_001',
        text: "Miałeś dziwny sen o siedmiu świecznikach i tronach. Czy to ma jakieś znaczenie?",
        requires: {
            sanctuary: { level: [4, null] },
            timeOfDay: ['night']
        },
        weight: 0.1,
        cooldown: 7200000,
        category: 'mystery'
    },
    {
        id: 'dreams_002',
        text: "We śnie widziałeś dwór jak świątynię, a dziewczyny jako... coś więcej niż tylko mieszkanki.",
        requires: {
            sanctuary: { level: [6, null] },
            timeOfDay: ['night']
        },
        weight: 0.08,
        cooldown: 8400000,
        category: 'mystery'
    },
    
    // ENDGAME REVELATIONS PREPARATION
    {
        id: 'revelation_prep_001',
        text: "Wszystkie dzielne elementy zaczynają układać się w całość. Jakby był w tym jakiś większy plan...",
        requires: {
            sanctuary: { level: [8, null] }
        },
        weight: 0.05,
        cooldown: 10800000, // 180 minutes - extremely rare
        category: 'mystery'
    },
    {
        id: 'revelation_prep_002',
        text: "Czujesz, że twoja rola w tym dworze to coś więcej niż tylko kolekcjonowanie pięknych dziewczyn.",
        requires: {
            sanctuary: { level: [9, null] }
        },
        weight: 0.03,
        cooldown: 12600000, // 210 minutes
        category: 'mystery'
    }
];

console.log('📰 Mystery news content loaded:', window.newsContentMysteries.length, 'entries');
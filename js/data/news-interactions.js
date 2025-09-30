// News Content - Multi-Character Interactions
// Pure atmospheric fluff showing character relationships

// Multi-character interactions - medium volume content
window.newsContentInteractions = [
    
    // SZAFRAN TEACHING OTHERS
    {
        id: 'szafran_teach_001',
        text: "Widzisz jak Szafran uczy Furię opieki nad roślinami. Furia jest zaskakująco delikatna.",
        requires: {
            characters: { 
                szafran: { unlocked: true, bondPoints: [100, null] },
                furia: { unlocked: true }
            },
            buildings: { garden: { level: [1, null] } }
        },
        weight: 0.7,
        cooldown: 1800000, // 30 minutes
        category: 'interaction'
    },
    {
        id: 'szafran_teach_002', 
        text: "Szafran pokazuje Promilii jak dbać o kwiaty. Obie śmieją się z czegoś.",
        requires: {
            characters: { 
                szafran: { unlocked: true },
                promilia: { unlocked: true }
            },
            buildings: { garden: { level: [1, null] } }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'szafran_teach_003',
        text: "Szafran tłumaczy Bastet tajniki uprawy ziół. Bastet słucha z królewską uwagą.",
        requires: {
            characters: { 
                szafran: { unlocked: true, bondPoints: [200, null] },
                bastet: { unlocked: true }
            },
            buildings: { garden: { level: [2, null] } }
        },
        weight: 0.6,
        cooldown: 2400000, // 40 minutes
        category: 'interaction'
    },
    
    // LUCJA TRAINING OTHERS
    {
        id: 'lucja_train_001',
        text: "Lucja trenuje z Momo na dziedzińcu. Ich walka przypomina śmiertelny taniec.",
        requires: {
            characters: { 
                lucja: { unlocked: true },
                momo: { unlocked: true }
            }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'lucja_train_002',
        text: "Lucja uczy Furię kontrolowania siły. 'Nie każdy problem rozwiąże się ogniem.'",
        requires: {
            characters: { 
                lucja: { unlocked: true, bondPoints: [300, null] },
                furia: { unlocked: true }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    {
        id: 'lucja_train_003',
        text: "Widzisz Lucję poprawiającą pozycję walki Bastet. Koziołkini to mistrzyni precyzji.",
        requires: {
            characters: { 
                lucja: { unlocked: true },
                bastet: { unlocked: true }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // COOKING TOGETHER IN KITCHEN
    {
        id: 'kitchen_cook_001',
        text: "Przechodzając przez kuchnię spotykasz Puodnę, która uczy Furię gotować. Smoczy ogień to świetne narzędzie kulinarne.",
        requires: {
            characters: { 
                duo_kroliczki: { unlocked: true },
                furia: { unlocked: true }
            },
            buildings: { kitchen: { level: [1, null] } }
        },
        weight: 0.8,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'kitchen_cook_002',
        text: "Promilia i Szafran przygotowują posiłek razem. W kuchni unosi się zapach ziół i przypraw.",
        requires: {
            characters: { 
                promilia: { unlocked: true },
                szafran: { unlocked: true }
            },
            buildings: { kitchen: { level: [1, null] } }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'kitchen_cook_003',
        text: "Bastet krytykuje sposób gotowania innych z pozycji obserwatora. 'W Egipcie robiliśmy to lepiej.'",
        requires: {
            characters: { 
                bastet: { unlocked: true }
            },
            buildings: { kitchen: { level: [2, null] } }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // BATHHOUSE RELAXATION
    {
        id: 'bathhouse_relax_001',
        text: "Słyszysz rozmowy i śmiech z łaźni. Dziewczyny relaksują się po ciężkim dniu.",
        requires: {
            buildings: { bathhouse: { level: [1, null] } },
            timeOfDay: ['evening', 'night']
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    {
        id: 'bathhouse_relax_002',
        text: "Furia i Lucja dyskutują o strategiach walki w łaźni. Nawet w relaksie myślą o treningu.",
        requires: {
            characters: { 
                furia: { unlocked: true },
                lucja: { unlocked: true }
            },
            buildings: { bathhouse: { level: [1, null] } }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'bathhouse_relax_003',
        text: "Bastet demonstruje 'właściwy' sposób kąpieli. Inne dziewczyny obserwują z zainteresowaniem.",
        requires: {
            characters: { 
                bastet: { unlocked: true }
            },
            buildings: { bathhouse: { level: [2, null] } }
        },
        weight: 0.6,
        cooldown: 2400000,
        category: 'interaction'
    },
    
    // PROMILIA'S WISDOM SHARING
    {
        id: 'promilia_wisdom_001',
        text: "Promilia opowiada Szafran o swoich 'siedmiu złych związkach'. Szafran słucha współczująco.",
        requires: {
            characters: { 
                promilia: { unlocked: true, bondPoints: [200, null] },
                szafran: { unlocked: true }
            }
        },
        weight: 0.5,
        cooldown: 2700000, // 45 minutes - subtle mythos hint
        category: 'interaction'
    },
    {
        id: 'promilia_wisdom_002',
        text: "Promilia doradza Furii jak kontrolować temperament. 'Zaufaj mi, sama przez to przechodziłam.'",
        requires: {
            characters: { 
                promilia: { unlocked: true, bondPoints: [300, null] },
                furia: { unlocked: true }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // MOMO'S PROTECTIVE INSTINCTS
    {
        id: 'momo_protect_001',
        text: "Widziałeś jak Momo chroni młodsze dziewczyny przed agresywnymi gośćmi dworu.",
        requires: {
            characters: { 
                momo: { unlocked: true, bondPoints: [100, null] }
            }
        },
        weight: 0.5,
        cooldown: 2700000, // Biblical bear protection reference
        category: 'interaction'
    },
    {
        id: 'momo_protect_002',
        text: "Momo uczy Szafran podstaw samoobrony. 'Niewinność to piękne, ale musisz potrafić się bronić.'",
        requires: {
            characters: { 
                momo: { unlocked: true },
                szafran: { unlocked: true, bondPoints: [200, null] }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // COMPETITIVE INTERACTIONS
    {
        id: 'compete_001',
        text: "Lucja i Furia rywalizują o to, kto ma lepszą technikę walki. Atmosfera jest napięta.",
        requires: {
            characters: { 
                lucja: { unlocked: true, bondPoints: [200, null] },
                furia: { unlocked: true, bondPoints: [200, null] }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    {
        id: 'compete_002',
        text: "Bastet i Promilia dyskutują o tym, która z nich ma większe doświadczenie życiowe.",
        requires: {
            characters: { 
                bastet: { unlocked: true },
                promilia: { unlocked: true }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // HELPING RELATIONSHIPS
    {
        id: 'help_001',
        text: "Szafran zanosi herbatę ziołową dla Momo. Pamięta, że wojowniczka lubi naturalne smaki.",
        requires: {
            characters: { 
                szafran: { unlocked: true, bondPoints: [150, null] },
                momo: { unlocked: true }
            },
            buildings: { garden: { level: [1, null] } }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    {
        id: 'help_002',
        text: "Furia dyskretnie naprawia urządzenia w dworze używając swojego ognia. Nikt jej o to nie prosił.",
        requires: {
            characters: { 
                furia: { unlocked: true, bondPoints: [250, null] }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    {
        id: 'help_003',
        text: "Promilia czesze włosy Szafran, opowiadając jej o starych czasach.",
        requires: {
            characters: { 
                promilia: { unlocked: true, bondPoints: [200, null] },
                szafran: { unlocked: true, bondPoints: [100, null] }
            }
        },
        weight: 0.7,
        cooldown: 1800000,
        category: 'interaction'
    },
    
    // TRIO INTERACTIONS
    {
        id: 'trio_001',
        text: "Szafran, Promilia i Lucja spędzają razem czas w ogrodzie, każda zajęta czymś innym.",
        requires: {
            characters: { 
                szafran: { unlocked: true },
                promilia: { unlocked: true },
                lucja: { unlocked: true }
            },
            buildings: { garden: { level: [1, null] } },
            timeOfDay: ['afternoon', 'evening']
        },
        weight: 0.5,
        cooldown: 3000000, // 50 minutes - rarer
        category: 'interaction'
    },
    {
        id: 'trio_002',
        text: "Furia, Lucja i Momo omawiają różne style walki. Każda reprezentuje inny sposób myślenia.",
        requires: {
            characters: { 
                furia: { unlocked: true },
                lucja: { unlocked: true },
                momo: { unlocked: true }
            }
        },
        weight: 0.5,
        cooldown: 3000000,
        category: 'interaction'
    },
    
    // SEASONAL GROUP ACTIVITIES
    {
        id: 'group_activity_001',
        text: "Wszystkie dziewczyny pomagają przy porządkach w dworze. Każda ma swoją metodę.",
        requires: {
            // At least 3 characters unlocked
        },
        weight: 0.4,
        cooldown: 3600000, // 60 minutes - very rare
        category: 'interaction'
    },
    {
        id: 'group_activity_002',
        text: "Wieczorne rozmowy przy kominku. Dziewczyny dzielą się historiami ze swojego życia.",
        requires: {
            timeOfDay: ['evening', 'night']
        },
        weight: 0.4,
        cooldown: 3600000,
        category: 'interaction'
    },
    
    // RABBIT FAMILY INTERACTIONS WITH OTHERS
    {
        id: 'rabbits_others_001',
        text: "Dziurka tłumaczy innym dziewczynom nowoczesne technologie. Reakcje są mieszane.",
        requires: {
            characters: { 
                duo_kroliczki: { unlocked: true }
            }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    {
        id: 'rabbits_others_002',
        text: "Puodna dzieli się rodzinnych przepisami z innymi. Wszyscy są pod wrażeniem jej gotowania.",
        requires: {
            characters: { 
                duo_kroliczki: { unlocked: true }
            },
            buildings: { kitchen: { level: [1, null] } }
        },
        weight: 0.6,
        cooldown: 2100000,
        category: 'interaction'
    },
    
    // LATE GAME GROUP DYNAMICS
    {
        id: 'advanced_group_001',
        text: "Dziewczyny organizują między sobą system podziału obowiązków w dworze. Wszystko działa sprawnie.",
        requires: {
            // Most characters unlocked and bonded
            sanctuary: { level: [3, null] }
        },
        weight: 0.3,
        cooldown: 4200000, // 70 minutes - endgame content
        category: 'interaction'
    }
];

console.log('📰 Interaction news content loaded:', window.newsContentInteractions.length, 'entries');
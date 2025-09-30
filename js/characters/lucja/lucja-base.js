// Lucja - Base Character Data
window.characterData = window.characterData || {};

window.characterData.lucja = {
    id: 'lucja',
    name: 'Lucja',
    title: 'Instruktorka Walki',
    unlocked: false,
    unlockCost: 12000,
    level: 0,
    baseCost: 500,
    costGrowth: 1.25,
    baseLpPerSecond: 30,
    bondPoints: 0,
    baseBpPerSecond: 0.8,
    storyProgress: 0,
    avatar: 'imgs/avatars/lucja_avatar.png',
    image: 'imgs/characters/lucja.png',
    clickImage: 'imgs/click/lucja_click.png',
    bio: [ 
        { 
            threshold: 0, 
            text: "Koziołkini prowadząca prywatne dojo sztuk walki. Jej kształtne biodra i jędrne piersi mogą zmylić - pod kobiecymi krągłościami kryje się siła wyćwiczona latami. Jej ciemne rogi i pewne ruchy zdradzają, że szuka kogoś, kto nie spuści wzroku przed wyzwaniem." 
        },
        { 
            threshold: 3, 
            text: "W jej oczach pojawia się nowe światło - pierwszy raz ktoś nie tylko został, ale wydaje się... cieszyć z wyzwania. Jej ruchy stają się bardziej pewne, spojrzenia dłuższe. Coś w jej postawie zmienia się z rezygnacji na rosnące zainteresowanie." 
        },
        { 
            threshold: 8, 
            text: "Zaczyna dostrzegać w tobie godnego rywala. Jej wyzywające spojrzenia stają się dłuższe, a podczas walk czujesz, że testuje nie tylko twoją siłę fizyczną. W sposobie, w jaki chwyta cię za ramiona czy przyciąga bliżej podczas chwytu, jest coś więcej niż zwykłe starcie - to taniec dwojga wojowników poznających swoje granice." 
        }
    ],
    clickComments: [
        "Jeszcze trochę.", 
        "Nie poddawaj się.", 
        "Lepiej.", 
        "Pokaż mi więcej.", 
        "Tak właśnie.", 
        "Wreszcie ktoś godny."
    ],
    storyThresholds: [0, 400, 1000, 2000, 3500, 5500, 8000, 12000, 18000, 26000, 36000, 50000, 70000, 95000, 125000, 160000, 200000],
    storyEvents: []
};

console.log('DEBUG: Lucja base data loaded successfully');
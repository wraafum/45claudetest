// Momo - Base Character Data
// The Sleeping Warrior of the Arena
window.characterData = window.characterData || {};

window.characterData.momo = {
    id: 'momo',
    name: 'Momo',
    title: 'Wojowniczka z Areny',
    unlocked: false,
    level: 0,
    baseCost: 150,
    costGrowth: 1.18,
    baseLpPerSecond: 8,
    bondPoints: 0,
    baseBpPerSecond: 0.15,
    storyProgress: 0,
    unlockCost: 30000,
    unlockConditions: [{ type: 'building', buildingId: 'basement', level: 1 }],
    avatar: 'imgs/avatars/momo_avatar.png',
    image: 'imgs/characters/momo.png',
    clickImage: 'imgs/click/momo_click.png',
    bio: [
        { threshold: 0, text: "Momo to bezwzględna wojowniczka, której awatar w magicznej arenie zdobywa sławę i bogactwo. Ma obsesję na punkcie bycia najsilniejszą i ciągłego rozwoju. Jej prawdziwe ciało spoczywa w głębokim śnie, podczas gdy jej świadomość walczy w nieskończonych bataliach." },
        { threshold: 3, text: "Zaczynasz rozumieć, że dla Momo walka to coś więcej niż tylko zwycięstwo. To forma ekspresji, sposób na odczuwanie intensywności życia. Jej oddech przyśpiesza gdy opowiada o kolejnych potyczkach." },
        { threshold: 4, text: "Jej ciało reaguje na opowieści o walkach tak, jakby była to forma podniecenia. Mięśnie napinają się, a w oczach błyska dziki ogień. Zaczyna rozumieć, że walka może być... intymna." }
    ],
    clickComments: ["Czujesz tę moc?", "Jestem nie do pokonania!", "Walka to moja pasja.", "Silniejsi razem..."],
    storyThresholds: [0, 20, 60, 300, 1500, 7500, 25000, 60000, 150000],
    storyEvents: [] // Will be populated by story files
};
// Szafran - Base Character Data
window.characterData = window.characterData || {};

window.characterData.szafran = {
    id: 'szafran',
    name: 'Szafran',
    title: 'Opiekunka Dworu',
    unlocked: true,
    level: 1,
    baseCost: 10,
    costGrowth: 1.15,
    baseLpPerSecond: 1,
    productionGrowth: 1.15,
    bondPoints: 0,
    baseBpPerSecond: 0.1,
    storyProgress: 0,
    avatar: 'imgs/avatars/szafran_avatar.png',
    image: 'imgs/characters/szafran.png',
    clickImage: 'imgs/click/szafran_click.png',
    bio: [
        { threshold: 0, text: "Cicha opiekunka dworu, która od lat pielęgnuje jego ogrody z miłością i cierpliwością. W jej oczach widać spokojną mądrość, jakby wiedziała więcej, niż jest skłonna powiedzieć. Wśród roślin czuje się pewnie, ale obecność ludzi czyni ją nieśmiałą. Mówi cicho o 'poprzednich mieszkańcach' i o tym, że dwór czekał na kogoś szczególnego." },
        { threshold: 3, text: "Coraz częściej zdarza jej się wspominać sny, w których ktoś taki jak ty przybywał do dworu. Jej babcia opowiadała jej historie o tym miejscu, o 'specjalnych ludziach', którzy tu mieszkali. Gdy prowadzi cię po ogrodzie, wskazuje miejsca z tajemniczą znajomością, jakby każdy zakątek miał swoją historię." },
        { threshold: 4, text: "Zaczyna odsłaniać swoją prawdziwą naturę - nie jest tylko nieśmiałą dziewczyną, ale mądrą opiekunką, która czekała na twoje przybycie. Rośliny reagują na jej emocje, a ona z coraz większą pewnością prowadzi cię przez tajemnice dworu. 'Wiedziałam, że przyjdziesz,' szepcze. 'Ogród mi to powiedział.'" }
    ],
    clickComments: ["Och... jesteś jak słońce dla moich roślin.", "Dwór cię lubi... czuję to.", "Kiedyś śniło mi się, że ktoś taki przyjdzie.", "Ogród kwitnie, gdy jesteś blisko.", "To... to jest jak w moich snach."],
    storyThresholds: [15, 40, 200, 800, 2000, 4500, 8000, 13000, 20000, 30000, 45000, 65000, 100000, 150000],
    storyEvents: [] // Will be populated by story files
};
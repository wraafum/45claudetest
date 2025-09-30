// Furia - Base Character Data
window.characterData = window.characterData || {};

window.characterData.furia = {
    id: 'furia',
    name: 'Furia',
    title: 'Smoczka Północy',
    unlocked: false,
    unlockCost: 40000,
    unlockConditions: [{ type: 'character', characterId: 'momo', level: 3 }],
    level: 0,
    baseCost: 900,
    costGrowth: 1.35,
    baseLpPerSecond: 80,
    bondPoints: 0,
    baseBpPerSecond: 1.7,
    storyProgress: 0,
    avatar: 'imgs/avatars/furia_avatar.png',
    image: 'imgs/characters/furia.png',
    clickImage: 'imgs/click/furia_click.png',
    clickImage_alt: 'imgs/click/furia_click_alt.png',
    image_alt: 'imgs/characters/furia_alt.png',
    bio: [
        { threshold: 0, text: "Potężna smoczyca z północnych gór. Jej szmaragdowe oczy płoną dumą i niezłomną wolą, a zielone włosy mieniące się złotymi odblaskami opadają na ramiona pokryte subtelnymi łuskami. Jest typowym tsundere - ostro reaguje na jakąkolwiek bliskość, ale pod maską obojętności kryje się wrażliwe serce." },
        { threshold: 3, text: "Zaczyna się przyzwyczajać do twojej obecności, chociaż wciąż protestuje. Jej ruchy stają się mniej agresywne, a wzrok często błądzi w twoją stronę. Czasami przyłapujesz ją na obserwowaniu cię, ale natychmiast odwraca się z rumieńcem na policzkach." },
        { threshold: 5, text: "Jej opór słabnie, ustępując miejsca niepewnej ciekawości. Gdy myśli, że nie patrzysz, dotyka miejsc, gdzie ją dotknąłeś. Jej smocza natura ujawnia się w sposób, w jaki jej skóra emanuje ciepłem, gdy jest blisko ciebie." },
        { threshold: 8, text: "Pierwszy raz pozwala ci się dotknąć bez protestów. Jej oddech przyspiesza, a łuski na jej skórze zaczynają subtelnie błyszczeć. Jest zaskoczona intensywnością własnych reakcji - nigdy wcześniej nie czuła się tak podatna na czyjś dotyk." },
        { threshold: 10, text: "Jej tsundere fasada kruszy się coraz bardziej. Zaczyna szukać wymówek, żeby spędzać z tobą czas, a jej protesty brzmią coraz mniej przekonująco. W jej oczach pojawia się coś, czego nigdy wcześniej nie widziałeś - bezbronna czułość." },
        { threshold: 13, text: "Wreszcie przestaje walczyć ze swoimi uczuciami. Jej smocza natura w pełni się ujawnia - nie tylko w sile i magii, ale też w intensywności jej pragnień. Jest gotowa powierzyć ci swoje najgłębsze sekrety i największe skarby." }
    ],
    clickComments: [
        "Nie myśl sobie, że mi się to podoba!",
        "Głupek! Przestań mnie dotykać!",
        "To... to nic nie znaczy!",
        "Nie patrz tak na mnie!",
        "Wcale nie jestem czerwona!",
        "Robię to tylko dla ciebie... nie!",
        "Ty... ty mnie nie rozumiesz!",
        "Nie jestem słodka!"
    ],
    storyThresholds: [100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000, 25000, 30000],
    storyEvents: [] // Will be populated by other files
};
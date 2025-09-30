window.characterData = window.characterData || {}; window.characterData.momo = {
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
    unlockCost: 2000,
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
    storyEvents: [
        { id: 'momo_1', title: "Śpiąca Wojowniczka", cg: "imgs/cg/momo/momo_1.png", text: "W najgłębszej części piwnicy znajdujesz kapsułę wypełnioną świetlistą cieczą. W środku unosi się dziewczyna o srebrzystych włosach i umięśnionym ciele. Jej oczy nagle otwierają się - płonące czerwienią jak u drapieżnika.\n\n'Ty... ty nie jesteś z areny,' mówi głosem, który odbija się echem w twojej głowie. 'Ale czuję twoją moc. Jestem Momo, niezwyciężona wojowniczka. Mój awatar walczy od setek lat, zdobywając sławę i złoto.' Jej dłoń dotyka szkła od środka. 'Chcesz zobaczyć, jak walczę?'" },
        { id: 'momo_2', title: "Pierwsza Walka", cg: "imgs/cg/momo/momo_2.png", text: "Momo prowadzi cię do małego krystalicznego ekranu przy swojej kapsule. Obraz pokazuje arenę, gdzie jej awatar - identyczna kopia - walczy z potworną bestią. Każdy ruch jest perfekcyjny, śmiertelny.\n\n'Widzisz?' szepcze, jej oczy błyszczą z podekscytowaniem. 'Jestem najsilniejsza. Każde zwycięstwo daje mi więcej mocy.' Jej dłoń zaciska się w pięść. 'Ale czasami... czasami chcę walczyć prawdziwym ciałem. Chcę poczuć ból i przyjemność jednocześnie.'" },
        { id: 'momo_3', title: "Pragnienie Dotyku", cg: "imgs/cg/momo/momo_3.png", text: "Momo patrzy na ciebie przez szkło kapsuly z tęsknotą. 'Już nie pamiętam, jak to jest być dotykana prawdziwymi rękami,' wyznaje. 'W arenie czuję tylko metal i krew.' Jej palce ślizgają się po wewnętrznej stronie szkła.\n\n'Czy możesz... czy możesz dotknąć kapsuly? Może poczuję ciepło twojej dłoni.' Gdy przykładasz rękę do powierzchni, jej oczy zamykają się z rozkoszy. 'Och... to takie ciepłe. Tak różne od zimnego metalu mieczy.'" },
        { id: 'momo_4', title: "Sen Wojowniczki", cg: "imgs/cg/momo/momo_4.png", text: "Pewnej nocy znajdujesz Momo w stanie głębokiego snu. Jej ciało drży, a na ustach błądzi dziwny uśmiech. Nagle budzi się, dysząc ciężko.\n\n'Śniłam o tobie,' mówi, rumieniąc się po raz pierwszy. 'Nie o walce, ale o... o tym, jak jesteś ze mną w arenie. Nie jako przeciwnik, ale jako... partner.' Jej głos drży. 'W śnie dotykałeś mnie po każdym zwycięstwie. To było silniejsze niż jakakolwiek walka.'" },
        { id: 'momo_5', title: "Zwycięska Nagroda", cg: "imgs/cg/momo/momo_5.png", text: "Momo osiąga wielkie zwycięstwo w arenie - pokonuje smoka, który terroryzował inne wojowniczki. Jej awatar wraca z ogromną ilością złota i sławy. Ale gdy patrzysz na nią, widzisz, że nie złoto jest tym, czego pragnie.\n\n'Każde zwycięstwo jest puste bez kogoś, kto by je ze mną świętował,' mówi cicho. 'Chcę... chcę wyjść z tej kapsuly. Chcę poczuć twoje ręce na moim ciele, gdy jestem najsilniejsza.' Jej oczy płoną żądzą walki i czymś więcej." },
        { id: 'momo_6', title: "Pierwsza Bliskość", cg: "imgs/cg/momo/momo_6.png", text: "Momo w końcu otwiera kapsułę na krótko, pozwalając ci dotknąć jej prawdziwego ciała. Jej skóra jest jednocześnie miękka i twarda od mięśni. Drży pod twoim dotykiem.\n\n'To... to nie jest jak w arenie,' szepcze, jej oddech staje się szybki. 'Tam czuję tylko walkę. Ale to...' Jej dłoń łapie twoją, przyciskając ją do swojego serca. 'To jest prawdziwe. Ty jesteś prawdziwy.' Jej usta zbliżają się do twoich. 'Pokarz mi, jak wygląda zwycięstwo w prawdziwym świecie.'" },
        { id: 'momo_7', title: "Arena Namiętności", cg: "imgs/cg/momo/momo_7.png", text: "Momo w końcu decyduje się na coś niezwykłego - tworzy prywatną arenę, gdzie jej awatar może walczyć z twoim. Ale te walki to nie zwykły combat - to taniec ciał, gdzie każdy ruch kończy się coraz bardziej intymnym kontaktem. 'Walczymy, ale nie o zwycięstwo,' szepcze, gdy wasz taniec staje się coraz bardziej namiętny. 'Walczymy o to, kto pierwszy się podda przyjemności. Chcę założyć prawdziwą arenę, gdzie inni mogą zobaczyć naszą moc!'", unlocks: { minigame: 'arena' } },
        { id: 'momo_8', title: "Mistrzyni Dwóch Światów", cg: "imgs/cg/momo/momo_8.png", text: "Momo opuszcza kapsułę na dobre, jej ciało w końcu zjednoczyło się z mocą awatara. Jest teraz wojowniczką w dwóch światach - magicznej areny i prawdziwej rzeczywistości. Jej dotyk ma moc zarówno miecza, jak i czułości." },
        { id: 'momo_9', title: "Niezwyciężona Para", cg: "imgs/cg/momo/momo_9.png", text: "Razem stajecie się legendą areny. Momo, wojowniczka o sile tysięcy, i ty, jej partner, który nauczył ją, że prawdziwe zwycięstwo to nie dominacja, ale jedność. Wasz taniec w arenie staje się legendą, a złoto płynie strumieniami." }
    ]
};
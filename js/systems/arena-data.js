// Arena System Data Configuration
// Static data structures for arena minigame

// Create global namespace for arena data
window.ArenaData = window.ArenaData || {};

// Arena stat descriptions with tooltips
window.ArenaData.statDescriptions = {
    sila: {
        title: "Siła",
        description: "Każdy punkt siły dodaje +1 do mocy bojowej.\nMięśnie Momo napinają się pod wpływem intensywnego treningu.",
        effect: "Zwiększa obrażenia w walce i szanse na sukces w trudnych questach"
    },
    zrecznosc: {
        title: "Zręczność", 
        description: "Każdy punkt zręczności dodaje +1 do mocy bojowej.\nGracjowne ruchy Momo hipnotyzują przeciwników przed ciosem.",
        effect: "Wpływa na szanse na unikanie ataków i znalezienie lepszych przedmiotów"
    },
    inteligencja: {
        title: "Inteligencja",
        description: "Każdy punkt inteligencji dodaje +1 do mocy bojowej.\nMądre spojrzenie Momo przewiduje intencje wrogów.",
        effect: "Pozwala na lepsze rozpoznanie przeciwników i efektywniejsze wykorzystanie magicznych artefaktów"
    },
    szczescie: {
        title: "Szczęście",
        description: "Każdy punkt szczęścia dodaje +1 do mocy bojowej.\nBogowie uśmiechają się do Momo w krytycznych momentach.",
        effect: "Zwiększa szanse na krytyczne trafienia, znalezienie rzadkich przedmiotów i unikanie klątw"
    },
    cyce: {
        title: "Cyce",
        description: "Każdy punkt dodaje +2 do mocy bojowej (maksimum 10).\nPerfekcyjne piersi Momo rozpraszają przeciwników i dodają jej pewności siebie.",
        effect: "Naturalna broń uwodzenia i źródło niezmąconej pewności siebie"
    },
    dupa: {
        title: "Dupa", 
        description: "Każdy punkt dodaje +1.5 do mocy bojowej (maksimum 10).\nDoskonale wyrzeźbiona pupa zwiększa mobilność i grację w walce.",
        effect: "Wpływa na zwinność i zdolność do unikania ataków"
    },
    cipka: {
        title: "Status Cipki",
        description: "Obecny stan intymnych części Momo. Może się zmieniać w zależności od doświadczeń w arenie.",
        effect: "Może wpływać na interakcje z niektórymi przeciwnikami"
    },
    cipka_sensitivity: {
        title: "Wrażliwość",
        description: "Poziom wrażliwości cipki Momo. Wpływa na intensywność doznań podczas walki.",
        effect: "Wyższa wrażliwość = większa podatność na specjalne ataki"
    },
    cipka_wetness: {
        title: "Wilgotność",
        description: "Poziom podniecenia cipki Momo. Zwiększa się podczas intensywnych walk.",
        effect: "Wpływa na niektóre interakcje z przeciwnikami"
    },
    cipka_corruption: {
        title: "Korupcja",
        description: "Poziom moralnego upadku cipki Momo. Zwiększa się przy kontakcie z demonami.",
        effect: "Może odblokowywać specjalne zdolności ale zwiększa ryzyko"
    },
    cipka_magic_resistance: {
        title: "Odporność Magiczna",
        description: "Ochrona przed magicznymi efektami wpływającymi na cipkę Momo.",
        effect: "Zmniejsza ryzyko przekleństw i negatywnych efektów"
    },
    hp: {
        title: "Kondycja (HP)",
        description: "Fizyczna i mentalna wytrzymałość Momo. Spada podczas walki i wymaga odpoczynku gdy osiągnie zero.",
        effect: "Powolny spadek podczas aktywności. Regeneruje się podczas odpoczynku."
    },
    level: {
        title: "Poziom",
        description: "Doświadczenie bojowe Momo. Zwiększa się wraz z ukończonymi questami i pozwala na zdobycie lepszego ekwipunku.",
        effect: "Wyższy poziom odblokowuje trudniejsze questy z lepszymi nagrodami"
    },
    gold: {
        title: "Złoto",
        description: "Bogactwo zdobyte w arenie. Można je wykorzystać do różnych celów w grze.",
        effect: "Zdobywane za ukończone questy i kamienie milowe"
    },
    combat_power: {
        title: "Moc Bojowa",
        description: "Łączna siła bojowa Momo. Składa się z: Siła + Zręczność + Inteligencja + Szczęście + (Cyce × 2) + (Dupa × 1.5) + moc ekwipunku. Każdy punkt fizycznych atutów ma większy wpływ na walkę.",
        effect: "Wyższa moc bojowa = większe szanse na sukces w trudnych questach i lepsze nagrody"
    },
    status: {
        title: "Status",
        description: "Obecny stan Momo w arenie. Może być gotowa do walki, odpoczywać lub być wyczerpana.",
        effect: "Wyczerpanie wymaga odpoczynku przed kontynuowaniem działań"
    },
    experience: {
        title: "Doświadczenie",
        description: "Punkty doświadczenia zdobyte w walkach. Po zebraniu wystarczającej ilości Momo awansuje na wyższy poziom.",
        effect: "Każdy quest daje doświadczenie proporcjonalne do trudności"
    },
    quest_progress: {
        title: "Postęp Questa",
        description: "Aktualna aktywność Momo w arenie. Pokazuje, jak daleko zaszła w bieżącym zadaniu.",
        effect: "Po ukończeniu questa otrzymuje nagrodę i zaczyna nowy"
    },
    quests_completed: {
        title: "Ukończone Questy",
        description: "Łączna liczba zadań, które Momo ukończyła w arenie. Każdy quest zwiększa jej doświadczenie i reputation.",
        effect: "Co 10 ukończonych questów otrzymujesz bonus złota jako nagrodę za postęp"
    },
    total_deaths: {
        title: "Liczba Śmierci",
        description: "Ile razy Momo uległa w arenie. Każda porażka jest lekcją, która ją wzmacnia na przyszłość.",
        effect: "Śmierci nie mają trwałych kar, ale mogą wpływać na niektóre specjalne wydarzenia"
    },
    items_found: {
        title: "Znalezione Przedmioty",
        description: "Liczba przedmiotów, które Momo zdobyła podczas swoich przygód w arenie.",
        effect: "Lepszy ekwipunek zwiększa moc bojową i szanse na sukces w questach"
    },
    statystyki_bojowe: {
        title: "Statystyki Bojowe",
        description: "Główne umiejętności bojowe Momo. Każda statystyka wpływa na jej moc bojową i szanse na sukces w arenie.",
        effect: "Statystyki rosną poprzez walkę i ukończone questy. Wyższe wartości = lepsze wyniki w arenie"
    },
    ekwipunek: {
        title: "Ekwipunek",
        description: "Przedmioty, które Momo nosi w arenie. Każdy element ekwipunku dodaje moc bojową i specjalne bonusy.",
        effect: "Lepszy ekwipunek znacząco zwiększa szanse na sukces w trudnych questach"
    },
    atuty_fizyczne: {
        title: "Atuty Fizyczne",
        description: "Fizyczne walory Momo, które wpływają na jej moc bojową. Cyce mają podwójny wpływ (×2), a dupa półtorakrotny (×1.5).",
        effect: "Każdy punkt fizycznych atutów ma większy wpływ na walkę niż zwykłe statystyki"
    },
    detale_cipki: {
        title: "Detale Intymne",
        description: "Stan intymnych części Momo, który zmienia się w zależności od doświadczeń w arenie i wpływa na niektóre interakcje.",
        effect: "Różne stany mogą dawać bonusy lub specjalne efekty podczas walk i wydarzeń"
    },
    rekord: {
        title: "Rekord",
        description: "Statystyki osiągnięć Momo w arenie. Pokazują jej doświadczenie, porażki i zdobyczne.",
        effect: "Każde 10 ukończonych questów daje bonus złota. Przedmioty i śmierci wpływają na niektóre wydarzenia"
    }
};

// Equipment descriptions
window.ArenaData.equipmentDescriptions = {
    weapon: {
        title: "Broń",
        description: "Główne narzędzie bojowe Momo. Zwiększa jej siłę ataku i szanse na sukces w questach."
    },
    armor: {
        title: "Zbroja",
        description: "Ochrona dla ciała Momo. Redukuje obrażenia otrzymywane podczas walki."
    },
    accessory: {
        title: "Dodatek",
        description: "Dodatkowe wyposażenie wspierające Momo w walce. Może dawać specjalne bonusy."
    },
    artefakt: {
        title: "Artefakt",
        description: "Magiczny przedmiot o potężnych właściwościach. Dostarcza unikalne efekty bojowe."
    }
};

// Effect descriptions for magical items
window.ArenaData.effectDescriptions = {
    hp_regen: "Regeneruje HP podczas walki",
    stamina_boost: "Zwiększa wytrzymałość, zmniejsza spadek HP",
    mana_shield: "Tworzy magiczną tarczę absorbującą obrażenia",
    hp_boost: "Zwiększa maksymalne HP o 25%",
    fear_aura: "Przeciwnicy są osłabieni strachem",
    life_drain: "Wysysa życie z przeciwników podczas walki"
};

// Available quests
window.ArenaData.quests = [
    // Difficulty 1-3: Easy quests with 3 stages
    { 
        name: "Polowanie na Ślimaków", 
        monster: "Ślimak Ogrodowy", 
        difficulty: 1,
        objectives: [
            { 
                name: "Rekonesans Terenu", 
                description: "Obserwowanie i mapowanie terenu łowów", 
                type: "scout",
                target: 3,
                current: 0,
                targetName: "obserwacji",
                progressWeight: 25,
                perActionReward: { gold: 1, exp: 0.5 },
                completionReward: { gold: 5, exp: 2 },
                actionText: "Obserwacja obszaru"
            },
            { 
                name: "Eliminacja Małych Ślimaków", 
                description: "Polowanie na małe ślimaki w okolicy", 
                type: "hunt",
                target: 8,
                current: 0,
                targetName: "małych ślimaków",
                progressWeight: 45,
                perActionReward: { gold: 2, exp: 1 },
                completionReward: { gold: 15, exp: 8 },
                actionText: "Zabicie małego ślimaka"
            },
            { 
                name: "Pojedynek z Wodzem", 
                description: "Finalna walka ze Ślimakiem Ogrodowym", 
                type: "boss",
                target: 1,
                current: 0,
                targetName: "boss",
                progressWeight: 30,
                perActionReward: { gold: 0, exp: 0 },
                completionReward: { gold: 25, exp: 15, itemChance: 0.7 },
                actionText: "Faza walki z bossem"
            }
        ],
        finalReward: { gold: 50, exp: 30, itemChance: 0.8 }
    },
    { 
        name: "Stróż Biblioteki", 
        monster: "Książkowy Golem", 
        difficulty: 2,
        objectives: [
            { 
                name: "Infiltracja Biblioteki", 
                description: "Skradanie się przez korytarze biblioteki", 
                type: "scout",
                target: 4,
                current: 0,
                targetName: "infiltracji",
                progressWeight: 25,
                perActionReward: { gold: 2, exp: 1 },
                completionReward: { gold: 8, exp: 4 },
                actionText: "Sekretne przejście"
            },
            { 
                name: "Poszukiwania Wskazówek", 
                description: "Znajdowanie magicznych ksiąg z informacjami o Golemie", 
                type: "gather",
                target: 6,
                current: 0,
                targetName: "ksiąg",
                progressWeight: 45,
                perActionReward: { gold: 3, exp: 1.5 },
                completionReward: { gold: 18, exp: 12, itemChance: 0.4 },
                actionText: "Znalezienie wskazówki"
            },
            { 
                name: "Konfrontacja z Golemem", 
                description: "Epicki pojedynek z Książkowym Golemem", 
                type: "boss",
                target: 1,
                current: 0,
                targetName: "boss",
                progressWeight: 30,
                perActionReward: { gold: 0, exp: 0 },
                completionReward: { gold: 35, exp: 20, itemChance: 0.75 },
                actionText: "Faza walki z bossem"
            }
        ],
        finalReward: { gold: 65, exp: 40, itemChance: 0.85 }
    },
    { 
        name: "Szef Kuchni", 
        monster: "Wściekły Kucharz", 
        difficulty: 3,
        objectives: [
            { 
                name: "Obserwacja Kucharza", 
                description: "Studiowanie nawyków i rozporządków kuchni", 
                type: "scout",
                target: 5,
                current: 0,
                targetName: "obserwacji",
                progressWeight: 25,
                perActionReward: { gold: 3, exp: 1.5 },
                completionReward: { gold: 12, exp: 6 },
                actionText: "Obserwacja aktywności"
            },
            { 
                name: "Sabotaż Kuchni", 
                description: "Psowanie wyposażenia i składników kuchni", 
                type: "hunt",
                target: 10,
                current: 0,
                targetName: "sabotaży",
                progressWeight: 45,
                perActionReward: { gold: 4, exp: 2 },
                completionReward: { gold: 25, exp: 15, itemChance: 0.5 },
                actionText: "Akt sabotażu"
            },
            { 
                name: "Pojedynek z Kucharzem", 
                description: "Finalna konfrontacja z Wściekłym Kucharzem", 
                type: "boss",
                target: 1,
                current: 0,
                targetName: "boss",
                progressWeight: 30,
                perActionReward: { gold: 0, exp: 0 },
                completionReward: { gold: 45, exp: 25, itemChance: 0.8 },
                actionText: "Faza walki z bossem"
            }
        ],
        finalReward: { gold: 85, exp: 50, itemChance: 0.9 }
    },
    
    // Difficulty 4-6: Medium quests with 4 stages
    { 
        name: "Władca Myszy", 
        monster: "Król Szczurów", 
        difficulty: 4,
        stages: [
            { name: "Tropienie", description: "Wyszukiwanie śladów szczurów", duration: 45, questProgress: 20, rewards: { gold: 8, exp: 3 }, type: "scout" },
            { name: "Tępienie", description: "Eliminacja szczurzych strażników", duration: 70, questProgress: 35, rewards: { gold: 12, exp: 6, itemChance: 0.4 }, type: "hunt" },
            { name: "Infiltracja", description: "Wkraczanie do szczurzego królestwa", duration: 60, questProgress: 25, rewards: { gold: 10, exp: 4, itemChance: 0.3 }, type: "infiltrate" },
            { name: "Koronacja", description: "Obalenie Króla Szczurów", duration: 105, questProgress: 20, rewards: { gold: 30, exp: 15, itemChance: 0.8 }, type: "boss" }
        ]
    },
    { 
        name: "Strażnik Skarbca", 
        monster: "Żelazny Minotaur", 
        difficulty: 5,
        stages: [
            { name: "Zwiady", description: "Badanie zabezpieczeń skarbca", duration: 50, questProgress: 20, rewards: { gold: 10, exp: 4 }, type: "scout" },
            { name: "Pułapki", description: "Rozbrajanie mechanizmów obronnych", duration: 80, questProgress: 35, rewards: { gold: 15, exp: 8, itemChance: 0.45 }, type: "gather" },
            { name: "Przygotowania", description: "Szukanie słabości minotaura", duration: 65, questProgress: 25, rewards: { gold: 12, exp: 5, itemChance: 0.35 }, type: "prepare" },
            { name: "Starcie", description: "Walka z Żelaznym Minotaurem", duration: 110, questProgress: 20, rewards: { gold: 38, exp: 18, itemChance: 0.85 }, type: "boss" }
        ]
    },
    { 
        name: "Duch Piwnic", 
        monster: "Dręczyciel Marzeń", 
        difficulty: 6,
        stages: [
            { name: "Eksploracja", description: "Przeczesywanie ciemnych piwnic", duration: 55, questProgress: 20, rewards: { gold: 12, exp: 5 }, type: "scout" },
            { name: "Egzorcyzm", description: "Wypędzanie pomniejszych duchów", duration: 85, questProgress: 35, rewards: { gold: 18, exp: 10, itemChance: 0.5 }, type: "hunt" },
            { name: "Medytacja", description: "Przygotowanie umysłu na walkę", duration: 70, questProgress: 25, rewards: { gold: 15, exp: 6, itemChance: 0.4 }, type: "prepare" },
            { name: "Konfrontacja", description: "Pojedynek z Dręczycielem Marzeń", duration: 115, questProgress: 20, rewards: { gold: 45, exp: 21, itemChance: 0.9 }, type: "boss" }
        ]
    },
    
    // Difficulty 7-10: Hard quests with 5 stages
    { 
        name: "Błędny Rycerz", 
        monster: "Sir Zapomnialski", 
        difficulty: 7,
        stages: [
            { name: "Śledztwo", description: "Badanie historii rycerza", duration: 50, questProgress: 15, rewards: { gold: 12, exp: 5 }, type: "scout" },
            { name: "Podróż", description: "Tropienie błędnego rycerza", duration: 75, questProgress: 25, rewards: { gold: 18, exp: 8, itemChance: 0.4 }, type: "hunt" },
            { name: "Przygotowania", description: "Zdobywanie odpowiedniego ekwipunku", duration: 65, questProgress: 20, rewards: { gold: 15, exp: 6, itemChance: 0.5 }, type: "prepare" },
            { name: "Pojedynek", description: "Honorowa walka z Sir Zapomnialskiem", duration: 95, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.7 }, type: "boss" },
            { name: "Ocalenie", description: "Przywracanie pamięci rycerzowi", duration: 40, questProgress: 15, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "rescue" }
        ]
    },
    { 
        name: "Poranna Mgła", 
        monster: "Widmo Świtu", 
        difficulty: 8,
        stages: [
            { name: "Obserwacja", description: "Studiowanie wzorców mgły", duration: 55, questProgress: 15, rewards: { gold: 15, exp: 6 }, type: "scout" },
            { name: "Polowanie", description: "Ściganie mglistych manifestacji", duration: 80, questProgress: 25, rewards: { gold: 22, exp: 10, itemChance: 0.45 }, type: "hunt" },
            { name: "Rytualny krąg", description: "Przygotowanie magicznej pułapki", duration: 70, questProgress: 20, rewards: { gold: 18, exp: 8, itemChance: 0.55 }, type: "prepare" },
            { name: "Ucieleśnienie", description: "Zmuszanie Widma do materialnej formy", duration: 100, questProgress: 25, rewards: { gold: 35, exp: 15, itemChance: 0.75 }, type: "boss" },
            { name: "Rozproszenie", description: "Ostateczne unicestwienie widma", duration: 45, questProgress: 15, rewards: { gold: 25, exp: 11, itemChance: 0.65 }, type: "finish" }
        ]
    },
    { 
        name: "Rywalizacja Bogów", 
        monster: "Wyzwanie Olimpu", 
        difficulty: 9,
        stages: [
            { name: "Wezwanie", description: "Przyzywanie uwagi bogów", duration: 60, questProgress: 15, rewards: { gold: 18, exp: 7 }, type: "scout" },
            { name: "Próby", description: "Przechodzenie boskich testów", duration: 85, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.5 }, type: "trial" },
            { name: "Błogosławieństwa", description: "Otrzymywanie boskiej mocy", duration: 75, questProgress: 20, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "prepare" },
            { name: "Olimpijskie Wyzwanie", description: "Starcie z boską awatarą", duration: 105, questProgress: 25, rewards: { gold: 42, exp: 18, itemChance: 0.8 }, type: "boss" },
            { name: "Triumf", description: "Odbieranie boskich nagród", duration: 50, questProgress: 15, rewards: { gold: 30, exp: 14, itemChance: 0.7 }, type: "victory" }
        ]
    },
    { 
        name: "Smocza Zemsta", 
        monster: "Starożytny Smok", 
        difficulty: 10,
        stages: [
            { name: "Legenda", description: "Badanie smoczych kronik", duration: 65, questProgress: 15, rewards: { gold: 20, exp: 8 }, type: "scout" },
            { name: "Jaskinia", description: "Eksploracja smoczego legowiska", duration: 90, questProgress: 25, rewards: { gold: 32, exp: 14, itemChance: 0.55 }, type: "explore" },
            { name: "Skarb", description: "Zabezpieczanie smoczego skarbu", duration: 80, questProgress: 20, rewards: { gold: 25, exp: 10, itemChance: 0.65 }, type: "gather" },
            { name: "Przebudzenie", description: "Epicki pojedynek ze Starożytnym Smokiem", duration: 120, questProgress: 25, rewards: { gold: 50, exp: 22, itemChance: 0.9 }, type: "boss" },
            { name: "Legendarna Nagroda", description: "Zdobywanie smoczego artefaktu", duration: 55, questProgress: 15, rewards: { gold: 35, exp: 16, itemChance: 0.8 }, type: "treasure" }
        ]
    },
    
    // Special thematic quests (difficulty 4-9)
    { 
        name: "Taniec Amazonek", 
        monster: "Dzika Amazonka", 
        difficulty: 5,
        stages: [
            { name: "Obserwacja", description: "Studiowanie amazońskich rytualów", duration: 50, questProgress: 20, rewards: { gold: 10, exp: 4 }, type: "scout" },
            { name: "Wyzwanie", description: "Rzucanie wyzwania plemieniu", duration: 75, questProgress: 35, rewards: { gold: 15, exp: 8, itemChance: 0.45 }, type: "challenge" },
            { name: "Taniec Wojenny", description: "Uczestnictwo w rytuale bojowym", duration: 70, questProgress: 25, rewards: { gold: 12, exp: 5, itemChance: 0.4 }, type: "ritual" },
            { name: "Pojedynek", description: "Walka z Dziką Amazonką", duration: 110, questProgress: 20, rewards: { gold: 38, exp: 18, itemChance: 0.85 }, type: "boss" }
        ]
    },
    { 
        name: "Pojedynek Honoru", 
        monster: "Rycerka Dziewica", 
        difficulty: 4,
        stages: [
            { name: "Wyzwanie", description: "Rzucanie honorowego wyzwania", duration: 45, questProgress: 20, rewards: { gold: 8, exp: 3 }, type: "challenge" },
            { name: "Przygotowania", description: "Duchowe oczyszczenie przed walką", duration: 70, questProgress: 35, rewards: { gold: 12, exp: 6, itemChance: 0.4 }, type: "prepare" },
            { name: "Ceremonia", description: "Rytualne pobłogosławienie broni", duration: 60, questProgress: 25, rewards: { gold: 10, exp: 4, itemChance: 0.35 }, type: "ritual" },
            { name: "Szlachetny Pojedynek", description: "Honorowa walka z Rycerką Dziewicą", duration: 105, questProgress: 20, rewards: { gold: 30, exp: 15, itemChance: 0.8 }, type: "boss" }
        ]
    },
    { 
        name: "Pokusa Demona", 
        monster: "Succubus Kusicielka", 
        difficulty: 6,
        stages: [
            { name: "Pokusy", description: "Opieranie się demonicznym wizjom", duration: 55, questProgress: 20, rewards: { gold: 12, exp: 5 }, type: "resist" },
            { name: "Iluzje", description: "Przedzieranie się przez fałszywe rzeczywistości", duration: 80, questProgress: 35, rewards: { gold: 18, exp: 10, itemChance: 0.5 }, type: "illusion" },
            { name: "Oczyszczenie", description: "Wzmacnianie duchowej obrony", duration: 70, questProgress: 25, rewards: { gold: 15, exp: 6, itemChance: 0.4 }, type: "purify" },
            { name: "Konfrontacja", description: "Walka z Succubus Kusicielką", duration: 115, questProgress: 20, rewards: { gold: 45, exp: 21, itemChance: 0.9 }, type: "boss" }
        ]
    },
    { 
        name: "Władca Cieni", 
        monster: "Demon Żądzy", 
        difficulty: 7,
        stages: [
            { name: "Mroczne Ścieżki", description: "Nawigowanie przez królestwo cieni", duration: 50, questProgress: 15, rewards: { gold: 12, exp: 5 }, type: "navigate" },
            { name: "Cienie Przeszłości", description: "Walka z własnymi wspomnieniami", duration: 75, questProgress: 25, rewards: { gold: 18, exp: 8, itemChance: 0.4 }, type: "memory" },
            { name: "Mroczne Pakt", description: "Negocjacje z mniejszymi demonami", duration: 65, questProgress: 20, rewards: { gold: 15, exp: 6, itemChance: 0.5 }, type: "negotiate" },
            { name: "Władca", description: "Starcie z Demonem Żądzy", duration: 95, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.7 }, type: "boss" },
            { name: "Ucieczka", description: "Ucieczka z królestwa cieni", duration: 40, questProgress: 15, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "escape" }
        ]
    },
    { 
        name: "Posłaniec Niebios", 
        monster: "Anioł Stróż", 
        difficulty: 8,
        stages: [
            { name: "Modlitwa", description: "Wzywanie niebiańskiej uwagi", duration: 55, questProgress: 15, rewards: { gold: 15, exp: 6 }, type: "pray" },
            { name: "Próby Cnoty", description: "Udowadnianie moralnej wartości", duration: 80, questProgress: 25, rewards: { gold: 22, exp: 10, itemChance: 0.45 }, type: "virtue" },
            { name: "Oczyszczenie", description: "Duchowe przygotowanie na spotkanie", duration: 70, questProgress: 20, rewards: { gold: 18, exp: 8, itemChance: 0.55 }, type: "purify" },
            { name: "Niebiańska Próba", description: "Test mocy przeciw Aniołowi Stróżowi", duration: 100, questProgress: 25, rewards: { gold: 35, exp: 15, itemChance: 0.75 }, type: "boss" },
            { name: "Błogosławieństwo", description: "Otrzymywanie anielskiej łaski", duration: 45, questProgress: 15, rewards: { gold: 25, exp: 11, itemChance: 0.65 }, type: "blessing" }
        ]
    },
    { 
        name: "Czarodziejka Klątew", 
        monster: "Mroczna Wiedźma", 
        difficulty: 9,
        stages: [
            { name: "Badania", description: "Studiowanie zaklęć ochronnych", duration: 60, questProgress: 15, rewards: { gold: 18, exp: 7 }, type: "study" },
            { name: "Składniki", description: "Zdobywanie magicznych komponentów", duration: 85, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.5 }, type: "gather" },
            { name: "Kontr-zaklęcia", description: "Przygotowanie magicznej obrony", duration: 75, questProgress: 20, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "enchant" },
            { name: "Magiczny Pojedynek", description: "Starcie czarów z Mroczną Wiedźmą", duration: 105, questProgress: 25, rewards: { gold: 42, exp: 18, itemChance: 0.8 }, type: "boss" },
            { name: "Rozplątanie", description: "Odwracanie rzuconych klątw", duration: 50, questProgress: 15, rewards: { gold: 30, exp: 14, itemChance: 0.7 }, type: "dispel" }
        ]
    },
    { 
        name: "Klątwa Wiedźmy", 
        monster: "Stara Wiedźma", 
        difficulty: 7,
        stages: [
            { name: "Symptomy", description: "Rozpoznawanie działania klątwy", duration: 50, questProgress: 15, rewards: { gold: 12, exp: 5 }, type: "diagnose" },
            { name: "Źródło", description: "Tropienie pochodzenia klątwy", duration: 75, questProgress: 25, rewards: { gold: 18, exp: 8, itemChance: 0.4 }, type: "track" },
            { name: "Antidotum", description: "Przygotowanie magicznego leku", duration: 65, questProgress: 20, rewards: { gold: 15, exp: 6, itemChance: 0.5 }, type: "brew" },
            { name: "Konfrontacja", description: "Starcie ze Starą Wiedźmą", duration: 95, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.7 }, type: "boss" },
            { name: "Zniesienie", description: "Całkowite usunięcie klątwy", duration: 40, questProgress: 15, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "lift" }
        ]
    },
    { 
        name: "Próba Bogini", 
        monster: "Bogini Miłości", 
        difficulty: 9,
        stages: [
            { name: "Oddanie", description: "Udowadnianie prawdziwego oddania", duration: 60, questProgress: 15, rewards: { gold: 18, exp: 7 }, type: "devotion" },
            { name: "Uczucia", description: "Przechodzenie próby serc", duration: 85, questProgress: 25, rewards: { gold: 28, exp: 12, itemChance: 0.5 }, type: "emotion" },
            { name: "Ofiara", description: "Składanie wartościowej ofiary", duration: 75, questProgress: 20, rewards: { gold: 22, exp: 9, itemChance: 0.6 }, type: "sacrifice" },
            { name: "Boska Próba", description: "Ostateczny test przed Boginią Miłości", duration: 105, questProgress: 25, rewards: { gold: 42, exp: 18, itemChance: 0.8 }, type: "boss" },
            { name: "Miłosna Łaska", description: "Otrzymywanie boskiego błogosławieństwa", duration: 50, questProgress: 15, rewards: { gold: 30, exp: 14, itemChance: 0.7 }, type: "grace" }
        ]
    }
];

// Available items for drops and rewards
window.ArenaData.items = [
    { 
        name: "Zardzewiały Miecz", 
        type: "weapon", 
        power: 5, 
        rarity: "common",
        statDescription: "+5 do Siły Ataku",
        flavorText: "Ślady rdzy przypominają o niezliczonych walkach. Momo czuje ciężar historii w swojej dłoni."
    },
    { 
        name: "Skórzana Zbroja", 
        type: "armor", 
        power: 3, 
        rarity: "common",
        statDescription: "+3 do Obrony Fizycznej",
        flavorText: "Miękka skóra przylega do ciała Momo, dając poczucie bezpieczeństwa i seksowności."
    },
    { 
        name: "Miedziana Bransoleta", 
        type: "accessory", 
        power: 2, 
        rarity: "common",
        statDescription: "+2 do Mocy Magicznej",
        flavorText: "Prosty ornament, który rozgrzewa się pod wpływem emocji Momo."
    },
    { 
        name: "Stalowy Miecz", 
        type: "weapon", 
        power: 12, 
        rarity: "uncommon",
        statDescription: "+12 do Siły Ataku",
        flavorText: "Zimna stal kontrastuje z ciepłem ciała Momo. Każdy ruch jest precyzyjny i gracjowy."
    },
    { 
        name: "Kolczuga", 
        type: "armor", 
        power: 8, 
        rarity: "uncommon",
        statDescription: "+8 do Obrony Fizycznej",
        flavorText: "Metalowe ogniwa delikatnie masują skórę Momo podczas ruchu."
    },
    { 
        name: "Srebrny Pierścień", 
        type: "accessory", 
        power: 6, 
        rarity: "uncommon",
        statDescription: "+6 do Mocy Magicznej",
        flavorText: "Delikatny blask srebra odzwierciedla wewnętrzne światło Momo."
    },
    { 
        name: "Miecz Mocy", 
        type: "weapon", 
        power: 25, 
        rarity: "rare",
        statDescription: "+25 do Siły Ataku",
        flavorText: "Magiczna energia pulsuje w klindze, synchronizując się z biciem serca Momo."
    },
    { 
        name: "Płytowa Zbroja", 
        type: "armor", 
        power: 18, 
        rarity: "rare",
        statDescription: "+18 do Obrony Fizycznej",
        flavorText: "Lśniący metal odzwierciedla determinację w oczach Momo. Czuje się niepowstrzymana."
    },
    { 
        name: "Złoty Amulet", 
        type: "accessory", 
        power: 15, 
        rarity: "rare",
        statDescription: "+15 do Obrony Magicznej",
        flavorText: "Ciepłe złoto pulsuje w rytm serca Momo, chroniąc ją przed magicznymi wpływami."
    },
    { 
        name: "Klinga Smoków", 
        type: "weapon", 
        power: 50, 
        rarity: "legendary",
        statDescription: "+50 do Siły Ataku, +10 do Magii Ognia",
        flavorText: "Płomienie tańczą wokół ostrza, odzwierciedlając żar namiętności płonącej w sercu Momo."
    },
    { 
        name: "Zbroja Tytanów", 
        type: "armor", 
        power: 35, 
        rarity: "legendary",
        statDescription: "+35 do Obrony, Odporność na Krytyczne Trafienia",
        flavorText: "Pradawna moc chroni Momo przed wszelkim złem. Czuje się nieśmiertelna i niepowstrzymana."
    },
    { 
        name: "Korona Bogów", 
        type: "accessory", 
        power: 30, 
        rarity: "legendary",
        statDescription: "+30 do Wszystkich Statystyk",
        flavorText: "Moc absolutna kursuje przez żyły Momo. Świat wydaje się być w zasięgu jej dłoni."
    },
    { 
        name: "Magiczny Buttplug", 
        type: "artefakt", 
        power: 10, 
        rarity: "uncommon", 
        effect: "hp_regen",
        statDescription: "+10 do Magii, Regeneracja HP podczas walki",
        flavorText: "Pulsujący artefakt emanuje ciepłem, które rozchodzi się po całym ciele Momo."
    },
    { 
        name: "Perła Rozkoszy", 
        type: "artefakt", 
        power: 15, 
        rarity: "rare", 
        effect: "stamina_boost",
        statDescription: "+15 do Magii, Zwiększona Wytrzymałość",
        flavorText: "Opalizujące światło perły sprawia, że Momo czuje nieznane wcześniej pokłady energii."
    },
    { 
        name: "Kryształowa Różdżka", 
        type: "artefakt", 
        power: 20, 
        rarity: "rare", 
        effect: "mana_shield",
        statDescription: "+20 do Magii, Magiczna Tarcza",
        flavorText: "Kryształ wibruje w harmonii z magiczną aurą Momo, tworząc ochronną barierę."
    },
    { 
        name: "Amulet Wiecznej Młodości", 
        type: "artefakt", 
        power: 25, 
        rarity: "legendary", 
        effect: "hp_boost",
        statDescription: "+25 do Magii, +50% Maksymalnego HP",
        flavorText: "Strumień życiodajnej energii przepływa przez Momo, odnawiając jej młodość i witalność."
    },
    { 
        name: "Pierścień Dominacji", 
        type: "artefakt", 
        power: 12, 
        rarity: "rare", 
        effect: "fear_aura",
        statDescription: "+12 do Magii, Aura Strachu",
        flavorText: "Mroczna moc pierścienia przesycana jest energią kontroli. Momo czuje władztwo nad innymi."
    },
    { 
        name: "Klątwa Succubusa", 
        type: "artefakt", 
        power: 30, 
        rarity: "legendary", 
        effect: "life_drain",
        statDescription: "+30 do Magii, Wysysa Życie Przeciwników",
        flavorText: "Mroczna esencja succubusa splata się z duszą Momo, dając jej moc karmiącą się życiem innych."
    },
    { 
        name: "Buttplug Sukkubicy", 
        type: "accessory", 
        power: 18, 
        rarity: "rare",
        statDescription: "+10 do Obrony Magicznej, +5 do Wrażliwości",
        flavorText: "Sukkubicy w zasadzie podobało się, gdy Momo 'pozyskiwała' z niej ten przedmiot."
    },
    { 
        name: "Wibrujący Sztylet", 
        type: "weapon", 
        power: 14, 
        rarity: "uncommon",
        statDescription: "+14 do Ataku, +3 do Wrażliwości",
        flavorText: "Delikatne wibracje przechodzą przez rękę Momo, przypominając o innych zastosowaniach..."
    },
    { 
        name: "Koronka Nimfomanki", 
        type: "armor", 
        power: 12, 
        rarity: "rare",
        statDescription: "+8 do Obrony, +8 do Atrakcyjności",
        flavorText: "Przezroczysta koronka ledwo ukrywa to, co najważniejsze. Momo czuje się pewniej w swojej kobiecości."
    }
];
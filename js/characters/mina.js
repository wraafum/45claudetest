window.characterData = window.characterData || {}; window.characterData.mina = {
                        id: 'mina',
                        name: 'Mina',
                        title: 'Księżycowa Ćma',
                        unlocked: false,
                        unlockCost: 10000,
                        level: 0,
                        baseCost: 400,
                        costGrowth: 1.2,
                        baseLpPerSecond: 20,
                        bondPoints: 0,
                        baseBpPerSecond: 0.6,
                        storyProgress: 0,
                        avatar: 'imgs/avatars/mina_avatar.png',
                        image: 'imgs/characters/mina.png',
                        clickImage: 'imgs/click/mina_click.png',
                        bio: [ { threshold: 0, text: "Wesoła ćmokinka, złodziejka iskierek i wszelkiego światła. Przyciąga ją każda błyskotka i uwielbia nocne przygody." } ],
                        clickComments: ["Świeci się? Moje!", "Złapię każdy blask.", "Skaczmy w noc!"],
                        storyThresholds: [0, 1000, 5000, 15000],
                        storyEvents: [
                            { id: 'mina_1', title: "Błysk w Nocy", cg: "imgs/cg/mina/mina_1.png", text: "Na dworze zauważasz tajemniczy błysk. Podążasz za nim i trafiasz na roześmianą Minę, która szuka kolejnej świecącej zabawki." },
                            { id: 'mina_2', title: "Pościg za Światłem", cg: "imgs/cg/mina/mina_2.png", text: "Razem gonicie świetliki po ogrodach. Jej radosny śmiech odbija się echem, a każde przypadkowe dotknięcie budzi dreszcze." },
                            { id: 'mina_3', title: "Taniec na Dachach", cg: "imgs/cg/mina/mina_3.png", text: "Pod gwiazdami prowadzi cię na dachy dworu. Skacząc z gzymsu na gzyms, śmieje się i zachęca do szalonego tańca w świetle księżyca." },
                            { id: 'mina_4', title: "Blask Poranka", cg: "imgs/cg/mina/mina_4.png", text: "Gdy słońce zaczyna wschodzić, zasypia w twoich ramionach, prosząc byś przechował wszystkie znalezione błyskotki." }
                        ]
                    };

window.characterData = window.characterData || {}; window.characterData.alina = {
                        id: 'alina',
                        name: 'Alina',
                        title: 'Chimeryczna Łowczyni',
                        unlocked: false,
                        unlockCost: 0,
                        level: 0,
                        baseCost: 600,
                        costGrowth: 1.4,
                        baseLpPerSecond: 40,
                        bondPoints: 0,
                        baseBpPerSecond: 1.2,
                        storyProgress: 0,
                        avatar: 'imgs/avatars/alina_avatar.png',
                        image: 'imgs/characters/alina.png',
                        clickImage: 'imgs/click/alina_click.png',
                        bio: [
                            { threshold: 0, text: "Potężna chimera o trzech duszach – Aliny, Rhei i Terry. Pod grubą skórą kryje się pragnienie czułości i akceptacji." },
                            { threshold: 2, text: "W chwilach spokoju pozwala przemówić łagodnej Rhei, lecz w gniewie dominuje dzika Terra." }
                        ],
                        clickComments: ["Hrrr...", "Potrzebuję polowania.", "Twoja bliskość koi."],
                        storyThresholds: [0, 8000],
                        storyEvents: [
                            { id: 'alina_1', title: "Łowy w Noc", cg: "imgs/cg/alina/alina_1.png", text: "Alina prowadzi cię w głąb lasu. Jej ruchy są pewne i dzikie, a każde drgnienie mięśni świadczy o drapieżnej naturze. Gdy trop kończy się przy zwalonej skale, patrzy na ciebie żółtymi oczami. 'Czuję w tobie moc. Pokaż, jak polujesz' - warczy." },
                            { id: 'alina_2', title: "Między Formami", cg: "imgs/cg/alina/alina_2.png", text: "Po wspólnych łowach Alina zmienia się, jej ciało łagodnieje. 'To Rhea chce ci podziękować' - szepcze, tuląc się do ciebie. Przez chwilę możesz dotknąć delikatniejszej strony bestii." }
                        ]
                    };

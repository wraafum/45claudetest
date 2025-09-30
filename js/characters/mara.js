window.characterData = window.characterData || {}; window.characterData.mara = {
                        id: 'mara',
                        name: 'Mara',
                        title: 'Cicha Wyrocznia',
                        unlocked: false,
                        unlockCost: 35000,
                        level: 0,
                        baseCost: 600,
                        costGrowth: 1.28,
                        baseLpPerSecond: 40,
                        bondPoints: 0,
                        baseBpPerSecond: 1,
                        storyProgress: 0,
                        avatar: 'imgs/avatars/mara_avatar.png',
                        image: 'imgs/characters/mara.png',
                        clickImage: 'imgs/click/mara_click.png',
                        bio: [ { threshold: 0, text: "Tajemnicza faunka strzegąca świątyni snu. Jej spokojne spojrzenie skrywa wieki samotności." } ],
                        clickComments: ["Słucham snów...", "Niech cisza cię otuli.", "Czy widzisz moje wizje?"],
                        storyThresholds: [0, 1500, 8000, 25000],
                        storyEvents: [
                            { id: 'mara_1', title: "Szept Świątyni", cg: "imgs/cg/mara/mara_1.png", text: "W ruinach świątyni Mara otwiera oczy na twój głos. Jej spokojna aura koi twoje myśli." },
                            { id: 'mara_2', title: "Wędrówka przez Sny", cg: "imgs/cg/mara/mara_2.png", text: "Razem zaglądacie w wizje, które widzi tylko ona. W ciszy dzieli się z tobą fragmentami przyszłości." },
                            { id: 'mara_3', title: "Melodia Ciszy", cg: "imgs/cg/mara/mara_3.png", text: "Przy świetle księżyca gra na pradawnym instrumencie. Delikatne dźwięki niosą się po korytarzach, zbliżając was do siebie." },
                            { id: 'mara_4', title: "Świt Proroctwa", cg: "imgs/cg/mara/mara_4.png", text: "O świcie przepowiada ci ważne wydarzenie i prosi o ochronę. Jej zaufanie staje się początkiem głębszej więzi." }
                        ]
                    }

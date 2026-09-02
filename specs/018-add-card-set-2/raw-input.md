# Ruwe input: nieuwe vragen voor de Badzwanzen-set

Dit is de door de gebruiker aangeleverde, ruwe verzameling nieuwe vragen/opdrachten die moet
worden omgezet naar kaarten en toegevoegd aan de bestaande, in productie gebruikte
Badzwanzen-kaartenset (`badzwanzenCardSet` in `src/features/cards/data/badzwanzen-card-set.ts`),
net als bij feature 014 (`014-add-card-set`).

Zie `specs/014-add-card-set/spec.md` en de bijbehorende implementatie als precedent voor: het
kaarttype-format (Naam/Spel/Virus/Iedereen), `{player}`-tokens, ID-schema
(`bz-opdracht-*`/`bz-virus-*`/etc., uniek binnen de set), en de eis dat elke viruskaart een eigen,
unieke `liftText` (eindbericht) krijgt dat inhoudelijk verwijst naar het specifieke effect van dat
virus.

Let op: de eerste regel van de gebruikersinput was een instructie die zelf als eerste viruskaart
gelezen moet worden: "Virus iedereen praat vanaf nu met een harde G, 1 strafpunt als je het niet
doet" — dit is een virus-opdracht voor de hele groep ("iedereen"), geen los stuk tekst.

De input bevat drie aparte, doorlopend genummerde lijsten (elk herstart bij 1) — alle drie moeten
worden verwerkt, ook al overlappen de nummers.

---

## Lijst 1

Virus iedereen praat vanaf nu met een harde G 1 strafpunt als je het niet doet

1. Naam — Noem binnen 5 seconden een land waar je nog nooit bent geweest. Lukt het niet, 3 strafpunten.
2.  Spel — Iedereen noemt om de beurt een reden om te laat te komen. Wie niets meer weet krijgt 3 strafpunten. Naam begint.
3.  Naam — Wijs iemand aan die volgens jou het snelst zijn telefoon kwijt zou raken. Deze krijgt 3 strafpunten.
4.  Virus — Naam mag tot nader order alleen antwoorden met precies één woord. Elke extra woord kost 1 strafpunt.
5.  Spel — Stem allemaal tegelijk wie het slechtst zou zijn als ober. De persoon met de meeste stemmen krijgt 4 strafpunten.
6.  Naam — Geef 3 strafpunten aan degene die volgens jou het meest waarschijnlijk spontaan naar een ander land zou verhuizen.
7.  Iedereen — Neem 2 strafpunten als je ooit een smoes hebt verzonnen om onder een afspraak uit te komen.
8.  Naam — Noem de favoriete kleur van 3 spelers. Voor elke fout krijg je 2 strafpunten.
9.  Virus — Naam moet vanaf nu elk antwoord beginnen met "luister goed". Vergeten = 2 strafpunten.
10.  Spel — Noem om de beurt dingen die je nooit in een vliegtuig zou willen meemaken. Herhaling = 3 strafpunten.
11.  Naam — Kies twee spelers die 30 seconden niet mogen lachen. Wie lacht krijgt 3 strafpunten.
12.  Iedereen — Wie ooit zijn eigen verjaardag is vergeten, neemt 2 strafpunten.
13.  Spel — Stem tegelijk wie het beste een restaurant zou kunnen runnen. Deze mag 4 strafpunten uitdelen.
14.  Naam — Geef 1 strafpunt aan iedere speler wiens naam je verkeerd spelt.
15.  Virus — Naam moet vanaf nu antwoorden alsof hij/zij een sportcommentator is. Elke normale zin = 2 strafpunten.
16.  Naam — Noem binnen 10 seconden vijf dingen die je in een rugzak kunt vinden. Minder dan vijf = 4 strafpunten.
17.  Spel — Iedereen noemt een reden waarom iemand ontslagen kan worden. Herhaling = 4 strafpunten.
18.  Naam — Wijs de meest chaotische speler aan. Deze krijgt 4 strafpunten.
19.  Iedereen — Wie ooit een verkeerde trein/bus heeft genomen krijgt 3 strafpunten.
20.  Naam — Geef 5 strafpunten aan degene die volgens jou het slechtst kan liegen.
21.  Spel — Noem om de beurt Nederlandse snacks. Wie niets meer weet krijgt 4 strafpunten.
22.  Virus — Naam mag het woord "ik" niet meer gebruiken. Elke keer dat het toch gebeurt: 2 strafpunten.
23.  Naam — Raad welke speler het laatst wakker wordt op een vrije dag. Goed = die speler krijgt 3 strafpunten.
24.  Iedereen — Neem 2 strafpunten als je ooit een wekker hebt gezet voor iets en hem daarna direct hebt uitgezet.
25.  Spel — Stem wie het meest waarschijnlijk een wereldreis zou maken. Deze krijgt 3 strafpunten.
26.  Naam — Noem drie dingen die je absoluut niet op een bruiloft moet doen. Minder dan drie = 3 strafpunten.
27.  Virus — Iedereen moet vanaf nu eindigen met "chef". Vergeten = 1 strafpunt.
28.  Naam — Geef 2 strafpunten aan degene die volgens jou het meest competitief is met spelletjes.
29.  Spel — Noem om de beurt winkels die je in een winkelcentrum kunt vinden. Herhaling = 3 strafpunten.
30.  Naam — Kies iemand. Deze moet 15 seconden volledig serieus naar je kijken. Wie als eerste lacht krijgt 4 strafpunten.
31.  Iedereen — Als je ooit een cadeau hebt gekregen dat je eigenlijk niet leuk vond: 3 strafpunten.
32.  Naam — Noem binnen 5 seconden een dier met de letter S. Geen antwoord = 3 strafpunten.
33.  Spel — Stem wie het meest waarschijnlijk per ongeluk zijn vlucht zou missen. Deze krijgt 5 strafpunten.
34.  Virus — Naam moet vanaf nu iedere vraag beantwoorden met een tegenvraag. Niet gedaan = 2 strafpunten.
35.  Naam — Geef 4 strafpunten aan de persoon die volgens jou het beste kan improviseren.
36.  Spel — Noem om de beurt dingen die je bij een tankstation kunt kopen. Herhaling = 3 strafpunten.
37.  Naam — Vertel je slechtste gewoonte. Weigeren = 4 strafpunten.
38.  Iedereen — Wie ooit zijn sleutels kwijt is geweest terwijl ze in zijn zak zaten krijgt 2 strafpunten.
39.  Naam — Wijs iemand aan die volgens jou het vaakst impulsieve beslissingen maakt. 3 strafpunten.
40.  Virus — Naam moet vanaf nu met overdreven enthousiasme praten. Niet enthousiast genoeg = 1 strafpunt.
41.  Spel — Iedereen noemt een reden om een feestje te verlaten. Wie niets meer weet krijgt 3 strafpunten.
42.  Naam — Geef 5 strafpunten aan degene die volgens jou het beste een geheim kan bewaren.
43.  Iedereen — Wie ooit een bericht naar de verkeerde groepschat stuurde krijgt 4 strafpunten.
44.  Naam — Noem drie spelers hun favoriete drankje. Voor iedere fout 2 strafpunten.
45.  Virus — Naam mag tot nader order niet meer knikken. Toch knikken = 2 strafpunten.
46.  Spel — Stem wie het meest waarschijnlijk beroemd zou worden. Deze krijgt 3 strafpunten.
47.  Naam — Doe 10 seconden alsof je een nieuwsbericht presenteert over wat er nu aan tafel gebeurt. Weigeren = 5 strafpunten.
48.  Iedereen — Wie ooit een hele dag zonder reden in bed is gebleven krijgt 3 strafpunten.
49.  Spel — Noem om de beurt dingen die je bij een verhuizing nodig hebt. Herhaling = 4 strafpunten.
50.  Naam — Geef 3 strafpunten aan degene die volgens jou het slechtst kaart kan spelen.

51. Virus — Naam moet vanaf nu iedere zin eindigen met "einde bericht". Vergeten = 2 strafpunten.
52. Spel — Stem wie het eerst een eigen huis zou kopen. Deze krijgt 4 strafpunten.
53. Naam — Noem binnen 7 seconden vier Europese hoofdsteden. Lukt het niet, 4 strafpunten.
54. Iedereen — Wie ooit een drankje over zichzelf heeft gemorst krijgt 2 strafpunten.
55. Naam — Kies iemand die volgens jou het beste kan koken. Deze mag 3 strafpunten uitdelen.
56. Spel — Noem om de beurt dingen die je in een apotheek kunt kopen. Herhaling = 3 strafpunten.
57. Virus — Naam moet vanaf nu alles fluisterend zeggen. Hardop = 2 strafpunten.
58. Naam — Geef 1 strafpunt aan iedere speler die volgens jou vandaag te weinig heeft gelachen.
59. Spel — Stem wie het meest waarschijnlijk een verkeerde hotelkamer binnenloopt. Deze krijgt 4 strafpunten.
60. Naam — Noem drie landen die beginnen met dezelfde letter. Lukt het niet = 4 strafpunten.
61. Iedereen — Wie ooit een film heeft aangezet en binnen 10 minuten in slaap viel krijgt 2 strafpunten.
62. Virus — Naam mag vanaf nu alleen antwoorden met "absoluut" of "waarschijnlijk". Elke andere reactie = 2 strafpunten.
63. Spel — Noem om de beurt beroepen waarvoor je een uniform draagt. Herhaling = 3 strafpunten.
64. Naam — Geef 5 strafpunten aan degene die volgens jou het snelst rijk zou kunnen worden.
65. Naam — Kies iemand. Die persoon moet 20 seconden een overdreven chique accent gebruiken. Elke fout = 1 strafpunt.
66. Iedereen — Wie ooit een hele serie opnieuw heeft gekeken krijgt 3 strafpunten.
67. Spel — Stem wie het meest waarschijnlijk zijn eigen bedrijf zou beginnen. Deze krijgt 4 strafpunten.
68. Naam — Noem vijf dingen die je in een hotel niet mag meenemen. Minder dan vijf = 3 strafpunten.
69. Virus — Naam moet vanaf nu bij iedere slok "proost" zeggen. Vergeten = 2 strafpunten.
70. Spel — Noem om de beurt soorten pizza. Herhaling = 3 strafpunten.
71. Naam — Wijs degene aan die volgens jou het slechtst tegen kritiek kan. 3 strafpunten.
72. Iedereen — Als je ooit expres te laat hebt gereageerd op een bericht: 3 strafpunten.
73. Naam — Geef 2 strafpunten aan degene die volgens jou het meest waarschijnlijk een loterijwinst zou verspillen.
74. Spel — Noem om de beurt dingen die je op een camping kunt vinden. Herhaling = 3 strafpunten.
75. Virus — Naam mag niemand meer bij zijn/haar voornaam noemen. Elke fout = 2 strafpunten.
76. Naam — Vertel iets waar je vroeger bang voor was. Weigeren = 3 strafpunten.
77. Spel — Stem wie het beste zou zijn als burgemeester. Deze krijgt 3 strafpunten.
78. Iedereen — Wie ooit een plant heeft laten doodgaan krijgt 2 strafpunten.
79. Naam — Noem binnen 5 seconden een bekend persoon met dezelfde voornaam als een speler. Geen antwoord = 3 strafpunten.
80. Virus — Naam moet vanaf nu praten alsof hij/zij een robot is. Elke normale zin = 2 strafpunten.
81. Spel — Noem om de beurt dingen die je bij een dokter kunt aantreffen. Herhaling = 3 strafpunten.
82. Naam — Geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk een datingprogramma zou winnen.
83. Iedereen — Wie ooit een bericht heeft gestuurd en daarna meteen spijt had krijgt 3 strafpunten.
84. Naam — Kies iemand die volgens jou het beste kan dansen. Deze moet 15 seconden dansen.
85. Spel — Stem wie het snelst een nieuwe hobby zou oppakken. Deze krijgt 3 strafpunten.
86. Virus — Naam moet vanaf nu iedere zin beginnen met "naar mijn mening". Vergeten = 2 strafpunten.
87. Naam — Noem de schoenmaat van twee spelers. Per fout 2 strafpunten.
88. Spel — Noem om de beurt dingen die je bij een barbecue nodig hebt. Herhaling = 4 strafpunten.
89. Iedereen — Wie ooit een wachtwoord is vergeten dat hij/zij zelf had bedacht krijgt 2 strafpunten.
90. Naam — Geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een impulsieve vakantie boekt.
91. Spel — Stem wie het beste een escape room zou kunnen oplossen. Deze krijgt 4 strafpunten.
92. Naam — Noem drie dingen die je absoluut niet tegen je baas moet zeggen. Minder dan drie = 3 strafpunten.
93. Virus — Naam moet vanaf nu iedere keer als iemand hem/haar aankijkt "wat kijk je?" zeggen. Vergeten = 1 strafpunt.
94. Spel — Noem om de beurt merken die je in een supermarkt ziet. Herhaling = 3 strafpunten.
95. Naam — Wijs de speler aan die volgens jou het meeste geduld heeft. Deze mag 3 strafpunten uitdelen.
96. Iedereen — Wie ooit een wekker van iemand anders heeft uitgezet krijgt 3 strafpunten.
97. Naam — Raad wie van de spelers het langst zonder vakantie zou kunnen. Deze krijgt 3 strafpunten.
98. Virus — Naam moet vanaf nu ieder antwoord afsluiten met "snap je?" Vergeten = 2 strafpunten.
99. Spel — Stem wie het slechtst zou zijn in een survivalprogramma. Deze krijgt 5 strafpunten.
100. Naam — Noem vijf voorwerpen die je in een keuken vindt. Minder dan vijf = 4 strafpunten.

---

## Lijst 2

1. Naam kies iemand die volgens jou het snelst zijn baan zou opzeggen en geef die 3 strafpunten
2. Spel stem allemaal tegelijk wie het slechtst kan liegen zonder te lachen, deze krijgt 4 strafpunten
3. Naam noem binnen 5 seconden 5 dingen die je absoluut niet in je broekzak wilt vinden, anders 4 strafpunten
4. Virus naam mag tot nader order alleen antwoorden met woorden die beginnen met de letter B, anders 2 strafpunten
5. Iedereen die ooit zijn eigen naam verkeerd heeft gespeld in een bericht neemt 2 strafpunten
6. Naam kies twee spelers die elkaar 20 seconden moeten aankijken, de eerste die lacht neemt 3 strafpunten
7. Spel noem om de beurt dingen die je nooit op een begrafenis zou zeggen, degene die niets meer weet neemt 4 strafpunten
8. Naam geef 3 strafpunten aan degene die volgens jou het slechtst kaart kan spelen
9. Virus naam moet na iedere slok een buiging maken, vergeten is 2 strafpunten
10. De speler met de meeste sleutels aan zijn sleutelbos neemt 3 strafpunten
11. Naam doe alsof je een nieuwsbericht brengt over wat er momenteel aan tafel gebeurt, groep beslist of het goed genoeg was
12. Spel stem tegelijk wie het waarschijnlijkst een wereldreis zou maken zonder plan, deze krijgt 4 strafpunten
13. Naam noem 3 dingen die je met een vork kunt doen behalve eten, lukt dit niet 3 strafpunten
14. Virus naam moet tot nader order alles zeggen alsof het een geheim is
15. Iedereen die ooit een verkeerde naam heeft genoemd tijdens een gesprek neemt 3 strafpunten
16. Naam kies iemand die 30 seconden lang niet mag lachen, iedereen probeert hem aan het lachen te maken
17. Spel noem om de beurt landen zonder de letter E, degene die vastloopt krijgt 3 strafpunten
18. Naam geef 2 strafpunten aan degene die volgens jou het meest impulsief is
19. Virus iedereen moet bij het woord "drinken" zijn glas optillen, vergeet je het 1 strafpunt
20. De persoon met de meeste zakken in zijn kleding mag 4 strafpunten uitdelen
21. Naam vertel een verhaal van precies 10 woorden, de groep telt mee
22. Spel stem wie het meest waarschijnlijk een geheim per ongeluk zou verklappen, deze krijgt 3 strafpunten
23. Virus naam moet vanaf nu alles eindigen met "chef", anders 2 strafpunten
24. Iedereen die ooit een wekker heeft gezet om iets te doen en het daarna compleet vergeten is neemt 2 strafpunten
25. Naam kies iemand die een reclame voor zijn eigen glas moet maken
26. Spel noem om de beurt dingen die je in een vliegtuig niet wilt horen, herhaling is 3 strafpunten
27. Naam geef 5 strafpunten aan iemand die volgens jou het meest zou overleven in een zombie-apocalyps
28. Virus naam mag alleen antwoorden met maximaal 4 woorden
29. Iedereen die ooit een bestelling heeft geplaatst en daarna spijt kreeg neemt 2 strafpunten
30. Naam moet binnen 10 seconden drie beroepen uitbeelden zonder te praten
31. Spel stem wie het meest waarschijnlijk te laat op zijn eigen verjaardag zou komen, deze krijgt 3 strafpunten
32. Naam noem het favoriete eten van naam, fout betekent 3 strafpunten
33. Virus naam moet na iedere vraag eerst "interessante vraag" zeggen
34. De speler met de grootste schoenmaat mag 3 strafpunten uitdelen
35. Naam kies iemand die een dramatische speech moet houden over waarom zijn glas belangrijk is
36. Spel noem om de beurt dingen die je in een spookhuis kunt tegenkomen
37. Iedereen met een foto van een dier als achtergrond neemt 2 strafpunten
38. Naam geef 4 strafpunten aan degene die volgens jou het beste geheim kan bewaren
39. Virus naam moet elke keer dat iemand lacht ook lachen
40. Iedereen die ooit een film heeft opgezocht omdat hij niet wist waar die over ging neemt 2 strafpunten
41. Naam zeg een woord dat rijmt op de naam van iedere speler, fout is 2 strafpunten
42. Spel noem om de beurt dingen die je op een luchthaven kwijt kunt raken
43. Virus naam mag niemand meer aanspreken met zijn echte naam
44. Naam laat iemand een willekeurig woord kiezen en gebruik dat woord in een verkooppraatje
45. De speler die het meest recent iets online heeft besteld krijgt 3 strafpunten
46. Spel stem wie het beste een leugen zou kunnen vertellen zonder betrapt te worden
47. Naam geef 3 strafpunten aan iemand die volgens jou het slechtst kan dansen
48. Virus naam moet vanaf nu alles in de verleden tijd vertellen
49. Iedereen die ooit een bericht heeft gestuurd en meteen daarna zijn telefoon op vliegtuigstand heeft gezet neemt 3 strafpunten
50. Naam noem 5 dingen die je in een pretpark kunt kopen, binnen 7 seconden

51. Spel noem om de beurt dingen die je nooit in een koelkast zou verwachten
52. Naam kies iemand die 15 seconden moet doen alsof hij een robot is
53. Virus naam moet elke keer als hij drinkt "missie volbracht" zeggen
54. Iedereen die ooit zijn telefoon heeft laten vallen op zijn gezicht neemt 3 strafpunten
55. Naam geef 5 strafpunten aan degene die volgens jou het meest eigenwijs is
56. Spel stem wie het meest waarschijnlijk zonder voorbereiding op vakantie zou vertrekken
57. Naam noem binnen 5 seconden 4 rode dingen
58. Virus naam mag vanaf nu alleen maar fluisteren als iemand naar hem kijkt
59. De speler met de minste batterij mag 4 strafpunten uitdelen
60. Naam laat iemand een dier kiezen en beeld dit dier 10 seconden uit
61. Spel noem om de beurt dingen die je op een zolder kunt vinden
62. Naam kies iemand die een compliment moet geven aan zijn linkerbuurman alsof hij een datingcoach is
63. Iedereen die ooit een wachtwoord is vergeten dat hij zelf had bedacht neemt 2 strafpunten
64. Virus naam moet voor iedere zin eerst een diepe zucht geven
65. Naam geef 2 strafpunten aan iemand die volgens jou het slechtst tegen verliezen kan
66. Spel stem wie het meest waarschijnlijk een hele dag zonder eten kan vergeten
67. Naam noem 5 soorten fruit zonder de letter A te gebruiken
68. Virus naam moet iedereen aanspreken alsof hij een middeleeuwse koning is
69. De speler die het laatst een foto heeft gemaakt neemt 3 strafpunten
70. Naam vertel een verhaal waarin de woorden "olifant", "pizza" en "politie" voorkomen
71. Spel noem om de beurt dingen die je bij een tankstation kunt kopen
72. Naam geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk beroemd zou worden
73. Virus naam moet na iedere zin een dierengeluid maken
74. Iedereen die ooit zijn eigen telefoonnummer naar zichzelf heeft gestuurd neemt 2 strafpunten
75. Naam kies iemand die 20 seconden moet praten zonder het woord "ik" te gebruiken
76. Spel stem wie het beste zou zijn als leraar
77. Naam noem 3 films zonder het woord "de" of "the" te gebruiken
78. Virus naam moet vanaf nu doen alsof hij/zij extreem haast heeft
79. De persoon met de langste achternaam mag 5 strafpunten uitdelen
80. Naam geef 3 strafpunten aan iemand die volgens jou het snelst zou verdwalen
81. Spel noem om de beurt dingen die je op een camping nodig hebt
82. Naam moet een slechte openingszin bedenken voor de persoon tegenover hem
83. Virus naam mag vanaf nu alleen vragen beantwoorden met een tegenvraag
84. Iedereen die ooit een verkeerde afslag heeft genomen terwijl hij dacht dat hij goed zat neemt 2 strafpunten
85. Naam kies iemand die zijn beste imitatie van een beroemd persoon moet doen
86. Spel stem wie het meest waarschijnlijk zijn eigen verjaardag zou vergeten
87. Naam noem binnen 5 seconden 5 woorden met twee lettergrepen
88. Virus naam moet bij iedere strafpunt die iemand krijgt "terecht" zeggen
89. De speler die het laatst naar muziek heeft geluisterd neemt 3 strafpunten
90. Naam geef 5 strafpunten aan degene die volgens jou het meest chaotisch is
91. Spel noem om de beurt dingen die je op een rommelmarkt kunt vinden
92. Naam vertel een mop alsof je hem op een podium voor 1.000 mensen vertelt
93. Virus naam moet vanaf nu iedere zin beginnen met "volgens mij"
94. Iedereen die ooit een film halverwege heeft uitgezet omdat hij saai was neemt 2 strafpunten
95. Naam noem 5 dingen die rond zijn binnen 8 seconden
96. Spel stem wie het meest waarschijnlijk een geheime identiteit zou hebben
97. Virus naam mag geen woorden gebruiken die eindigen op een klinker
98. Naam geef 3 strafpunten aan degene die volgens jou het beste kan onderhandelen
99. De speler met de meeste notificaties op zijn telefoon neemt 4 strafpunten
100. Naam kies iemand die een minuut lang moet doen alsof hij een persoonlijke bodyguard heeft

101. Spel noem om de beurt dingen die je in een apotheek kunt vinden
102. Naam noem de favoriete kleur van iedere speler, voor elke fout 1 strafpunt
103. Virus naam moet vanaf nu alles beantwoorden alsof hij een sollicitatiegesprek voert
104. Iedereen die ooit een cadeau heeft gekregen dat hij eigenlijk niet leuk vond neemt 2 strafpunten
105. Naam geef 5 strafpunten aan degene die volgens jou het slechtst kan multitasken
106. Spel stem wie het meest waarschijnlijk spontaan een tatoeage zou laten zetten
107. Naam noem binnen 10 seconden 6 landen die eindigen op een klinker
108. Virus naam mag tot nader order alleen met zijn linkerhand wijzen
109. De speler met de oudste broek neemt 3 strafpunten
110. Naam laat iemand een willekeurig object pakken en verzin er een compleet nieuwe functie voor
111. Spel noem om de beurt dingen die je tijdens een sollicitatiegesprek nooit moet zeggen
112. Naam kies iemand die zijn meest overdreven boze gezicht moet laten zien
113. Virus naam moet iedere keer dat hij gaat zitten eerst "landing" zeggen
114. Iedereen die ooit een hele dag in dezelfde kleding heeft rondgelopen neemt 2 strafpunten
115. Naam geef 4 strafpunten aan degene die volgens jou het meest dramatisch reageert
116. Spel stem wie het beste zou zijn als president van deze groep
117. Naam noem 5 dingen die je kunt breken zonder ze aan te raken
118. Virus naam moet vanaf nu praten alsof hij een sportcommentator is
119. De speler met de meeste foto's van eten in zijn galerij neemt 3 strafpunten
120. Naam vertel wat je zou doen als je morgen wakker werd met 1 miljoen euro
121. Spel noem om de beurt dingen die je niet op een bruiloft wilt meemaken
122. Naam geef 3 strafpunten aan iemand die volgens jou het meest waarschijnlijk een weddenschap zou verliezen
123. Virus naam mag alleen antwoorden met woorden van maximaal 5 letters
124. Iedereen die ooit een serie heeft gebinged tot diep in de nacht neemt 3 strafpunten
125. Naam kies iemand die een minuut lang moet doen alsof hij een beroemdheid is
126. Spel stem wie het meest waarschijnlijk een eigen restaurant zou beginnen
127. Naam noem 4 dingen die je in een garage kunt horen
128. Virus naam moet bij iedere slok zijn glas met twee handen vasthouden
129. De persoon die het laatst zijn bed heeft opgemaakt neemt 2 strafpunten
130. Naam geef 5 strafpunten aan degene die volgens jou het meest koppig is
131. Spel noem om de beurt dingen die je bij een dokter kunt zeggen
132. Naam verzin een nieuwe naam voor iedere speler, de groep stemt welke het beste is
133. Virus naam moet vanaf nu praten alsof hij een slechte detective is
134. Iedereen die ooit een bericht heeft gestuurd en daarna hoopte dat de ontvanger het niet zou zien neemt 2 strafpunten
135. Naam noem 5 dingen die je in een zwembad kunt vinden
136. Spel stem wie het meest waarschijnlijk zijn portemonnee ergens zou laten liggen
137. Naam kies iemand en geef hem een fictieve prijs met een zelfbedachte categorie
138. Virus naam mag geen woorden gebruiken met meer dan 6 letters
139. De speler met de meeste openstaande apps neemt 3 strafpunten
140. Naam geef 4 strafpunten aan degene die volgens jou het beste een smoes kan verzinnen
141. Spel noem om de beurt dingen die je op een festivalbandje zou kunnen schrijven
142. Naam moet een denkbeeldige klantenserviceklacht oplossen die door de groep wordt bedacht
143. Virus naam moet iedere zin afsluiten met "einde bericht"
144. Iedereen die ooit midden in een verhaal vergeten is waar hij naartoe wilde neemt 2 strafpunten
145. Naam noem binnen 10 seconden 5 dingen die je kunt verliezen
146. Spel stem wie het meest waarschijnlijk een eigen podcast zou beginnen
147. Virus naam mag vanaf nu alleen praten alsof hij een robot probeert te overtuigen dat hij mens is
148. Naam geef 3 strafpunten aan degene die volgens jou het meest slecht tegen kritiek kan
149. De speler die het laatst zijn kamer heeft opgeruimd neemt 3 strafpunten
150. Naam kies iemand die een minuut lang reclame moet maken voor een willekeurig voorwerp op tafel
151. Spel noem om de beurt dingen die je tijdens een roadtrip nodig hebt
152. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk zijn sleutels kwijtraakt
153. Virus naam moet vanaf nu iedere vraag beantwoorden alsof hij op een persconferentie zit
154. Iedereen die ooit een bericht heeft verwijderd omdat het te gênant was neemt 3 strafpunten
155. Naam noem 5 woorden die beginnen met dezelfde letter als jouw voornaam
156. Spel stem wie het meest waarschijnlijk een eigen kledingmerk zou beginnen
157. Naam kies iemand die 20 seconden moet uitleggen waarom zijn schoenen revolutionair zijn
158. Virus naam mag vanaf nu alleen antwoorden met "waarschijnlijk wel" of "waarschijnlijk niet"
159. De speler die het meest recent heeft gedoucht neemt 2 strafpunten
160. Naam geef 4 strafpunten aan degene die volgens jou het meest competitief is
161. Spel noem om de beurt dingen die je in een hotel liever niet onder je bed vindt
162. Naam vertel je leven alsof het een filmtrailer is
163. Virus naam moet iedere keer als iemand zijn naam zegt een applausje geven
164. Iedereen die ooit zijn telefoon heeft gezocht terwijl hij hem al in zijn hand had neemt 3 strafpunten
165. Naam noem 5 beroepen die je absoluut niet zou kunnen uitvoeren
166. Spel stem wie het meest waarschijnlijk zonder kaart kan verdwalen in zijn eigen stad
167. Naam geef 3 strafpunten aan degene die volgens jou het beste een feestje kan organiseren
168. Virus naam moet vanaf nu alles zeggen met overdreven enthousiasme
169. De speler die de meeste tabs in zijn browser open heeft staan neemt 4 strafpunten
170. Naam kies iemand en verzin een compleet nieuw festival speciaal voor die persoon
171. Spel noem om de beurt dingen die je op een verlaten eiland zou kunnen bouwen
172. Naam noem binnen 7 seconden 5 woorden die eindigen op "-en"
173. Virus naam moet iedere keer als hij een naam hoort salueren
174. Iedereen die ooit een bericht naar de verkeerde groepschat heeft gestuurd neemt 4 strafpunten
175. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een weddenschap aangaat
176. Spel stem wie het beste zou zijn als rechercheur
177. Naam beschrijf je linkerbuurman alsof je hem moet verkopen op een veilingsite
178. Virus naam mag vanaf nu alleen praten in korte zinnen van maximaal 3 woorden
179. De speler met de meeste kleding aan neemt 3 strafpunten
180. Naam kies iemand die 10 seconden lang een zelfverzonnen volkslied moet zingen
181. Spel noem om de beurt dingen die je tijdens een verhuizing kwijt kunt raken
182. Naam geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk een verkeerde beslissing neemt
183. Virus naam moet iedere zin beginnen met "luister goed"
184. Iedereen die ooit een hele maaltijd heeft gegeten zonder zijn telefoon weg te leggen neemt 2 strafpunten
185. Naam noem 6 dingen die je in een supermarkt kunt kopen zonder het woord "eten" te gebruiken
186. Spel stem wie het meest waarschijnlijk een geheime kamer in zijn huis zou hebben
187. Naam laat iemand een object kiezen en geef het object een persoonlijkheid
188. Virus naam moet vanaf nu alles zeggen alsof hij een voetbaltrainer is
189. De speler die het laatst een selfie heeft gemaakt neemt 3 strafpunten
190. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een weddenschap zou verzinnen
191. Spel noem om de beurt dingen die je in een museum niet mag aanraken
192. Naam kies iemand die 30 seconden lang alleen in rijm mag praten
193. Virus naam mag vanaf nu niet meer het woord "goed" gebruiken
194. Iedereen die ooit midden in een gesprek "waar hadden we het ook alweer over?" heeft gezegd neemt 2 strafpunten
195. Naam noem 5 dingen die je in een koffer stopt maar niet in een rugzak
196. Spel stem wie het meest waarschijnlijk een realityshow zou winnen
197. Naam geef 3 strafpunten aan degene die volgens jou het meest onverwachte talent heeft
198. Virus naam moet iedere keer als hij drinkt zijn glas naar de hemel heffen
199. Naam kies twee spelers: zij moeten samen een nieuwe handshake verzinnen binnen 20 seconden, lukt het niet dan nemen ze allebei 3 strafpunten
200. Spel — iedereen schrijft in het geheim op wie volgens hem/haar de hele avond het meest geluk heeft gehad. De speler met de meeste stemmen mag 10 strafpunten uitdelen.

---

## Lijst 3

201. Naam geef 3 strafpunten aan degene die volgens jou het slechtst kan kaartlezen
202.  Spel stem allemaal tegelijk wie het meest waarschijnlijk zonder voorbereiding een speech zou geven deze krijgt 4 strafpunten
203.  Naam noem binnen 5 seconden 5 dingen die je in een rugzak kunt vinden
204.  Virus naam mag vanaf nu alleen antwoorden met woorden die uit precies 4 letters bestaan
205.  Iedereen die ooit zijn telefoon heeft opgeladen terwijl hij boven de 80% zat neemt 2 strafpunten
206.  Naam kies iemand die 20 seconden moet praten alsof hij een geheim agent is
207.  Spel noem om de beurt dingen die je absoluut niet in een lift wilt meemaken, herhaling is 3 strafpunten
208.  Naam deel 4 strafpunten uit aan degene die volgens jou het makkelijkst te overtuigen is
209.  Virus naam moet iedere keer dat iemand drinkt een denkbeeldige toast uitbrengen
210.  Degene met de meeste muntjes in zijn zak mag 4 strafpunten uitdelen
211.  Naam doe een verkooppraatje van 20 seconden voor het dichtstbijzijnde object
212.  Spel stem wie het meest waarschijnlijk een jaar zonder vakantie zou kunnen
213.  Naam noem 4 dingen die je met een schoen kunt doen behalve lopen
214.  Virus naam moet vanaf nu praten alsof hij een mysterieuze schurk is
215.  Iedereen die ooit een afspraak is vergeten neemt 3 strafpunten
216.  Naam kies iemand die jou 3 woorden geeft waarmee jij een verhaal moet verzinnen
217.  Spel noem om de beurt Nederlandse snacks, degene die niets weet krijgt 3 strafpunten
218.  Naam geef 5 strafpunten aan degene die volgens jou het meest eigenwijs is
219.  Virus iedereen moet bij het woord "glas" zijn glas aanraken, anders 1 strafpunt
220.  De speler met de meeste verschillende apps op zijn telefoon neemt 3 strafpunten
221.  Naam verzin een nieuwe bijnaam voor jezelf en gebruik die de komende 5 vragen
222.  Spel stem wie het meest waarschijnlijk een eigen bedrijf zou beginnen en meteen failliet zou gaan
223.  Naam noem binnen 10 seconden 5 dingen die je op een bureau kunt vinden
224.  Virus naam moet iedere zin beginnen met "als ik eerlijk ben"
225.  Iedereen die ooit zijn huis uit is gegaan zonder te weten waar hij naartoe ging neemt 2 strafpunten
226.  Naam kies iemand die 15 seconden lang moet doen alsof hij een stand-upcomedian is
227.  Spel noem om de beurt dingen die je bij een tankstation kunt ruiken
228.  Naam geef 3 strafpunten aan degene die volgens jou het meest dramatisch kan reageren
229.  Virus naam moet na iedere vraag eerst drie seconden nadenken
230.  De speler die het laatst zijn schoenen heeft gekocht neemt 3 strafpunten
231.  Naam vertel een verhaal waarin je linkerbuurman de hoofdrol speelt
232.  Spel stem wie het meest waarschijnlijk een hele dag zijn telefoon kwijt zou zijn
233.  Virus naam mag vanaf nu geen woord gebruiken dat eindigt op een N
234.  Iedereen die ooit zijn sleutels in zijn eigen hand heeft gezocht neemt 3 strafpunten
235.  Naam noem 5 dingen die je nooit in een schoenendoos zou bewaren
236.  Spel noem om de beurt dingen die je op een camping kunt horen
237.  Naam geef 4 strafpunten aan degene die volgens jou het beste kan improviseren
238.  Virus naam moet vanaf nu alles zeggen alsof hij een voetbalcommentator is
239.  De speler met de meeste screenshots op zijn telefoon neemt 3 strafpunten
240.  Naam kies iemand die een reclame moet maken voor zijn eigen outfit
241.  Spel stem wie het meest waarschijnlijk een dag te laat op zijn eigen vakantie zou vertrekken
242.  Naam noem 5 woorden die beginnen met dezelfde letter als je achternaam
243.  Virus naam moet iedere keer als hij een strafpunt krijgt "ik accepteer mijn lot" zeggen
244.  Iedereen die ooit een wachtwoord opnieuw heeft moeten aanvragen neemt 2 strafpunten
245.  Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een geheim avontuur zou beginnen
246.  Spel noem om de beurt dingen die je bij een snackbar kunt bestellen
247.  Naam doe 10 seconden alsof je een zeer slechte goochelaar bent
248.  Virus naam moet vanaf nu iedereen aanspreken alsof ze zijn collega zijn
249.  De persoon met de minste foto's in zijn galerij neemt 3 strafpunten
250.  Naam vertel binnen 15 seconden waarom jij de ideale kandidaat bent voor een realityshow
251. Spel stem wie het meest waarschijnlijk zonder geld toch op vakantie zou gaan
252. Naam noem 5 dingen die je kunt vinden onder een bed
253. Virus naam moet iedere keer dat hij gaat drinken eerst "gezondheid" zeggen
254. Iedereen die ooit een film heeft gekeken en halverwege in slaap viel neemt 2 strafpunten
255. Naam geef 4 strafpunten aan degene die volgens jou het slechtst kan plannen
256. Spel noem om de beurt dingen die je op een kermis kunt winnen
257. Naam kies iemand die een dramatische liefdesverklaring aan een stoel moet geven
258. Virus naam mag vanaf nu alleen antwoorden met ja, nee of misschien
259. De speler met de hoogste schermhelderheid neemt 3 strafpunten
260. Naam verzin binnen 10 seconden een nieuwe sport en leg de regels uit
261. Spel stem wie het meest waarschijnlijk een verkeerde naam zou gebruiken tijdens een voorstelronde
262. Naam geef 3 strafpunten aan degene die volgens jou het slechtst kan koken
263. Virus naam moet iedere zin afsluiten met "zoals u begrijpt"
264. Iedereen die ooit te lang heeft gezocht naar iets dat recht voor zijn neus lag neemt 2 strafpunten
265. Naam noem 5 dingen die je in een bioscoop kunt kopen
266. Spel noem om de beurt dingen die je in een kelder kunt vinden
267. Naam kies iemand die 20 seconden lang moet doen alsof hij een nieuwslezer is die live verslag doet van jullie avond
268. Virus naam mag vanaf nu alleen praten met zijn handen en gezichtsuitdrukkingen
269. De speler met de meeste agenda-afspraken neemt 3 strafpunten
270. Naam geef 5 strafpunten aan degene die volgens jou het snelst een nieuwe hobby zou beginnen
271. Spel stem wie het meest waarschijnlijk zijn eigen verjaardag zou vergeten
272. Naam noem binnen 8 seconden 5 dingen die blauw kunnen zijn
273. Virus naam moet bij iedere zin een woord fluisteren
274. Iedereen die ooit een bericht heeft geschreven en daarna meer dan 5 minuten heeft gewacht met verzenden neemt 2 strafpunten
275. Naam verzin een bijnaam voor iedere speler
276. Spel noem om de beurt dingen die je bij een zwembad nodig hebt
277. Naam geef 4 strafpunten aan degene die volgens jou het meest slecht tegen verveling kan
278. Virus naam moet vanaf nu praten alsof hij een beroemde professor is
279. De speler met de meeste muziek op zijn telefoon neemt 3 strafpunten
280. Naam kies iemand die 10 seconden lang een denkbeeldige hond moet uitlaten
281. Spel stem wie het meest waarschijnlijk een huisdier met een compleet vreemde naam zou nemen
282. Naam noem 4 dingen die je niet in een broodtrommel wilt vinden
283. Virus naam mag geen woorden gebruiken met de letter O
284. Iedereen die ooit een cadeau heeft gekocht op de dag dat hij het moest geven neemt 3 strafpunten
285. Naam geef 3 strafpunten aan degene die volgens jou het beste kan bluffen
286. Spel noem om de beurt dingen die je op een zolder kunt horen
287. Naam vertel in 20 seconden hoe je een buitenaards wezen zou overtuigen dat je aardig bent
288. Virus naam moet iedere keer dat iemand hem aankijkt zijn wenkbrauwen optrekken
289. De speler met de grootste telefoon neemt 2 strafpunten
290. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een hele nacht wakker blijft
291. Spel stem wie het beste een geheim agent zou kunnen spelen
292. Naam noem binnen 5 seconden 5 dingen die je op een bureau kunt gooien
293. Virus naam moet vanaf nu iedere zin beginnen met "dames en heren"
294. Iedereen die ooit een wekker heeft uitgezet zonder wakker te worden neemt 3 strafpunten
295. Naam kies iemand die zijn beste imitatie van een docent moet doen
296. Spel noem om de beurt dingen die je tijdens een verhuizing nodig hebt
297. Naam geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk spontaan zou gaan kamperen
298. Virus naam moet vanaf nu praten alsof hij een slechte superheld is
299. De persoon die het laatst zijn telefoon heeft vervangen neemt 3 strafpunten
300. Naam verzin een slogan voor de speler tegenover je
301. Spel stem wie het meest waarschijnlijk een onbekende zou aanspreken alsof hij hem al jaren kent
302. Naam noem 5 dingen die je in een badkamer kunt laten vallen
303. Virus naam moet na iedere zin "over" zeggen
304. Iedereen die ooit een maaltijd heeft besteld en iets compleet anders kreeg neemt 3 strafpunten
305. Naam geef 5 strafpunten aan degene die volgens jou het meest koppig is bij discussies
306. Spel noem om de beurt dingen die je op een treinstation kunt vinden
307. Naam kies iemand die een sollicitatiegesprek moet voeren voor de functie "professioneel feestbeest"
308. Virus naam mag alleen nog maar praten in de derde persoon
309. De speler met de meeste contacten in zijn telefoon neemt 4 strafpunten
310. Naam vertel een verhaal waarin drie willekeurige voorwerpen op tafel voorkomen
311. Spel stem wie het meest waarschijnlijk zijn eigen wachtwoord zou vergeten
312. Naam noem 5 dingen die je op een strand kunt vinden
313. Virus naam moet iedere keer dat iemand zijn naam zegt een saluut brengen
314. Iedereen die ooit een uur te vroeg ergens was neemt 2 strafpunten
315. Naam geef 3 strafpunten aan degene die volgens jou het beste kan liegen
316. Spel noem om de beurt dingen die je in een hotel kunt vragen
317. Naam moet een denkbeeldige prijs uitreiken aan de speler rechts van je
318. Virus naam mag vanaf nu geen Engelse woorden gebruiken
319. De speler met de meeste foto's van zichzelf neemt 3 strafpunten
320. Naam kies iemand die 15 seconden moet doen alsof hij een beroemde chef-kok is
321. Spel stem wie het meest waarschijnlijk een eigen boek zou schrijven
322. Naam noem 5 dingen die je in een garage kunt repareren
323. Virus naam moet iedere zin eindigen met "toch?"
324. Iedereen die ooit een bericht heeft gestuurd zonder te weten naar wie neemt 3 strafpunten
325. Naam geef 4 strafpunten aan degene die volgens jou het snelst een discussie begint
326. Spel noem om de beurt dingen die je in een pretpark kunt horen
327. Naam vertel waarom je rechterbuurman geschikt zou zijn als burgemeester
328. Virus naam moet vanaf nu extreem langzaam praten
329. De speler met de meeste foto's van eten neemt 3 strafpunten
330. Naam noem binnen 7 seconden 5 dingen die kunnen vliegen
331. Spel stem wie het meest waarschijnlijk op een dag besluit om alles om te gooien
332. Naam kies iemand die een motivatiebrief moet voordragen voor een baan als astronaut
333. Virus naam mag het woord "ik" niet meer gebruiken
334. Iedereen die ooit een hele aflevering heeft gemist omdat hij op zijn telefoon zat neemt 2 strafpunten
335. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een weddenschap aangaat zonder de regels te kennen
336. Spel noem om de beurt dingen die je in een supermarkt bij de kassa kunt vinden
337. Naam noem een compliment voor iedere speler zonder hetzelfde soort compliment te gebruiken
338. Virus naam moet iedere keer als iemand lacht ook kort lachen
339. De speler met de meeste foto's van vakanties neemt 3 strafpunten
340. Naam vertel binnen 20 seconden hoe jij een bank zou beroven zonder daadwerkelijk een misdrijf te beschrijven
341. Spel stem wie het beste zou zijn als quizmaster
342. Naam noem 5 dingen die je nooit op een eerste werkdag moet doen
343. Virus naam moet vanaf nu alles zeggen alsof hij een detective is
344. Iedereen die ooit een naam heeft vergeten terwijl hij iemand voorstelde neemt 3 strafpunten
345. Naam geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk een onverwachte carrièreswitch maakt
346. Spel noem om de beurt dingen die je op een vliegveld kunt kopen
347. Naam kies iemand die een dramatische weerpresentatie moet geven over de kamer
348. Virus naam mag alleen nog antwoorden met volledige zinnen van minimaal 5 woorden
349. De speler die het laatst een nieuw nummer heeft geluisterd neemt 2 strafpunten
350. Naam verzin een nieuwe feestdag en leg uit wat iedereen op die dag moet doen
351. Spel stem wie het meest waarschijnlijk een week zonder sociale media zou volhouden
352. Naam noem binnen 5 seconden 5 dingen die je op een zolder niet wilt tegenkomen
353. Virus naam moet iedere keer als hij een vraag krijgt eerst "dat is een interessante kwestie" zeggen
354. Iedereen die ooit zijn telefoon heeft opgeladen met een kabel die eigenlijk te kort was neemt 2 strafpunten
355. Naam geef 3 strafpunten aan degene die volgens jou het beste kan overtuigen
356. Spel noem om de beurt dingen die je in een schooltas kunt vinden
357. Naam kies iemand die een reclame moet maken voor zijn eigen voornaam
358. Virus naam moet vanaf nu praten alsof hij een slechte rapper is
359. De speler die het meest recent zijn bed heeft verschoond neemt 3 strafpunten
360. Naam noem 5 dingen die je op een parkeerplaats kunt zien
361. Spel stem wie het meest waarschijnlijk een compleet nutteloze aankoop zou doen
362. Naam geef 5 strafpunten aan degene die volgens jou het snelst een vreemde situatie ongemakkelijk maakt
363. Virus naam moet iedere keer dat hij drinkt een denkbeeldige microfoon vasthouden
364. Iedereen die ooit een bericht heeft gelezen en expres pas uren later heeft geantwoord neemt 3 strafpunten
365. Naam noem 4 dingen die je in een vliegtuig niet mag doen
366. Spel noem om de beurt soorten winkels, herhaling betekent 3 strafpunten
367. Naam kies iemand die 20 seconden lang moet doen alsof hij een rondleiding door deze kamer geeft
368. Virus naam mag vanaf nu alleen praten alsof hij op televisie is
369. De speler met de meeste ongebruikte apps neemt 4 strafpunten
370. Naam geef 3 strafpunten aan degene die volgens jou het meest waarschijnlijk een verkeerde beslissing zou verdedigen
371. Spel stem wie het beste een groep onbekenden zou kunnen entertainen
372. Naam noem binnen 10 seconden 5 dingen met een rits
373. Virus naam moet na iedere zin zijn eigen naam zeggen
374. Iedereen die ooit een foto heeft gemaakt en hem daarna meteen heeft verwijderd neemt 2 strafpunten
375. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een hele dag zonder plan zou rondlopen
376. Spel noem om de beurt dingen die je bij een kapper kunt vinden
377. Naam kies iemand die zijn meest serieuze gezicht moet houden terwijl iedereen hem probeert te laten lachen
378. Virus naam mag vanaf nu geen woorden gebruiken met de letter I
379. De speler met de oudste profielfoto op zijn telefoon neemt 3 strafpunten
380. Naam vertel waarom de speler links van je geschikt zou zijn als spion
381. Spel stem wie het meest waarschijnlijk een eigen festival zou organiseren
382. Naam noem 5 dingen die je in een koffer kunt vergeten
383. Virus naam moet iedere keer als iemand "nee" zegt zijn glas aanraken
384. Iedereen die ooit een bestelling heeft gevolgd terwijl die nog niet eens onderweg was neemt 2 strafpunten
385. Naam geef 4 strafpunten aan degene die volgens jou het meest waarschijnlijk een geheim plan heeft
386. Spel noem om de beurt dingen die je in een pretpark niet wilt verliezen
387. Naam kies iemand die 15 seconden lang moet praten alsof hij een ouderwetse radio-presentator is
388. Virus naam moet vanaf nu alles zeggen alsof hij een advocaat is
389. De speler met de meeste video's in zijn galerij neemt 3 strafpunten
390. Naam noem 6 dingen die je kunt aantrekken behalve kleding
391. Spel stem wie het meest waarschijnlijk als eerste een nieuwe telefoon koopt
392. Naam geef 5 strafpunten aan degene die volgens jou het meest waarschijnlijk een impulsieve vakantie boekt
393. Virus naam mag vanaf nu alleen nog antwoorden nadat hij één keer in zijn handen heeft geklapt
394. Iedereen die ooit zijn telefoon heeft gezocht terwijl hij hem hoorde afgaan neemt 3 strafpunten
395. Naam vertel een verhaal van precies 15 seconden waarin je een banaan, een fiets en een burgemeester gebruikt
396. Spel noem om de beurt dingen die je tijdens een barbecue kunt verbranden
397. Naam kies iemand die een denkbeeldige prijs moet winnen voor "meest verdachte speler van de avond"
398. Virus naam moet vanaf nu iedere vraag beantwoorden alsof hij de vraag totaal verkeerd heeft begrepen
399. Naam geef 3 strafpunten aan degene die volgens jou het meest waarschijnlijk morgen spijt heeft van iets wat hij vanavond doet
400. Doe met zn allen een ronde Maxen als er dubbele zijn voeg ze dan niet toe

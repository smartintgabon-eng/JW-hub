const themeTitle = "https://www.jw.org/fr/biblioth%C3%A8que/revues/tour-de-garde-etude-mars-2024/Des-jeunes-qui-r%C3%A9jouissent-le-c%C5%93ur-de-J%C3%A9hovah/";
let finalThemeTitle = themeTitle || "Analyse";
if (finalThemeTitle.startsWith('http')) {
    finalThemeTitle = "Analyse de l'article";
}
console.log(finalThemeTitle);

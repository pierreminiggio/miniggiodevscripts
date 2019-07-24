var cron = require('node-cron');
const puppeteer = require('puppeteer');

// On récupère les ids
let ids = require('./ids.js');

const pullPosts = async (ids) => {

  // Créer une instance de navigateur
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Naviguer jusqu'à l'URL cible
  await page.goto(ids.url);

  // Récupérer les données
  var posts = await page.evaluate(() => {
    let posts = document.querySelector('body').innerHTML;
    return JSON.parse(posts);
  });
  

  // Retourner les données (et fermer le navigateur)
  browser.close();
  return posts;
}

const postToPage = async (ids, qualityContent) => {

  // Créer une instance de navigateur
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Naviguer jusqu'à l'URL cible
  await page.goto('https://www.facebook.com/');
  
  // Connexion si pas connecté
  var login = await page.evaluate((ids) => {
    document.querySelector('#email').value = ids.mail;
    document.querySelector('#pass').value = ids.pass;
  }, ids);

  await page.click(
    '#loginbutton',
  )
  await page.waitFor(1000); // fait une pause d'une seconde

  // On va sur le groupe des boosted
  await page.goto('https://www.facebook.com/'+ids.page+'/');


  await page.waitFor(1000); // fait une pause d'une seconde

  // use keyboard shortcut to open and focus on create new post
  await page.keyboard.press('KeyP');

  // wait for emoji icon as proxy for "loaded and post ready"
  await page.waitFor('button[data-testid="react-composer-post-button"][type="submit"]');

  // keyboard shortcut put focus in place so we can just type
  await page.keyboard.type(qualityContent);

  // click submit
  await page.click('button[data-testid="react-composer-post-button"][type="submit"]');

  // Retourner les données (et fermer le navigateur)
  browser.close();
  return [];
}

function letsGo () {
  console.log('Récupération des posts');

  // Appelle la fonction pullPosts() et affichage les données retournées
  pullPosts(ids).then(posts => {
    var qualityContent = '';
    var i = 0;
    for (let [key, value] of Object.entries(posts)) {
      qualityContent += value.texte_brut;
    }

    // Postage sur le groupe des boosted
    postToPage(ids, qualityContent).then(result => {

    });
  });
}

letsGo();
// Tous les 3mn
cron.schedule('* * * * *', () => {
  letsGo();
});

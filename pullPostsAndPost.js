var cron = require('node-cron');
const puppeteer = require('puppeteer');

// On récupère les ids
let ids = require('./ids.js');

const pullPost = async (ids) => {

  // Créer une instance de navigateur
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Naviguer jusqu'à l'URL cible
  await page.goto(ids.url);

  // Récupérer les données
  var post = await page.evaluate(() => {
    let daPost = document.querySelector('pre').innerHTML;
    return JSON.parse(daPost);
  });

  // Retourner les données (et fermer le navigateur)
  browser.close();
  return post;
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

   await page.waitFor(3000); // fait une pause de 3 secondes

  // Retourner les données (et fermer le navigateur)
  browser.close();
  return [];
}

function letsGo () {
  console.log('Récupération du post');

  // Appelle la fonction pullPost() et affichage les données retournées
  pullPost(ids).then(post => {
    console.log('post récupéré');
    if (post.text != undefined) {
      var qualityContent = post.text;
      console.log(qualityContent);

      // Postage sur la meilleure page de shitposting
      postToPage(ids, qualityContent).then(result => {
        console.log('post posté');
      });

    }
  });
}

letsGo();
// Tous les 3mn
cron.schedule('* * * * *', () => {
  letsGo();
});

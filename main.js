// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');

Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://apify.com/docs/actor/input-schema
    const input = await Apify.getInput();
    
    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();
    
    console.log(`Opening page ${input.url}...`);

    if (!input || !input.url) {
        throw new Error('Input must be a JSON object with the "url" field!')
    };

    const page = await browser.newPage();
    await page.goto(input.url);
    const elements = [await page.$(".page-title"), await page.$(".product-new-price"), await page.$("span.label")];
    const title = await page.evaluate(el => el.innerText, elements[0]);
    const price = await page.evaluate(el => `${el.childNodes[0].nodeValue.replace(/\s/g,'')}, ${el.children[0].innerText} ${el.children[1].innerText}` , elements[1]);
    const stock = await page.evaluate(function(el) {return el.classList.contains('label-in_stock') || el.innerText.classList.contains('label-limited_stock_qty') ? 'inStock' : 'OutOfStock'}, elements[2]);

    console.log('Saving output...');
    await Apify.setValue('OUTPUT', {
        title,
        price,
        stock,
        url: input.url
    });

    console.log('Closing Puppeteer...');
    await browser.close();

    console.log('Done.');
});

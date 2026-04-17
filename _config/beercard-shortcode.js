import qrCodeShortcode from './qrcode-shortcode.js';
import pintGlassShortcode from './pintglass-shortcode.js';
import metadata from '../_data/metadata.js';

export default async function beerCardShortcode(tapNo, item) {
    try {

        var recipeUrl = "";
        var qrUrl = "";
        if(item.recipe.startsWith("http"))
        {
            recipeUrl = item.recipe;
            qrUrl = recipeUrl;
        }
        else 
        {
            recipeUrl = "/recipes/" + item.recipe;
            qrUrl = metadata.url + "/recipes/" + item.recipe;
        }

        const recipelinkHtml = item.recipe
            ? `<a href="${recipeUrl}">${item.name}</a>`
            : item.name;

        const qrcodeHtml = item.recipe ?
            await qrCodeShortcode(qrUrl, 70, "QR code for " + item.name + " recipe")
            : "";

        const pintglassSvg = pintGlassShortcode(item.colour, 36, 40);

        return `
        <div class="beer-card">
            <div class="row">
                <div class="left">
                <div class="beer-name"><span>Tap ${tapNo}: ${recipelinkHtml}</span></div>
                <div class="beer-details">
                    <span class="beer-colour">${pintglassSvg}</span>
                    <span class="beer-style">${item.style}</span>
                    <span class="beer-abv">${item.abv}</span>
                </div>
                </div>
                <div class="beer-qr right">
                ${qrcodeHtml}
                </div>
            </div>
            <div class="beer-notes row">${item.notes}</div>
        </div>
    `;
    }
    catch (error) {
        console.error('QR Code generation error:', error);
        return error;
        //return `<div class="qrcode-error">QR Code generation failed: ` + error + `</div>`;
    }
}
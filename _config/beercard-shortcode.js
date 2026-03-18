import qrCodeShortcode from './qrcode-shortcode.js';
import metadata from '../_data/metadata.js';

export default async function beerCardShortcode(tapNo, item) {
    try {
        const recipelinkHtml = item.recipe
            ? `<a href="/recipes/${item.recipe}">${item.name}</a>`
            : item.name;

        const qrcodeHtml = item.recipe ?
            await qrCodeShortcode(metadata.url + "/recipes/" + item.recipe, 50, "QR code for " + item.name + " recipe")
            : "";

        return `
        <div class="beer-card">
        <div class="row">
            <div class="left">
            <div class="beer-name"><span>Tap ${tapNo}: ${recipelinkHtml}</span></div>
            <div class="beer-details">
                <span class="beer-colour ${item.colour}"></span>
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
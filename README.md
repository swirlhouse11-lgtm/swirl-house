# Swirl House website

**Owner / contact**
- Name: Bashiru Fadil Oluwashubomi
- Phone: 09078097713
- Email: fadilbasiru18@gmail.com

Black and gold, scroll-animated ordering website for Swirl House (School of Midwifery, Back of Midwifery Market, Asaba).
Every order goes to WhatsApp: +234 904 685 3140.

## Open it in VS Code
1. Open the `swirl-house` folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension, right-click `index.html` and choose "Open with Live Server".
   You can also just double-click `index.html` to open it in your browser.

## How the scrolling works
- Hero: the logo, headline and food photos drift apart as you scroll.
- The Combo: shawarma, ice cream and a drink pull apart with labels.
- Packages: scrolling down slides the package cards sideways.
- The Lineup: the normal menu grid.
The scroll logic is in `js/app.js` (search for `Scenes`) and the motion is in `css/style.css` (search for `scroll scenes`).
People who have "reduce motion" turned on in their phone settings get a plain, non-animated layout.
Fonts (Anton, Jost, Parisienne) load from Google Fonts, so they need an internet connection.

## What is in the folder
- `index.html`  the page shell
- `css/style.css`  all colours, fonts and layout (gold is `--gold`, black is `--ink` at the top)
- `js/data.js`  menu items, prices, WhatsApp number, address, PIN
- `js/images.js`  which picture belongs to which item
- `js/app.js`  the website logic: menu, order basket, WhatsApp message, admin page
- `images/`  the food photos, logo and gold stamp, cut from your two flyers

## Change prices, items or the WhatsApp number
Quickest way: open the site, add `#admin` to the end of the address (or tap Admin at the bottom),
sign in, edit, then press "Download updated menu file". Put the downloaded `data.js` in the `js` folder
(replace the old one) and upload the folder again.
You can also edit `js/data.js` directly in VS Code. The WhatsApp number is written with the Nigerian
country code and no leading 0: `2349046853140`.

Admin PIN to start with: `swirl2026`. Change it in Admin > Settings, then download the menu file.
The PIN is only a light lock on the admin screen. Anyone who can change your files can change the menu.

## Better pictures
The photos were cut from the flyers, which are small images. They have been enlarged and sharpened,
but a true 4K photo needs the original high-resolution picture. If you have the originals, save them in
`images/` with the same file names (for example `classic.jpg`). Pictures around 1600 px wide are plenty.

## Put it online
Upload the whole `swirl-house` folder to any web host. Free options: Netlify (drag and drop the folder),
GitHub Pages or Cloudflare Pages.

## Payments
The site does not take money itself. For bank transfer, add your account details in Admin > Settings.
The customer pays, sends the payment screenshot in the WhatsApp chat, and you confirm there.

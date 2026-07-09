#!/usr/bin/env node

/**
 * Texture Downloader for Symplectica
 * Fetches high-resolution planetary textures from Solar System Scope.
 * 
 * Usage:
 *   node download_textures.js [--force]
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'client', 'public', 'local', 'textures', 'planets');

const filesToDownload = {
    '2k_sun.jpg': 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg',
    '2k_mercury.jpg': 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
    '2k_venus_surface.jpg': 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
    '2k_venus_atmosphere.jpg': 'https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg',
    '2k_earth_daymap.jpg': 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
    '2k_earth_clouds.jpg': 'https://www.solarsystemscope.com/textures/download/2k_earth_clouds.jpg',
    '2k_moon.jpg': 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
    '2k_mars.jpg': 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
    '2k_jupiter.jpg': 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
    '2k_saturn.jpg': 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
    '2k_saturn_ring_alpha.png': 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png',
    '2k_uranus.jpg': 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
    '2k_neptune.jpg': 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg'
};

const args = process.argv.slice(2);
const force = args.includes('--force');

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        if (!force && fs.existsSync(dest)) {
            console.log(`[\x1b[33mSKIP\x1b[0m] ${path.basename(dest)} (Already exists)`);
            resolve();
            return;
        }

        console.log(`[\x1b[36mFETCH\x1b[0m] ${path.basename(dest)}...`);

        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirects
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }

            const file = fs.createWriteStream(dest);
            response.pipe(file);
            
            file.on('finish', () => {
                file.close(resolve);
                console.log(`[\x1b[32mOK\x1b[0m]    ${path.basename(dest)}`);
            });
        }).on('error', (err) => {
            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest);
            }
            reject(err);
        });
    });
}

async function main() {
    console.log('\x1b[1m\x1b[34m=== Symplectica High-Res Texture Downloader ===\x1b[0m\n');
    console.log(`Target Directory: ${targetDir}`);
    
    ensureDirectoryExists(targetDir);

    let successCount = 0;
    let failCount = 0;

    for (const [filename, url] of Object.entries(filesToDownload)) {
        const dest = path.join(targetDir, filename);
        try {
            await downloadFile(url, dest);
            successCount++;
        } catch (e) {
            console.error(`[\x1b[31mERROR\x1b[0m] Failed to download ${filename}: ${e.message}`);
            failCount++;
        }
    }

    console.log('\n\x1b[1mDownload Complete!\x1b[0m');
    console.log(`Total Success: ${successCount}`);
    if (failCount > 0) {
        console.error(`Total Failed:  ${failCount}`);
        process.exit(1);
    }
}

main().catch(console.error);

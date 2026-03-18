#!/usr/bin/env node
/**
 * Check for unused i18n keys in locale files.
 * Usage: node scripts/check-i18n.js [--fix]
 *   --fix  Remove unused keys and sort all keys alphabetically
 *
 * In CI (no --fix), exits with code 1 if any issues are found:
 *   - unused keys
 *   - misalignment between en.json and zh.json
 *   - keys not in alphabetical order
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LOCALES_DIR = path.join(__dirname, '../src/renderer/src/i18n/locales');
const SRC_DIR = path.join(__dirname, '../src');
const FIX = process.argv.includes('--fix');

let hasErrors = false;

function flattenKeys(obj, prefix = '') {
    const keys = [];
    for (const [k, v] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null) {
            keys.push(...flattenKeys(v, full));
        } else {
            keys.push(full);
        }
    }
    return keys;
}

function isKeyUsed(key) {
    try {
        execSync(`grep -r "'${key}'" "${SRC_DIR}" --include='*.ts' --include='*.tsx' -l`, {
            stdio: 'pipe',
        });
        return true;
    } catch {
        return false;
    }
}

function deleteKey(obj, keyPath) {
    const parts = keyPath.split('.');
    let cur = obj;
    for (const part of parts.slice(0, -1)) {
        cur = cur[part];
    }
    delete cur[parts[parts.length - 1]];
}

function removeEmptySections(obj) {
    for (const k of Object.keys(obj)) {
        if (typeof obj[k] === 'object' && obj[k] !== null && Object.keys(obj[k]).length === 0) {
            delete obj[k];
        }
    }
}

function sortKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    const sorted = {};
    for (const key of Object.keys(obj).sort()) {
        sorted[key] =
            typeof obj[key] === 'object' && obj[key] !== null ? sortKeys(obj[key]) : obj[key];
    }
    return sorted;
}

function getAllKeys(obj, prefix = '') {
    const keys = new Set();
    for (const [k, v] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${k}` : k;
        keys.add(full);
        if (typeof v === 'object' && v !== null) {
            for (const subKey of getAllKeys(v, full)) {
                keys.add(subKey);
            }
        }
    }
    return keys;
}

function checkAlignment(enData, zhData) {
    const enKeys = getAllKeys(enData);
    const zhKeys = getAllKeys(zhData);

    const onlyInEn = [...enKeys].filter(k => !zhKeys.has(k));
    const onlyInZh = [...zhKeys].filter(k => !enKeys.has(k));

    if (onlyInEn.length === 0 && onlyInZh.length === 0) {
        console.log('\n✓ en.json and zh.json are aligned');
        return;
    }

    hasErrors = true;
    console.log('\n⚠ Alignment issues found:');
    if (onlyInEn.length > 0) {
        console.log(`\n  Keys in en.json but not in zh.json (${onlyInEn.length}):`);
        onlyInEn.sort().forEach(k => console.log(`    - ${k}`));
    }
    if (onlyInZh.length > 0) {
        console.log(`\n  Keys in zh.json but not in en.json (${onlyInZh.length}):`);
        onlyInZh.sort().forEach(k => console.log(`    - ${k}`));
    }
}

function checkOrder(obj, prefix = '') {
    const keys = Object.keys(obj);
    const sorted = [...keys].sort();
    const outOfOrder = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== sorted[i]) {
            const full = prefix ? `${prefix}.${keys[i]}` : keys[i];
            outOfOrder.push(`${full} (expected: ${prefix ? `${prefix}.` : ''}${sorted[i]})`);
        }
        if (typeof obj[keys[i]] === 'object' && obj[keys[i]] !== null) {
            outOfOrder.push(...checkOrder(obj[keys[i]], prefix ? `${prefix}.${keys[i]}` : keys[i]));
        }
    }
    return outOfOrder;
}

const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
const localeData = {};

for (const file of localeFiles) {
    const filePath = path.join(LOCALES_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const keys = flattenKeys(data);

    const unused = keys.filter(key => !isKeyUsed(key));

    if (unused.length === 0) {
        console.log(`✓ ${file}: all keys are used`);
    } else {
        hasErrors = true;
        console.log(`\n${FIX ? '🗑' : '⚠'} ${file}: ${unused.length} unused key(s)`);
        for (const key of unused) {
            console.log(`  - ${key}`);
        }

        if (FIX) {
            for (const key of unused) {
                try {
                    deleteKey(data, key);
                } catch {}
            }
            removeEmptySections(data);
            console.log(`  → removed from ${file}`);
        }
    }

    if (FIX) {
        const sorted = sortKeys(data);
        fs.writeFileSync(filePath, JSON.stringify(sorted, null, 4) + '\n');
        localeData[file] = sorted;
    } else {
        // Check sort order
        const outOfOrder = checkOrder(data);
        if (outOfOrder.length > 0) {
            hasErrors = true;
            console.log(`\n⚠ ${file}: ${outOfOrder.length} key(s) not in alphabetical order:`);
            outOfOrder.forEach(k => console.log(`  - ${k}`));
            console.log(`  → Run with --fix to sort automatically`);
        } else {
            console.log(`✓ ${file}: keys are sorted`);
        }
        localeData[file] = data;
    }
}

if (!FIX) {
    console.log('\nRun with --fix to remove unused keys and sort alphabetically.');
}

// Check alignment between en.json and zh.json
if (localeData['en.json'] && localeData['zh.json']) {
    checkAlignment(localeData['en.json'], localeData['zh.json']);
}

if (hasErrors && !FIX) {
    process.exit(1);
}

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const ROOT = new URL('../', import.meta.url);

const EXTRACTED_ASSETS = [
  'ability-foudre-active.png', 'ability-foudre-passive.png', 'ability-foudre-tile.png',
  'arrow-left.png', 'arrow-right.png', 'button-claim-blank.png',
  'button-continue-blank.png', 'button-go-blank.png', 'button-gold-small-blank.png',
  'button-match-blank.png', 'button-pass-blank.png', 'button-price-blank.png',
  'button-price-small-blank.png', 'button-stone-small-blank.png',
  'character-artemis-archer.png', 'character-poseidon-trident.png', 'character-zeus.png',
  'chimera.png', 'conversion-amphora.png', 'league-eagle.png',
  'offer-starter-characters.png', 'portrait-artemis.png', 'portrait-athena.png',
  'portrait-poseidon.png', 'reward-chest-red.png', 'reward-chest-silver.png',
  'reward-chest-wood.png', 'reward-crown.png', 'reward-gem-blue.png',
  'reward-gold-pile.png', 'reward-gold-sack.png', 'reward-gold-shard.png',
  'reward-ingots.png', 'reward-key.png', 'reward-lightning-blue.png',
  'reward-medusa-chibi.png', 'reward-medusa-head.png', 'reward-money-bag.png',
  'reward-potion-gold.png', 'reward-potion-green.png', 'reward-potion-pink.png',
  'reward-ticket.png', 'reward-zeus-card.png', 'weekly-hourglass.png',
];

test('les 44 extractions sont de vrais PNG avec un canal alpha', async () => {
  for (const name of EXTRACTED_ASSETS) {
    const bytes = await readFile(new URL(`../assets/ui/${name}`, import.meta.url));
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], name);
    assert.equal(bytes[25], 6, `${name} doit être encodé en RGBA`);
  }
});

test('les portraits et illustrations directement utiles sont déclarés statiquement pour Metro', async () => {
  const icons = await readFile(new URL('../src/ui/menu/icons.ts', import.meta.url), 'utf8');
  for (const name of [
    'portrait-athena.png',
    'portrait-poseidon.png',
    'league-eagle.png',
    'offer-starter-characters.png',
    'conversion-amphora.png',
  ]) {
    assert.match(icons, new RegExp(name.replace('.', '\\.')));
  }
});

test('le passe emploie les images extraites plutôt que des emojis de récompense', async () => {
  const pass = await readFile(new URL('../src/ui/menu/PassTab.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(pass, /(👑|🗝️|🏺|💰|🧰|🧪)/u);
  assert.match(pass, /PASS_REWARD_ART/);
  assert.match(pass, /image=\{reward\.image\}/);
});
